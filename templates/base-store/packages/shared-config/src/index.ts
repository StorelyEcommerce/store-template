import { StoreThemeConfig } from '@store/shared-types';

export const DEFAULT_THEME: StoreThemeConfig = {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#f3f4f6',
    layoutVariant: 'classic',
    homepageHero: {
        title: 'Welcome to our store',
        subtitle: 'Best products for you',
        ctaLabel: 'Shop Now'
    },
    featureFlags: {
        showReviews: false
    }
};

export const ROLES = {
    PLATFORM_ADMIN: 'platform_admin',
    STORE_ADMIN: 'store_admin',
    CUSTOMER: 'customer'
} as const;

export const API_VERSION = 'v1';

export const DEFAULT_CURRENCY = 'usd';
