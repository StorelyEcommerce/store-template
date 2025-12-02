import { Hono } from 'hono';
import { adminAuth } from '../middleware/auth';
import { HTTPException } from 'hono/http-exception';
import { Store, StoreThemeConfig, Product, Order, DEFAULT_THEME, HonoEnv } from '../types';

const app = new Hono<HonoEnv>();

app.use('*', adminAuth);

// --- Stores ---

app.get('/stores', async (c) => {
    const stores = await c.env.DB.prepare('SELECT * FROM stores').all();
    return c.json(stores.results);
});

app.post('/stores', async (c) => {
    const body = await c.req.json<{ slug: string; themeConfig?: Partial<StoreThemeConfig> }>();

    if (!body.slug) {
        throw new HTTPException(400, { message: 'Slug is required' });
    }

    const id = `store_${crypto.randomUUID().split('-')[0]}`;
    const themeConfig = { ...DEFAULT_THEME, ...body.themeConfig };

    try {
        await c.env.DB.prepare(
            'INSERT INTO stores (id, slug, theme_config) VALUES (?, ?, ?)'
        ).bind(id, body.slug, JSON.stringify(themeConfig)).run();
    } catch (e) {
        throw new HTTPException(400, { message: 'Store creation failed (slug might be taken)' });
    }

    return c.json({ id, slug: body.slug, themeConfig }, 201);
});

app.get('/stores/:id', async (c) => {
    const id = c.req.param('id');
    const store = await c.env.DB.prepare('SELECT * FROM stores WHERE id = ?').bind(id).first();
    if (!store) throw new HTTPException(404, { message: 'Store not found' });
    return c.json(store);
});

app.put('/stores/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ themeConfig?: Partial<StoreThemeConfig>; status?: string }>();

    const store = await c.env.DB.prepare('SELECT * FROM stores WHERE id = ?').bind(id).first<Store>();
    if (!store) throw new HTTPException(404, { message: 'Store not found' });

    const currentTheme = JSON.parse(store.themeConfig as unknown as string);
    const newTheme = { ...currentTheme, ...body.themeConfig };

    await c.env.DB.prepare(
        'UPDATE stores SET theme_config = ?, status = COALESCE(?, status), updated_at = datetime("now") WHERE id = ?'
    ).bind(JSON.stringify(newTheme), body.status || null, id).run();

    return c.json({ ...store, themeConfig: newTheme });
});

// --- Products ---

app.get('/stores/:storeId/products', async (c) => {
    const storeId = c.req.param('storeId');
    const products = await c.env.DB.prepare('SELECT * FROM products WHERE store_id = ?').bind(storeId).all();
    return c.json(products.results);
});

app.post('/stores/:storeId/products', async (c) => {
    const storeId = c.req.param('storeId');
    const body = await c.req.json<Partial<Product>>();

    if (!body.title || !body.priceCents || !body.currency) {
        throw new HTTPException(400, { message: 'Missing required fields' });
    }

    const id = `prod_${crypto.randomUUID().split('-')[0]}`;

    await c.env.DB.prepare(
        `INSERT INTO products (id, store_id, title, description, price_cents, currency, image_url, stock, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
        id,
        storeId,
        body.title,
        body.description || null,
        body.priceCents,
        body.currency,
        body.imageUrl || null,
        body.stock || 0,
        body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1
    ).run();

    return c.json({ id, ...body }, 201);
});

app.put('/stores/:storeId/products/:productId', async (c) => {
    const { storeId, productId } = c.req.param();
    const body = await c.req.json<Partial<Product>>();

    const updates: string[] = [];
    const values: any[] = [];

    if (body.title) { updates.push('title = ?'); values.push(body.title); }
    if (body.description !== undefined) { updates.push('description = ?'); values.push(body.description); }
    if (body.priceCents) { updates.push('price_cents = ?'); values.push(body.priceCents); }
    if (body.imageUrl !== undefined) { updates.push('image_url = ?'); values.push(body.imageUrl); }
    if (body.stock !== undefined) { updates.push('stock = ?'); values.push(body.stock); }
    if (body.isActive !== undefined) { updates.push('is_active = ?'); values.push(body.isActive ? 1 : 0); }

    if (updates.length === 0) return c.json({ message: 'No updates' });

    updates.push('updated_at = datetime("now")');

    await c.env.DB.prepare(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND store_id = ?`
    ).bind(...values, productId, storeId).run();

    return c.json({ success: true });
});

