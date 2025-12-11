import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { adminRouter } from './routes/admin';
import { storeRouter } from './routes/store';
import { webhookRouter } from './routes/webhook';
import { HonoEnv } from './types';

const app = new Hono<HonoEnv>();

app.use('*', cors());

app.get('/', (c) => c.text('Store Platform Edge API'));

app.route('/v1/admin', adminRouter);
app.route('/v1/stores', storeRouter);
app.route('/v1/webhooks', webhookRouter);

export default app;
