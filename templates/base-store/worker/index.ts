import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { adminRouter } from './routes/admin';
import { storeRouter } from './routes/store';
import { webhookRouter } from './routes/webhook';
import { HonoEnv, Env } from './types';

const app = new Hono<HonoEnv>();

// Logging
app.use('*', logger());

// Enable CORS for all routes
app.use('/v1/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.route('/v1/admin', adminRouter);
app.route('/v1/stores', storeRouter);
app.route('/v1/webhooks', webhookRouter);

// Root API endpoint
app.get('/v1', (c) => c.text('Store Platform Edge API'));

// Error handlers
app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));
app.onError((err, c) => {
  console.error(`[ERROR] ${err}`);
  console.error(`[ERROR] Stack:`, err.stack);
  console.error(`[ERROR] Request path:`, c.req.path);
  console.error(`[ERROR] Request method:`, c.req.method);
  
  // If it's an HTTPException, return the proper status and message
  if (err instanceof Error && 'status' in err) {
    const status = (err as any).status || 500;
    const message = err.message || 'Internal Server Error';
    return c.json({ success: false, error: message }, status);
  }
  
  return c.json({ success: false, error: err.message || 'Internal Server Error' }, 500);
});

console.log('Store API Server is running');

export default { fetch: app.fetch } satisfies ExportedHandler<Env>;

