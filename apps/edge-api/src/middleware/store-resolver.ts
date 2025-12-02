import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HonoEnv } from '../types';
import { Store } from '@store/shared-types';

export async function resolveStore(c: Context<HonoEnv>, next: Next) {
    const slug = c.req.param('slug');

    if (!slug) {
        // If not in param, try to get from Host header (future proofing)
        // For now, we rely on the route /v1/stores/:slug/...
        await next();
        return;
    }

    const store = await c.env.DB.prepare('SELECT * FROM stores WHERE slug = ?').bind(slug).first<Store>();

    if (!store) {
        throw new HTTPException(404, { message: 'Store not found' });
    }

    // Parse theme config
    // D1 returns parsed JSON if stored as text? No, it returns string.
    // But if I typed it as Store, TS thinks it's StoreThemeConfig.
    // I need to handle the parsing if it's stored as string.
    // In my schema it is TEXT.
    // So I should cast to a raw type first.

    // Actually, let's just cast it to any for now to handle the parsing logic safely
    const rawStore = store as any;
    if (typeof rawStore.theme_config === 'string') {
        rawStore.themeConfig = JSON.parse(rawStore.theme_config);
    } else if (typeof rawStore.themeConfig === 'string') {
        rawStore.themeConfig = JSON.parse(rawStore.themeConfig);
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
