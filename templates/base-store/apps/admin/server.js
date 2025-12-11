/**
 * Test server for Admin Liquid templates
 * Serves the admin dashboard with Liquid rendering
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import { Liquid } from 'liquidjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as filters from './theme/config/liquid-filters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Liquid engine
const themeRoot = path.resolve(__dirname, 'theme');
const engine = new Liquid({
  root: [
    path.join(themeRoot, 'layouts'),
    path.join(themeRoot, 'templates'),
    path.join(themeRoot, 'snippets')
  ],
  extname: '.liquid',
  cache: false
});

// Register custom filters
engine.registerFilter('asset_url', filters.assetUrlFilter);
engine.registerFilter('money', filters.moneyFilter);
engine.registerFilter('date', filters.dateFilter);
engine.registerFilter('json', filters.jsonFilter);
engine.registerFilter('default', filters.defaultFilter);
engine.registerFilter('slice', filters.sliceFilter);
engine.registerFilter('plus', filters.plusFilter);
engine.registerFilter('modulo', filters.moduloFilter);
engine.registerFilter('split', filters.splitFilter);
engine.registerFilter('times', (value, multiplier) => (parseFloat(value) || 0) * (parseFloat(multiplier) || 0));
engine.registerFilter('where', (array, key, value) => {
  if (!Array.isArray(array)) return [];
  return array.filter(item => item && item[key] === value);
});

// Serve static assets
app.use('/assets', express.static(path.resolve(__dirname, 'theme/assets')));
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// Mock API - In production, this would connect to your edge-api
const API_BASE = process.env.API_URL || 'http://localhost:8787';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-key';

async function fetchStores() {
  try {
    const response = await fetch(`${API_BASE}/v1/admin/stores`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch stores:', error.message);
  }
  
  // Fallback mock data
  return [
    { id: 'store-1', slug: 'demo-store', name: 'Demo Store', status: 'active' }
  ];
}

async function fetchStore(storeId) {
  try {
    const response = await fetch(`${API_BASE}/v1/admin/stores/${storeId}`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch store:', error.message);
  }
  return null;
}

async function fetchProducts(storeId) {
  try {
    const response = await fetch(`${API_BASE}/v1/admin/stores/${storeId}/products`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    if (response.ok) {
      const products = await response.json();
      return products.map(p => ({
        ...p,
        priceCents: p.priceCents || p.price_cents || 0,
        imageUrl: p.imageUrl || p.image_url,
        isActive: p.isActive ?? p.is_active ?? false,
      }));
    }
  } catch (error) {
    console.error('Failed to fetch products:', error.message);
  }
  
  // Fallback mock data
  return [
    {
      id: 'prod-1',
      title: 'Sample Product 1',
      description: 'This is a sample product.',
      priceCents: 2999,
      currency: 'usd',
      imageUrl: null,
      stock: 10,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
}

async function fetchOrders(storeId) {
  try {
    const response = await fetch(`${API_BASE}/v1/admin/stores/${storeId}/orders`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error.message);
  }
  
  // Fallback mock data
  return [];
}

async function fetchPayments(storeId) {
  try {
    const response = await fetch(`${API_BASE}/v1/admin/stores/${storeId}/payments`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch payments:', error.message);
  }
  
  // Fallback mock data
  return [];
}

// Helper to get selected store
async function getSelectedStore(req) {
  const storeId = req.query.store || req.cookies?.selectedStoreId || null;
  if (storeId) {
    const store = await fetchStore(storeId);
    if (store) return store;
  }
  
  // Default to first store
  const stores = await fetchStores();
  return stores[0] || null;
}

// Helper to render template with layout
async function renderTemplate(templateName, vars) {
  const content = await engine.renderFile(templateName, vars);
  const layoutVars = {
    ...vars,
    content_for_layout: content
  };
  return await engine.renderFile('admin', layoutVars);
}

// Dashboard
app.get('/', async (req, res) => {
  try {
    const stores = await fetchStores();
    const selectedStore = await getSelectedStore(req);
    
    if (!selectedStore) {
      return res.send(`
        <html><body style="padding: 2rem; font-family: system-ui;">
          <h1>No stores available</h1>
          <p>Please create a store first.</p>
        </body></html>
      `);
    }
    
    const [products, orders, payments] = await Promise.all([
      fetchProducts(selectedStore.id),
      fetchOrders(selectedStore.id),
      fetchPayments(selectedStore.id)
    ]);
    
    const html = await renderTemplate('dashboard', {
      stores,
      selected_store: selectedStore,
      products,
      orders,
      payments,
      template: 'dashboard',
      api_url: API_BASE + '/v1/admin',
      admin_token: ADMIN_TOKEN,
      page_title: 'Dashboard'
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

// Products
app.get('/products', async (req, res) => {
  try {
    const stores = await fetchStores();
    const selectedStore = await getSelectedStore(req);
    
    if (!selectedStore) {
      return res.redirect('/');
    }
    
    const products = await fetchProducts(selectedStore.id);
    
    const html = await renderTemplate('products', {
      stores,
      selected_store: selectedStore,
      products,
      template: 'products',
      api_url: API_BASE + '/v1/admin',
      admin_token: ADMIN_TOKEN,
      page_title: 'Products'
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering products page:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

// Orders
app.get('/orders', async (req, res) => {
  try {
    const stores = await fetchStores();
    const selectedStore = await getSelectedStore(req);
    
    if (!selectedStore) {
      return res.redirect('/');
    }
    
    const orders = await fetchOrders(selectedStore.id);
    
    const html = await renderTemplate('orders', {
      stores,
      selected_store: selectedStore,
      orders,
      template: 'orders',
      api_url: API_BASE + '/v1/admin',
      admin_token: ADMIN_TOKEN,
      page_title: 'Orders'
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering orders page:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

// Payments
app.get('/payments', async (req, res) => {
  try {
    const stores = await fetchStores();
    const selectedStore = await getSelectedStore(req);
    
    if (!selectedStore) {
      return res.redirect('/');
    }
    
    const payments = await fetchPayments(selectedStore.id);
    
    const html = await renderTemplate('payments', {
      stores,
      selected_store: selectedStore,
      payments,
      template: 'payments',
      api_url: API_BASE + '/v1/admin',
      admin_token: ADMIN_TOKEN,
      page_title: 'Payments'
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering payments page:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

app.listen(port, () => {
  console.log(`🚀 Admin server running at http://localhost:${port}`);
  console.log(`🔗 API URL: ${API_BASE}`);
  console.log(`\nAvailable routes:`);
  console.log(`  - http://localhost:${port}/`);
  console.log(`  - http://localhost:${port}/products`);
  console.log(`  - http://localhost:${port}/orders`);
  console.log(`  - http://localhost:${port}/payments`);
});
