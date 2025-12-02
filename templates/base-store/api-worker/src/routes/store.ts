import { Hono } from 'hono';
import { resolveStore } from '../middleware/store-resolver';
import { Stripe } from 'stripe';
import { HTTPException } from 'hono/http-exception';
import { Store, Product, HonoEnv, ShippingAddress } from '../types';

const app = new Hono<HonoEnv>();

// Apply store resolution to all routes under /:slug
app.use('/:slug/*', resolveStore);

app.get('/:slug', (c) => {
    const store = c.get('store') as Store;
    // Transform to camelCase and ensure name field exists
    const storeResponse = toCamelCase({
        ...store,
        name: store.name || store.slug,
    });
    return c.json(storeResponse);
});

// Helper to transform snake_case to camelCase
function toCamelCase(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    if (typeof obj !== 'object') return obj;
    
    const result: any = {};
    for (const key in obj) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        result[camelKey] = toCamelCase(obj[key]);
    }
    return result;
}

app.get('/:slug/products', async (c) => {
    const store = c.get('store') as Store;
    const products = await c.env.DB.prepare('SELECT * FROM products WHERE store_id = ? AND is_active = 1').bind(store.id).all();
    const transformed = products.results.map((p: any) => ({
        ...toCamelCase(p),
        slug: createSlug(p.title),
    }));
    return c.json(transformed);
});

// Helper to create URL-friendly slug from title
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

app.get('/:slug/products/:idOrSlug', async (c) => {
    const store = c.get('store') as Store;
    const idOrSlug = c.req.param('idOrSlug');
    
    // First try to find by ID (for backwards compatibility)
    let product = await c.env.DB.prepare('SELECT * FROM products WHERE store_id = ? AND id = ?').bind(store.id, idOrSlug).first();
    
    // If not found by ID, search by slug (derived from title)
    if (!product) {
        const allProducts = await c.env.DB.prepare('SELECT * FROM products WHERE store_id = ? AND is_active = 1').bind(store.id).all();
        product = allProducts.results.find((p: any) => createSlug(p.title) === idOrSlug) || null;
    }

    if (!product) {
        throw new HTTPException(404, { message: 'Product not found' });
    }

    // Add slug to the response
    const productWithSlug = {
        ...toCamelCase(product),
        slug: createSlug((product as any).title),
    };

    return c.json(productWithSlug);
});

