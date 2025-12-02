import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv } from '../types';

export async function adminAuth(c: Context<HonoEnv>, next: Next) {
    const authHeader = c.req.header('Authorization');
    const apiKey = c.env.ADMIN_API_KEY;

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== apiKey) {
        throw new HTTPException(401, { message: 'Unauthorized' });
    }

    await next();
}
