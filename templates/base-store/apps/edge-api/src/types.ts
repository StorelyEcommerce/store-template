import { Store } from '@store/shared-types';

export type Bindings = {
    DB: D1Database;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    ADMIN_API_KEY: string;
};

export type Variables = {
    store: Store;
};

export type HonoEnv = {
    Bindings: Bindings;
    Variables: Variables;
};