app.post('/:slug/checkout', async (c) => {
    const store = c.get('store') as Store;
    const body = await c.req.json<{
        items: { productId: string; quantity: number }[],
        email: string,
        shippingAddress?: ShippingAddress,
        successUrl?: string,
        cancelUrl?: string
    }>();

    if (!body.items || body.items.length === 0) {
        throw new HTTPException(400, { message: 'No items in cart' });
    }

    if (!body.email) {
        throw new HTTPException(400, { message: 'Email is required' });
    }

    const { items, email, shippingAddress, successUrl, cancelUrl } = body;

    // Fetch products to validate prices
    const productIds = items.map(i => i.productId);
    const placeholders = productIds.map(() => '?').join(',');
    const productsResult = await c.env.DB.prepare(`SELECT * FROM products WHERE store_id = ? AND id IN (${placeholders})`)
        .bind(store.id, ...productIds)
        .all();

    const products = productsResult.results.map(toCamelCase) as Product[];
    let totalCents = 0;

    for (const item of items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
            throw new HTTPException(400, { message: `Product ${item.productId} not found` });
        }
        if (product.stock !== undefined && product.stock < item.quantity) {
            throw new HTTPException(400, { message: `Not enough stock for ${product.title}` });
        }
        totalCents += product.priceCents * item.quantity;
    }

    const origin = c.req.header('origin') || 'http://localhost:5173';
    const finalSuccessUrl = successUrl || `${origin}/success`;
    const finalCancelUrl = cancelUrl || `${origin}/cart`;

    // Check if we're in test mode (no valid Stripe key)
    const stripeKey = c.env.STRIPE_SECRET_KEY;
    const isTestMode = !stripeKey || stripeKey === 'sk_test_...' || stripeKey.length < 20;

    if (isTestMode) {
        // TEST MODE: Create a mock order and redirect to success
        console.log('[TEST MODE] Creating mock checkout session');
        
        // Generate a mock session ID
        const mockSessionId = `test_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        // Create a test order in the database
        const orderId = `order_${Date.now()}`;
        try {
            await c.env.DB.prepare(`
                INSERT INTO orders (id, store_id, user_email, status, total_cents, currency, shipping_address, created_at)
                VALUES (?, ?, ?, 'paid', ?, 'usd', ?, datetime('now'))
            `).bind(
                orderId,
                store.id,
                email,
                totalCents,
                shippingAddress ? JSON.stringify(shippingAddress) : null
            ).run();
            
            // Create order items
            for (const item of items) {
                const product = products.find(p => p.id === item.productId)!;
                await c.env.DB.prepare(`
                    INSERT INTO order_items (id, order_id, product_id, quantity, price_cents, created_at)
                    VALUES (?, ?, ?, ?, ?, datetime('now'))
                `).bind(
                    `oi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    orderId,
                    item.productId,
                    item.quantity,
                    product.priceCents
                ).run();
                
                // Update stock
                await c.env.DB.prepare(`
                    UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
                `).bind(item.quantity, item.productId, item.quantity).run();
            }
        } catch (err) {
            console.log('[TEST MODE] Could not create order record:', err);
        }
        
        // Return mock checkout URL that goes directly to success page
        return c.json({ 
            checkoutUrl: `${finalSuccessUrl}?session_id=${mockSessionId}&test_mode=true`,
            testMode: true,
            orderId,
            totalCents
        });
    }

    // PRODUCTION MODE: Use real Stripe
    const lineItems = [];
    for (const item of items) {
        const product = products.find(p => p.id === item.productId)!;
        
        // Only include image URLs that are valid (not base64 and under 2048 chars)
        const images: string[] = [];
        if (product.imageUrl && 
            !product.imageUrl.startsWith('data:') && 
            product.imageUrl.length < 2048) {
            images.push(product.imageUrl);
        }
        
        lineItems.push({
            price_data: {
                currency: product.currency,
                product_data: {
                    name: product.title,
                    images,
                },
                unit_amount: product.priceCents,
            },
            quantity: item.quantity,
        });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${finalSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: finalCancelUrl,
        customer_email: email,
        metadata: {
            storeId: store.id,
            storeSlug: store.slug,
            items: JSON.stringify(items.map(i => ({ id: i.productId, q: i.quantity })))
        }
    });

    // Create order record for local testing (in production, this would be done via webhook)
    const orderId = `order_${Date.now()}`;
    try {
        await c.env.DB.prepare(`
            INSERT INTO orders (id, store_id, user_email, status, total_cents, currency, shipping_address, stripe_checkout_session_id, created_at)
            VALUES (?, ?, ?, 'pending', ?, 'usd', ?, ?, datetime('now'))
        `).bind(
            orderId,
            store.id,
            email,
            totalCents,
            shippingAddress ? JSON.stringify(shippingAddress) : null,
            session.id
        ).run();
        
        // Create order items and update stock
        for (const item of items) {
            const product = products.find(p => p.id === item.productId)!;
            await c.env.DB.prepare(`
                INSERT INTO order_items (id, order_id, product_id, quantity, price_cents, created_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            `).bind(
                `oi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                orderId,
                item.productId,
                item.quantity,
                product.priceCents
            ).run();
            
            // Update stock immediately (for local testing - in production this would be via webhook)
            await c.env.DB.prepare(`
                UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
            `).bind(item.quantity, item.productId, item.quantity).run();
        }
    } catch (err) {
        console.log('Could not create order record:', err);
    }

    return c.json({ checkoutUrl: session.url });
});

// Confirm order after returning from Stripe checkout
app.post('/:slug/orders/confirm', async (c) => {
    const store = c.get('store') as Store;
    const body = await c.req.json<{ sessionId: string }>();
    
    if (!body.sessionId) {
        throw new HTTPException(400, { message: 'Session ID is required' });
    }
    
    try {
        // Update the order status to 'paid' (stock was already decremented when order was created)
        await c.env.DB.prepare(`
            UPDATE orders SET status = 'paid', updated_at = datetime('now')
            WHERE stripe_checkout_session_id = ? AND store_id = ? AND status = 'pending'
        `).bind(body.sessionId, store.id).run();
        
        // Get the order to return the ID
        const order = await c.env.DB.prepare(`
            SELECT id FROM orders WHERE stripe_checkout_session_id = ? AND store_id = ?
        `).bind(body.sessionId, store.id).first();
        
        return c.json({ success: true, orderId: order?.id });
    } catch (err) {
        console.error('Failed to confirm order:', err);
        throw new HTTPException(500, { message: 'Failed to confirm order' });
    }
});

export const storeRouter = app;
