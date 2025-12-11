/**
 * Cart API - Client-side cart management
 * Uses localStorage to persist cart data
 */

const CART_KEY = 'store_cart';
const API_BASE = window.StoreData?.apiUrl || '/v1/stores/';
const STORE_SLUG = window.StoreData?.storeSlug || 'demo-store';

class CartAPI {
  constructor() {
    this.productsCache = null;
  }

  async getProducts() {
    if (this.productsCache) {
      return this.productsCache;
    }
    
    try {
      const response = await fetch(`${API_BASE}${STORE_SLUG}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      this.productsCache = await response.json();
      return this.productsCache;
    } catch (error) {
      console.error('Failed to load products:', error);
      return [];
    }
  }

  getLocalCart() {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
    return { items: [], subtotalCents: 0, totalCents: 0 };
  }

  saveLocalCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }

  async getCart() {
    const cart = this.getLocalCart();
    
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
  }

  async addToCart(productId, quantity = 1) {
    const cart = this.getLocalCart();
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
    this.saveLocalCart(cart);
    
    return this.getCart();
  }

  async updateQuantity(productId, quantity) {
    const cart = this.getLocalCart();
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
    this.saveLocalCart(cart);
    
    return this.getCart();
  }

  async removeFromCart(productId) {
    return this.updateQuantity(productId, 0);
  }

  async clearCart() {
    const emptyCart = { items: [], subtotalCents: 0, totalCents: 0 };
    this.saveLocalCart(emptyCart);
    return emptyCart;
  }

  async createCheckout(email, shippingAddress) {
    const cart = this.getLocalCart();
    
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    const response = await fetch(`${API_BASE}${STORE_SLUG}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }
    
    return response.json();
  }
}

// Initialize global CartAPI
window.CartAPI = new CartAPI();

// Update cart count on page load
async function updateCartCount() {
  try {
    const cart = await window.CartAPI.getCart();
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) {
      if (itemCount > 0) {
        countEl.textContent = itemCount > 9 ? '9+' : itemCount;
        countEl.style.display = 'flex';
      } else {
        countEl.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Failed to update cart count:', error);
  }
}

// Quick add to cart function
async function addToCartQuick(productId, button) {
  const originalContent = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  button.style.background = '#10b981';
  
  try {
    await window.CartAPI.addToCart(productId, 1);
    updateCartCount();
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.style.background = '';
      button.disabled = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to add to cart:', error);
    button.innerHTML = originalContent;
    button.disabled = false;
  }
}

// Update cart count when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateCartCount);
} else {
  updateCartCount();
}
