import { Hono } from 'hono';
import { Stripe } from 'stripe';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv } from '../types';

const app = new Hono<HonoEnv>();

app.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();

  if (!sig) {
    throw new HTTPException(400, { message: 'Missing stripe-signature header' });
  }

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    throw new HTTPException(400, { message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.metadata?.storeId) {
      console.error('Missing storeId in session metadata');
      return c.json({ received: true });
    }

    const storeId = session.metadata.storeId;
    const userEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
    const totalCents = session.amount_total || 0;
    const currency = session.currency || 'usd';
    const paymentIntentId = session.payment_intent as string;

    const orderId = `ord_${crypto.randomUUID().split('-')[0]}`;
    const paymentId = `pay_${crypto.randomUUID().split('-')[0]}`;

    // Transaction for atomicity would be ideal, but D1 batching is close enough for now
    const batch = [];

    // 1. Create Order
    batch.push(c.env.DB.prepare(
      `INSERT INTO orders (id, store_id, user_email, status, total_cents, currency, stripe_checkout_session_id, stripe_payment_intent_id)
       VALUES (?, ?, ?, 'paid', ?, ?, ?, ?)`
    ).bind(orderId, storeId, userEmail, totalCents, currency, session.id, paymentIntentId));

    // 2. Create Payment
    batch.push(c.env.DB.prepare(
      `INSERT INTO payments (id, store_id, order_id, amount_cents, currency, status, stripe_payment_intent_id)
       VALUES (?, ?, ?, ?, ?, 'succeeded', ?)`
    ).bind(paymentId, storeId, orderId, totalCents, currency, paymentIntentId));

    // 3. Create Order Items
    if (session.metadata.items) {
      try {
        const items = JSON.parse(session.metadata.items) as { id: string; q: number }[];
        for (const item of items) {
          const itemId = `oi_${crypto.randomUUID().split('-')[0]}`;
          // We need price, but for now we'll assume it was correct at checkout or fetch it.
          // To keep it simple and fast in webhook, we might skip price validation here or fetch it.
          // Let's just fetch the product price to be safe and accurate for records.
          // Optimization: fetch all at once.

          // For this MVP, we will insert with 0 price if we don't fetch, which is bad.
          // Let's do a quick fetch.
          const product = await c.env.DB.prepare('SELECT price_cents FROM products WHERE id = ?').bind(item.id).first<{ price_cents: number }>();
          const price = product?.price_cents || 0;

          batch.push(c.env.DB.prepare(
            `INSERT INTO order_items (id, order_id, product_id, quantity, price_cents)
             VALUES (?, ?, ?, ?, ?)`
          ).bind(itemId, orderId, item.id, item.q, price));

          // 4. Update Stock (Optional)
          batch.push(c.env.DB.prepare(
            'UPDATE products SET stock = stock - ? WHERE id = ? AND stock IS NOT NULL'
          ).bind(item.q, item.id));
        }
      } catch (e) {
        console.error('Error parsing items metadata', e);
      }
    }

    await c.env.DB.batch(batch);
  }

  return c.json({ received: true });
});

export const webhookRouter = app;
