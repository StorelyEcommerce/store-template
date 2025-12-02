export interface StoreThemeConfig {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    fontFamily?: string;
    layoutVariant: 'classic' | 'grid' | 'hero-focused';
    homepageHero?: {
        title: string;
        subtitle?: string;
        imageUrl?: string;
        ctaLabel?: string;
    };
    featureFlags?: Record<string, boolean>;
}

export interface Store {
    id: string;
    slug: string;
    name: string;
    primaryDomain?: string;
    status: 'active' | 'inactive';
    currency: string;
    themeConfig: StoreThemeConfig;
    createdAt: string;
    updatedAt: string;
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
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    priceCents: number;
}

export interface Order {
    id: string;
    storeId: string;
    userEmail: string;
    status: 'pending' | 'paid' | 'cancelled';
    totalCents: number;
    currency: string;
    items: OrderItem[];
    stripeCheckoutSessionId?: string;
    stripePaymentIntentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Payment {
    id: string;
    storeId: string;
    orderId: string;
    amountCents: number;
    currency: string;
    status: 'requires_payment' | 'succeeded' | 'failed' | 'refunded';
    stripePaymentIntentId: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    email: string;
    role: 'platform_admin' | 'store_admin' | 'customer';
    storeId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiKey {
    id: string;
    storeId: string;
    name: string;
    keyHash: string;
    lastUsedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WebhookEndpoint {
    id: string;
    storeId: string;
    url: string;
    secret: string;
    eventTypes: string[];
    createdAt: string;
    updatedAt: string;
}

// API Request/Response Types

export interface CreateCheckoutRequest {
    items: { productId: string; quantity: number }[];
    email: string;
    successUrl?: string;
    cancelUrl?: string;
}

export interface CreateCheckoutResponse {
    checkoutUrl: string;
}

export interface CreateProductRequest {
    title: string;
    description?: string;
    priceCents: number;
    currency: string;
    imageUrl?: string;
    stock?: number;
    isActive?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> { }

export interface CreateStoreRequest {
    slug: string;
    primaryDomain?: string;
    themeConfig?: Partial<StoreThemeConfig>;
}

export interface UpdateStoreRequest {
    primaryDomain?: string;
    status?: 'active' | 'inactive';
    themeConfig?: Partial<StoreThemeConfig>;
}
