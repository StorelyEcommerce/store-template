/**
 * Admin API - Client-side admin functionality
 * Handles API calls, modals, and form submissions
 */

const API_BASE = window.AdminData?.apiUrl || '/v1/admin';
const ADMIN_TOKEN = window.AdminData?.adminToken || 'admin-secret-key';
const STORE_ID = window.AdminData?.selectedStoreId;

class AdminAPI {
  constructor() {
    this.productsCache = null;
  }

  async apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', `Bearer ${ADMIN_TOKEN}`);

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }

    if (response.status === 204) {
      return {};
    }

    return response.json();
  }

  async getProducts() {
    if (!STORE_ID) throw new Error('No store selected');
    const products = await this.apiRequest(`/stores/${STORE_ID}/products`);
    return products;
  }

  async createProduct(data) {
    if (!STORE_ID) throw new Error('No store selected');
    return this.apiRequest(`/stores/${STORE_ID}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(productId, data) {
    if (!STORE_ID) throw new Error('No store selected');
    return this.apiRequest(`/stores/${STORE_ID}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(productId) {
    if (!STORE_ID) throw new Error('No store selected');
    return this.apiRequest(`/stores/${STORE_ID}/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async updateOrderStatus(orderId, status) {
    if (!STORE_ID) throw new Error('No store selected');
    return this.apiRequest(`/stores/${STORE_ID}/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  openProductModal(productId) {
    // This will be implemented to show a modal for creating/editing products
    // For now, we'll use a simple approach with a form
    if (productId) {
      // Load product and show edit form
      this.loadProductForEdit(productId);
    } else {
      this.showCreateProductForm();
    }
  }

  async loadProductForEdit(productId) {
    // Implementation for loading product data
    console.log('Loading product for edit:', productId);
  }

  showCreateProductForm() {
    // Implementation for showing create form
    console.log('Showing create product form');
  }

  confirmDeleteProduct(productId, productTitle) {
    if (confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      this.deleteProduct(productId).then(() => {
        window.location.reload();
      }).catch(error => {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      });
    }
  }
}

// Initialize global AdminAPI
window.AdminAPI = new AdminAPI();

// Format price helper
function formatPrice(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

window.formatPrice = formatPrice;
