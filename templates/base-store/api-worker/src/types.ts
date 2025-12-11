// Store types (previously from @store/shared-types)
export interface Store {
    id: string;
    slug: string;
    name?: string;
    themeConfig: StoreThemeConfig | string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface StoreThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    logoUrl?: string;
    bannerUrl?: string;
}

export interface Product {
    id: string;
    storeId: string;
    title: string;
    description?: string;
    priceCents: number;
    currency: string;
    imageUrl?: string;
    stock?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Order {
    id: string;
    storeId: string;
    userEmail: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    totalCents: number;
    currency: string;
    shippingAddress?: ShippingAddress;
    stripeCheckoutSessionId?: string;
    stripePaymentIntentId?: string;
    createdAt?: string;
    updatedAt?: string;
    items?: OrderItem[];
}

export interface OrderItem {
    productId: string;
    quantity: number;
    priceCents: number;
}

export interface ShippingAddress {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

// Default theme config (previously from @store/shared-config)
export const DEFAULT_THEME: StoreThemeConfig = {
    primaryColor: '#1a1a1a',
    secondaryColor: '#f5f5f5',
    fontFamily: 'Inter, sans-serif',
};

// Hono environment types
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
