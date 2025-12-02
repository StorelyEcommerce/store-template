/**
 * API Client for Storefront
 * Connects to the Edge API at /v1/stores/:slug/*
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const STORE_SLUG = import.meta.env.VITE_STORE_SLUG || 'demo-store';

export interface Product {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  description?: string;
  priceCents: number;
  currency: string;
  imageUrl?: string;
  stock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  status: 'active' | 'inactive';
  currency: string;
  themeConfig: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    logoUrl?: string;
    layoutVariant: 'classic' | 'grid' | 'hero-focused';
    homepageHero?: {
      title: string;
      subtitle?: string;
      imageUrl?: string;
      ctaLabel?: string;
    };
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  subtotalCents: number;
  totalCents: number;
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

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(errorText || `API Error: ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Local storage cart management
const CART_KEY = 'store_cart';

function getLocalCart(): Cart {
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load cart:', e);
  }
  return { items: [], subtotalCents: 0, totalCents: 0 };
}

function saveLocalCart(cart: Cart): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
}

export const api = {
  // Store
  async getStore(): Promise<Store> {
    return apiRequest<Store>(`/v1/stores/${STORE_SLUG}`);
  },

  // Products
  async getProducts(): Promise<Product[]> {
    return apiRequest<Product[]>(`/v1/stores/${STORE_SLUG}/products`);
  },

  async getProduct(id: string): Promise<Product> {
    return apiRequest<Product>(`/v1/stores/${STORE_SLUG}/products/${id}`);
  },

  async searchProducts(query: string): Promise<Product[]> {
    const products = await this.getProducts();
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return [];
    
    return products.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    );
  },

  // Cart (client-side)
  async getCart(): Promise<Cart> {
    const cart = getLocalCart();
    
    if (cart.items.length > 0) {
      const products = await this.getProducts();
      const itemsWithProducts = cart.items.map(item => ({
        ...item,
        product: products.find(p => p.id === item.productId),
      })).filter(item => item.product);
      
      let subtotalCents = 0;
      for (const item of itemsWithProducts) {
        if (item.product) {
          subtotalCents += item.product.priceCents * item.quantity;
        }
      }
      
      return {
        items: itemsWithProducts,
        subtotalCents,
        totalCents: subtotalCents,
      };
    }
    
    return cart;
  },

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const cart = getLocalCart();
    const existingIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    const products = await this.getProducts();
    let subtotalCents = 0;
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        subtotalCents += product.priceCents * item.quantity;
      }
    }
    
    cart.subtotalCents = subtotalCents;
    cart.totalCents = subtotalCents;
    saveLocalCart(cart);
    
    return this.getCart();
  },

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const cart = getLocalCart();
    const index = cart.items.findIndex(item => item.productId === productId);
    
    if (index >= 0) {
      if (quantity <= 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = quantity;
      }
    }
    
    const products = await this.getProducts();
    let subtotalCents = 0;
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        subtotalCents += product.priceCents * item.quantity;
      }
    }
    
    cart.subtotalCents = subtotalCents;
    cart.totalCents = subtotalCents;
    saveLocalCart(cart);
    
    return this.getCart();
  },

  async removeFromCart(productId: string): Promise<Cart> {
    return this.updateCartItem(productId, 0);
  },

  async clearCart(): Promise<Cart> {
    const emptyCart = { items: [], subtotalCents: 0, totalCents: 0 };
    saveLocalCart(emptyCart);
    return emptyCart;
  },

  // Checkout
  async createCheckout(email: string, shippingAddress?: ShippingAddress): Promise<{ checkoutUrl: string }> {
    const cart = getLocalCart();
    
    if (cart.items.length === 0) {
      throw new ApiError('Cart is empty', 400);
    }
    
    return apiRequest<{ checkoutUrl: string }>(`/v1/stores/${STORE_SLUG}/checkout`, {
      method: 'POST',
      body: JSON.stringify({
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        email,
        shippingAddress,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });
  },
};

export function formatPrice(cents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
