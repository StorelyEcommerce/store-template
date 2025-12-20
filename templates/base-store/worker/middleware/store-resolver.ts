import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv, Store } from '../types';

export async function resolveStore(c: Context<HonoEnv>, next: Next) {
    const slug = c.req.param('slug');

    if (!slug) {
        await next();
        return;
    }

    let store: Store | null = null;
    try {
        // Check if DB is available
        if (!c.env.DB) {
            console.error('[STORE RESOLVER] DB not available in environment');
            throw new HTTPException(500, { message: 'Database not available' });
        }

        store = await c.env.DB.prepare('SELECT * FROM stores WHERE slug = ?').bind(slug).first<Store>();

        if (!store) {
            throw new HTTPException(404, { message: 'Store not found' });
        }
    } catch (err) {
        console.error('[STORE RESOLVER] Error resolving store:', err);
        console.error('[STORE RESOLVER] Error details:', {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
        });
        throw err;
    }

    // Parse theme config if stored as string
    const rawStore = store as any;
    try {
        if (typeof rawStore.theme_config === 'string') {
            rawStore.themeConfig = JSON.parse(rawStore.theme_config);
        } else if (typeof rawStore.themeConfig === 'string') {
            rawStore.themeConfig = JSON.parse(rawStore.themeConfig);
        } else if (!rawStore.themeConfig && rawStore.theme_config) {
            // If themeConfig doesn't exist but theme_config does, use it directly
            rawStore.themeConfig = rawStore.theme_config;
        }
    } catch (err) {
        console.error('[STORE RESOLVER] Failed to parse theme config:', err);
        // Use default theme if parsing fails
        rawStore.themeConfig = { primaryColor: '#2563eb', secondaryColor: '#1e40af', backgroundColor: '#f8fafc', layoutVariant: 'classic' };
    }

    // Add name and currency fields if not present (for compatibility)
    if (!rawStore.name) {
        rawStore.name = rawStore.slug;
    }
    if (!rawStore.currency) {
        rawStore.currency = 'usd';
    }

    c.set('store', rawStore as Store);
    await next();
}

