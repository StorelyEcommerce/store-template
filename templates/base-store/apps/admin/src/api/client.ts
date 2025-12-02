/**
 * Admin API Client
 * Connects to the Edge API at /v1/admin/*
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'admin-secret-key';

export interface Store {
  id: string;
  slug: string;
  name?: string;
  primaryDomain?: string;
  status: 'active' | 'inactive';
  themeConfig: string | object;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId?: string;
  store_id?: string;
  title: string;
  description?: string;
  priceCents?: number;
  price_cents?: number;
  currency: string;
  imageUrl?: string;
  image_url?: string;
  stock?: number;
  isActive?: boolean | number;
  is_active?: boolean | number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// Helper to normalize product data
export function normalizeProduct(p: Product): Product {
  return {
    ...p,
    storeId: p.storeId || p.store_id,
    priceCents: p.priceCents ?? p.price_cents ?? 0,
    imageUrl: p.imageUrl || p.image_url,
    isActive: p.isActive ?? p.is_active ?? false,
    createdAt: p.createdAt || p.created_at,
    updatedAt: p.updatedAt || p.updated_at,
  };
}

export interface OrderItem {
  productId: string;
  productTitle?: string;
  productImage?: string;
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

export interface Order {
  id: string;
  storeId: string;
  userEmail: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalCents: number;
  currency: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
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
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${ADMIN_TOKEN}`);

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

export const adminApi = {
  // Stores
  async getStores(): Promise<Store[]> {
    return apiRequest<Store[]>('/v1/admin/stores');
  },

  async getStore(id: string): Promise<Store> {
    return apiRequest<Store>(`/v1/admin/stores/${id}`);
  },

  async createStore(data: { slug: string; themeConfig?: object }): Promise<Store> {
    return apiRequest<Store>('/v1/admin/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStore(id: string, data: { themeConfig?: object; status?: string }): Promise<Store> {
    return apiRequest<Store>(`/v1/admin/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Products
  async getProducts(storeId: string): Promise<Product[]> {
    const products = await apiRequest<Product[]>(`/v1/admin/stores/${storeId}/products`);
    return products.map(normalizeProduct);
  },

  async createProduct(storeId: string, data: Partial<Product>): Promise<Product> {
    return apiRequest<Product>(`/v1/admin/stores/${storeId}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(storeId: string, productId: string, data: Partial<Product>): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/v1/admin/stores/${storeId}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(storeId: string, productId: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/v1/admin/stores/${storeId}/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async getOrders(storeId: string): Promise<Order[]> {
    return apiRequest<Order[]>(`/v1/admin/stores/${storeId}/orders`);
  },

  async getOrder(storeId: string, orderId: string): Promise<Order> {
    return apiRequest<Order>(`/v1/admin/stores/${storeId}/orders/${orderId}`);
  },

  async updateOrderStatus(storeId: string, orderId: string, status: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/v1/admin/stores/${storeId}/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async updateOrderItem(storeId: string, orderId: string, productId: string, quantity: number): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/v1/admin/stores/${storeId}/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ items: [{ productId, quantity }] }),
    });
  },

  // Payments
  async getPayments(storeId: string): Promise<Payment[]> {
    return apiRequest<Payment[]>(`/v1/admin/stores/${storeId}/payments`);
  },
};

export function formatPrice(cents: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

