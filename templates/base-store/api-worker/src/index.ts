import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { adminRouter } from './routes/admin';
import { storeRouter } from './routes/store';
import { webhookRouter } from './routes/webhook';
import { shippingRouter } from './routes/shipping';
import { HonoEnv } from './types';

const app = new Hono<HonoEnv>();

// CORS configuration - allow requests from admin dashboard
app.use('*', async (c, next) => {
    const adminDashboardUrl = c.env.ADMIN_DASHBOARD_URL;

    // Build allowed origins list
    const allowedOrigins = [
        'http://localhost:5173',  // Local development
        'http://localhost:3000',  // Alternative local port
    ];

    if (adminDashboardUrl) {
        allowedOrigins.push(adminDashboardUrl);
    }

    return cors({
        origin: (origin) => {
            // Allow if origin matches any allowed origin
            if (allowedOrigins.includes(origin)) {
                return origin;
            }
            // Allow requests with no origin (e.g., curl, server-to-server)
            return null;
        },
        credentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
        exposeHeaders: ['Content-Length'],
        maxAge: 86400, // 24 hours
    })(c, next);
});

app.get('/', (c) => c.text('Store Platform Edge API'));

app.route('/v1/admin', adminRouter);
app.route('/v1/admin', shippingRouter); // Shipping routes under admin
app.route('/v1/stores', storeRouter);
app.route('/v1/webhooks', webhookRouter);

export default app;
