/**
 * Shipping Routes
 * Handles EasyPost shipping integration for admin users
 */
import { Hono } from 'hono';
import { adminAuth } from '../middleware/auth';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv, ShippingSettings, Shipment, ShippingRate } from '../types';
import { EasyPostService, EasyPostAddress } from '../services/easypost';

const app = new Hono<HonoEnv>();

app.use('*', adminAuth);

// --- Shipping Settings ---

/**
 * Get shipping settings for a store
 */
app.get('/stores/:storeId/shipping/settings', async (c) => {
    const storeId = c.req.param('storeId');

    const result = await c.env.DB.prepare(
        'SELECT * FROM store_shipping_settings WHERE store_id = ?'
    ).bind(storeId).first();

    if (!result) {
        // Return empty settings if not configured
        return c.json({
            storeId,
            isConfigured: false,
        });
    }

    const settings: ShippingSettings = {
        id: result.id as string,
        storeId: result.store_id as string,
        easypostApiKey: result.easypost_api_key ? '••••••••' + (result.easypost_api_key as string).slice(-4) : undefined,
        fromName: result.from_name as string,
        fromCompany: result.from_company as string,
        fromStreet1: result.from_street1 as string,
        fromStreet2: result.from_street2 as string,
        fromCity: result.from_city as string,
        fromState: result.from_state as string,
        fromZip: result.from_zip as string,
        fromCountry: result.from_country as string,
        fromPhone: result.from_phone as string,
    };

    return c.json({
        ...settings,
        isConfigured: !!result.easypost_api_key && !!result.from_street1,
    });
});

/**
 * Update shipping settings for a store
 */