app.delete('/stores/:storeId/products/:productId', async (c) => {
    const { storeId, productId } = c.req.param();
    await c.env.DB.prepare('DELETE FROM products WHERE id = ? AND store_id = ?')
        .bind(productId, storeId).run();
    return c.json({ success: true });
});

// --- Orders ---

app.get('/stores/:storeId/orders', async (c) => {
    const storeId = c.req.param('storeId');
    const ordersResult = await c.env.DB.prepare(
        'SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC'
    ).bind(storeId).all();

    // Fetch order items with product details for each order
    const orders = await Promise.all(
        (ordersResult.results as any[]).map(async (order) => {
            const itemsResult = await c.env.DB.prepare(`
                SELECT oi.*, p.title as product_title, p.image_url as product_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `).bind(order.id).all();

            return {
                id: order.id,
                storeId: order.store_id,
                userEmail: order.user_email,
                status: order.status,
                totalCents: order.total_cents,
                currency: order.currency,
                shippingAddress: order.shipping_address ? JSON.parse(order.shipping_address) : null,
                stripeCheckoutSessionId: order.stripe_checkout_session_id,
                stripePaymentIntentId: order.stripe_payment_intent_id,
                createdAt: order.created_at,
                updatedAt: order.updated_at,
                items: itemsResult.results.map((item: any) => ({
                    productId: item.product_id,
                    productTitle: item.product_title || 'Unknown Product',
                    productImage: item.product_image,
                    quantity: item.quantity,
                    priceCents: item.price_cents,
                })),
            };
        })
    );

    return c.json(orders);
});

app.get('/stores/:storeId/orders/:orderId', async (c) => {
    const { storeId, orderId } = c.req.param();
    const order = await c.env.DB.prepare(
        'SELECT * FROM orders WHERE id = ? AND store_id = ?'
    ).bind(orderId, storeId).first();

    if (!order) {
        throw new HTTPException(404, { message: 'Order not found' });
    }

    const itemsResult = await c.env.DB.prepare(
        'SELECT * FROM order_items WHERE order_id = ?'
    ).bind(orderId).all();

    return c.json({
        ...order,
        items: itemsResult.results.map((item: any) => ({
            productId: item.product_id,
            quantity: item.quantity,
            priceCents: item.price_cents,
        })),
    });
});

app.put('/stores/:storeId/orders/:orderId', async (c) => {
    const { storeId, orderId } = c.req.param();
    const body = await c.req.json<{ 
        status?: string;
        items?: { productId: string; quantity: number }[];
    }>();

    // Validate status
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (body.status && !validStatuses.includes(body.status)) {
        throw new HTTPException(400, { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await c.env.DB.prepare(
        'SELECT * FROM orders WHERE id = ? AND store_id = ?'
    ).bind(orderId, storeId).first();

    if (!order) {
        throw new HTTPException(404, { message: 'Order not found' });
    }

    // Update status if provided
    if (body.status) {
        await c.env.DB.prepare(
            'UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ? AND store_id = ?'
        ).bind(body.status, orderId, storeId).run();
    }

    // Update items if provided
    if (body.items && body.items.length > 0) {
        let newTotalCents = 0;

        for (const item of body.items) {
            if (item.quantity <= 0) {
                // Remove item if quantity is 0 or negative
                await c.env.DB.prepare(
                    'DELETE FROM order_items WHERE order_id = ? AND product_id = ?'
                ).bind(orderId, item.productId).run();
            } else {
                // Update quantity
                await c.env.DB.prepare(
                    'UPDATE order_items SET quantity = ? WHERE order_id = ? AND product_id = ?'
                ).bind(item.quantity, orderId, item.productId).run();
            }
        }

        // Recalculate total
        const itemsResult = await c.env.DB.prepare(
            'SELECT quantity, price_cents FROM order_items WHERE order_id = ?'
        ).bind(orderId).all();

        for (const item of itemsResult.results as any[]) {
            newTotalCents += item.quantity * item.price_cents;
        }

        // Update order total
        await c.env.DB.prepare(
            'UPDATE orders SET total_cents = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind(newTotalCents, orderId).run();
    }

    return c.json({ success: true, status: body.status });
});

// --- Payments ---

app.get('/stores/:storeId/payments', async (c) => {
    const storeId = c.req.param('storeId');
    const payments = await c.env.DB.prepare(
        'SELECT * FROM payments WHERE store_id = ? ORDER BY created_at DESC'
    ).bind(storeId).all();
    return c.json(payments.results);
});

export const adminRouter = app;