app.put('/stores/:storeId/shipping/settings', async (c) => {
    const storeId = c.req.param('storeId');
    const body = await c.req.json<Partial<ShippingSettings>>();

    // Check if settings exist
    const existing = await c.env.DB.prepare(
        'SELECT id FROM store_shipping_settings WHERE store_id = ?'
    ).bind(storeId).first();

    if (existing) {
        // Update existing settings
        const updates: string[] = [];
        const values: (string | null)[] = [];

        // Only update API key if a new one is provided (not masked)
        if (body.easypostApiKey && !body.easypostApiKey.startsWith('••••')) {
            updates.push('easypost_api_key = ?');
            values.push(body.easypostApiKey);
        }

        if (body.fromName !== undefined) { updates.push('from_name = ?'); values.push(body.fromName || null); }
        if (body.fromCompany !== undefined) { updates.push('from_company = ?'); values.push(body.fromCompany || null); }
        if (body.fromStreet1 !== undefined) { updates.push('from_street1 = ?'); values.push(body.fromStreet1 || null); }
        if (body.fromStreet2 !== undefined) { updates.push('from_street2 = ?'); values.push(body.fromStreet2 || null); }
        if (body.fromCity !== undefined) { updates.push('from_city = ?'); values.push(body.fromCity || null); }
        if (body.fromState !== undefined) { updates.push('from_state = ?'); values.push(body.fromState || null); }
        if (body.fromZip !== undefined) { updates.push('from_zip = ?'); values.push(body.fromZip || null); }
        if (body.fromCountry !== undefined) { updates.push('from_country = ?'); values.push(body.fromCountry || null); }
        if (body.fromPhone !== undefined) { updates.push('from_phone = ?'); values.push(body.fromPhone || null); }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            await c.env.DB.prepare(
                `UPDATE store_shipping_settings SET ${updates.join(', ')} WHERE store_id = ?`
            ).bind(...values, storeId).run();
        }
    } else {
        // Create new settings
        const id = `ship_set_${crypto.randomUUID().split('-')[0]}`;
        await c.env.DB.prepare(`
            INSERT INTO store_shipping_settings 
            (id, store_id, easypost_api_key, from_name, from_company, from_street1, from_street2, from_city, from_state, from_zip, from_country, from_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            storeId,
            body.easypostApiKey || null,
            body.fromName || null,
            body.fromCompany || null,
            body.fromStreet1 || null,
            body.fromStreet2 || null,
            body.fromCity || null,
            body.fromState || null,
            body.fromZip || null,
            body.fromCountry || 'US',
            body.fromPhone || null
        ).run();
    }

    return c.json({ success: true });
});

// --- Shipping Rates ---

/**
 * Get shipping rates for an order
 */
app.post('/stores/:storeId/orders/:orderId/shipping/rates', async (c) => {
    const { storeId, orderId } = c.req.param();

    // Get shipping settings
    const settings = await c.env.DB.prepare(
        'SELECT * FROM store_shipping_settings WHERE store_id = ?'
    ).bind(storeId).first();

    if (!settings || !settings.easypost_api_key) {
        throw new HTTPException(400, { message: 'Shipping not configured. Please add your EasyPost API key in Shipping Settings.' });
    }

    if (!settings.from_street1 || !settings.from_city || !settings.from_state || !settings.from_zip) {
        throw new HTTPException(400, { message: 'Origin address not configured. Please complete your Shipping Settings.' });
    }

    // Get order with shipping address
    const order = await c.env.DB.prepare(
        'SELECT * FROM orders WHERE id = ? AND store_id = ?'
    ).bind(orderId, storeId).first();

    if (!order) {
        throw new HTTPException(404, { message: 'Order not found' });
    }

    if (!order.shipping_address) {
        throw new HTTPException(400, { message: 'Order has no shipping address' });
    }

    const shippingAddress = JSON.parse(order.shipping_address as string);

    // Build addresses
    const fromAddress: EasyPostAddress = {
        name: settings.from_name as string,
        company: settings.from_company as string,
        street1: settings.from_street1 as string,
        street2: settings.from_street2 as string,
        city: settings.from_city as string,
        state: settings.from_state as string,
        zip: settings.from_zip as string,
        country: settings.from_country as string || 'US',
        phone: settings.from_phone as string,
    };

    const toAddress: EasyPostAddress = {
        name: shippingAddress.name,
        street1: shippingAddress.line1,
        street2: shippingAddress.line2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.postalCode,
        country: shippingAddress.country || 'US',
    };

    // Get rates from EasyPost
    const easypost = new EasyPostService(settings.easypost_api_key as string);

    try {
        const shipment = await easypost.getShippingRates(fromAddress, toAddress);

        // Transform rates to our format
        const rates: ShippingRate[] = shipment.rates.map(rate => ({
            id: rate.id,
            carrier: rate.carrier,
            service: rate.service,
            rate: parseFloat(rate.rate) * 100, // Convert to cents
            currency: rate.currency,
            deliveryDays: rate.delivery_days,
            deliveryDate: rate.delivery_date,
        }));

        // Sort by price
        rates.sort((a, b) => a.rate - b.rate);

        return c.json({
            shipmentId: shipment.id,
            rates,
        });
    } catch (error) {
        console.error('EasyPost error:', error);
        throw new HTTPException(500, {
            message: error instanceof Error ? error.message : 'Failed to get shipping rates'
        });
    }
});

// --- Buy Label ---

/**
 * Purchase a shipping label
 */
app.post('/stores/:storeId/orders/:orderId/shipping/buy', async (c) => {
    const { storeId, orderId } = c.req.param();
    const body = await c.req.json<{ shipmentId: string; rateId: string }>();

    if (!body.shipmentId || !body.rateId) {
        throw new HTTPException(400, { message: 'shipmentId and rateId are required' });
    }

    // Get shipping settings
    const settings = await c.env.DB.prepare(
        'SELECT easypost_api_key FROM store_shipping_settings WHERE store_id = ?'
    ).bind(storeId).first();

    if (!settings || !settings.easypost_api_key) {
        throw new HTTPException(400, { message: 'Shipping not configured' });
    }

    // Verify order exists
    const order = await c.env.DB.prepare(
        'SELECT id FROM orders WHERE id = ? AND store_id = ?'
    ).bind(orderId, storeId).first();

    if (!order) {
        throw new HTTPException(404, { message: 'Order not found' });
    }

    // Purchase label via EasyPost
    const easypost = new EasyPostService(settings.easypost_api_key as string);

    try {
        const purchasedShipment = await easypost.buyLabel(body.shipmentId, body.rateId);

        // Check if we already have a shipment record for this order
        const existingShipment = await c.env.DB.prepare(
            'SELECT id FROM shipments WHERE order_id = ?'
        ).bind(orderId).first();

        const shipmentId = existingShipment?.id || `ship_${crypto.randomUUID().split('-')[0]}`;
        const labelUrl = purchasedShipment.postage_label?.label_url;
        const trackingNumber = purchasedShipment.tracking_code;
        const trackingUrl = purchasedShipment.tracker?.public_url;
        const selectedRate = purchasedShipment.selected_rate;

        if (existingShipment) {
            // Update existing record
            await c.env.DB.prepare(`
                UPDATE shipments SET 
                    easypost_shipment_id = ?,
                    carrier = ?,
                    service = ?,
                    tracking_number = ?,
                    tracking_url = ?,
                    label_url = ?,
                    rate_cents = ?,
                    currency = ?,
                    status = 'purchased',
                    updated_at = datetime('now')
                WHERE id = ?
            `).bind(
                purchasedShipment.id,
                selectedRate?.carrier,
                selectedRate?.service,
                trackingNumber,
                trackingUrl,
                labelUrl,
                selectedRate ? Math.round(parseFloat(selectedRate.rate) * 100) : null,
                selectedRate?.currency || 'USD',
                shipmentId
            ).run();
        } else {
            // Create new shipment record
            await c.env.DB.prepare(`
                INSERT INTO shipments 
                (id, store_id, order_id, easypost_shipment_id, carrier, service, tracking_number, tracking_url, label_url, rate_cents, currency, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'purchased')
            `).bind(
                shipmentId,
                storeId,
                orderId,
                purchasedShipment.id,
                selectedRate?.carrier,
                selectedRate?.service,
                trackingNumber,
                trackingUrl,
                labelUrl,
                selectedRate ? Math.round(parseFloat(selectedRate.rate) * 100) : null,
                selectedRate?.currency || 'USD'
            ).run();
        }

        // Update order status to shipped
        await c.env.DB.prepare(
            'UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?'
        ).bind('shipped', orderId).run();

        return c.json({
            success: true,
            shipment: {
                id: shipmentId,
                carrier: selectedRate?.carrier,
                service: selectedRate?.service,
                trackingNumber,
                trackingUrl,
                labelUrl,
                rateCents: selectedRate ? Math.round(parseFloat(selectedRate.rate) * 100) : null,
            },
        });
    } catch (error) {
        console.error('EasyPost buy error:', error);
        throw new HTTPException(500, {
            message: error instanceof Error ? error.message : 'Failed to purchase label'
        });
    }
});

// --- Get Shipment ---

/**
 * Get shipment details for an order
 */
app.get('/stores/:storeId/orders/:orderId/shipping', async (c) => {
    const { storeId, orderId } = c.req.param();

    const result = await c.env.DB.prepare(
        'SELECT * FROM shipments WHERE order_id = ? AND store_id = ?'
    ).bind(orderId, storeId).first();

    if (!result) {
        return c.json({ hasShipment: false });
    }

    const shipment: Shipment = {
        id: result.id as string,
        storeId: result.store_id as string,
        orderId: result.order_id as string,
        easypostShipmentId: result.easypost_shipment_id as string,
        carrier: result.carrier as string,
        service: result.service as string,
        trackingNumber: result.tracking_number as string,
        trackingUrl: result.tracking_url as string,
        labelUrl: result.label_url as string,
        rateCents: result.rate_cents as number,
        currency: result.currency as string,
        status: result.status as Shipment['status'],
        createdAt: result.created_at as string,
        updatedAt: result.updated_at as string,
    };

    return c.json({
        hasShipment: true,
        shipment,
    });
});

export const shippingRouter = app;
