/**
 * Test server for Liquid templates
 * Serves the storefront with Liquid rendering
 */

import express from 'express';
import { Liquid } from 'liquidjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as filters from './theme/config/liquid-filters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

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

// Serve static assets
app.use('/assets', express.static(path.resolve(__dirname, 'theme/assets')));
app.use('/public', express.static(path.resolve(__dirname, 'public')));

// Mock API - In production, this would connect to your edge-api
const API_BASE = process.env.API_URL || 'http://localhost:8787';
const STORE_SLUG = process.env.STORE_SLUG || 'demo-store';

async function fetchStore() {
  try {
    const response = await fetch(`${API_BASE}/v1/stores/${STORE_SLUG}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch store:', error.message);
  }
  
  // Fallback mock data
  return {
    id: 'store-1',
    slug: STORE_SLUG,
    name: 'Storely',
    currency: 'usd',
    themeConfig: {}
  };
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE}/v1/stores/${STORE_SLUG}/products`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch products:', error.message);
  }
  
  // Fallback mock data
  return [
    {
      id: 'prod-1',
      slug: 'sample-product-1',
      title: 'Sample Product 1',
      description: 'This is a sample product description.',
      priceCents: 2999,
      currency: 'usd',
      imageUrl: null,
      stock: 10,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-2',
      slug: 'sample-product-2',
      title: 'Sample Product 2',
      description: 'Another sample product with a longer description to show how text wraps.',
      priceCents: 4999,
      currency: 'usd',
      imageUrl: null,
      stock: 5,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-3',
      slug: 'sample-product-3',
      title: 'Sample Product 3',
      description: 'Yet another product.',
      priceCents: 1999,
      currency: 'usd',
      imageUrl: null,
      stock: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod-4',
      slug: 'sample-product-4',
      title: 'Sample Product 4',
      description: 'Fourth product in our collection.',
      priceCents: 7999,
      currency: 'usd',
      imageUrl: null,
      stock: 15,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
}

async function fetchProduct(slug) {
  try {
    const response = await fetch(`${API_BASE}/v1/stores/${STORE_SLUG}/products/${slug}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch product:', error.message);
  }
  
  // Fallback - try to find in products list
  const products = await fetchProducts();
  return products.find(p => p.slug === slug || p.id === slug) || null;
}

// Helper to render template with layout
async function renderTemplate(templateName, vars) {
  // Render template content (templates are in the templates root)
  const content = await engine.renderFile(templateName, vars);
  
  // Wrap content in layout (layouts are in the layouts root)
  const layoutVars = {
    ...vars,
    content_for_layout: content
  };
  return await engine.renderFile('theme', layoutVars);
}

// Homepage
app.get('/', async (req, res) => {
  try {
    const store = await fetchStore();
    const products = await fetchProducts();
    const featuredProducts = products.slice(0, 4);
    
    const html = await renderTemplate('index', {
      store,
      featured_products: featuredProducts,
      template: 'index',
      api_url: API_BASE + '/v1/stores/',
      page_title: 'Home'
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering homepage:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

// Products listing
app.get('/products', async (req, res) => {
  try {
    const store = await fetchStore();
    let products = await fetchProducts();
    
    const searchQuery = req.query.search || '';
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    const html = await renderTemplate('collection', {
      store,
      products,
      template: 'collection',
      api_url: API_BASE + '/v1/stores/',
      page_title: searchQuery ? `Search: ${searchQuery}` : 'Products',
      request: {
        params: {
          search: searchQuery
        }
      }
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering products page:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

// Product detail
app.get('/products/:slug', async (req, res) => {
  try {
    const store = await fetchStore();
    const product = await fetchProduct(req.params.slug);
    
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    const html = await renderTemplate('product', {
      store,
      product,
      template: 'product',
      api_url: API_BASE + '/v1/stores/',
      page_title: product.title
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering product page:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

// Cart page
app.get('/cart', async (req, res) => {
  try {
    const store = await fetchStore();
    
    const html = await renderTemplate('cart', {
      store,
      template: 'cart',
      api_url: API_BASE + '/v1/stores/',
      page_title: 'Cart'
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering cart page:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

// Success page
app.get('/success', async (req, res) => {
  try {
    const store = await fetchStore();
    
    const html = await renderTemplate('success', {
      store,
      template: 'success',
      api_url: API_BASE + '/v1/stores/',
      page_title: 'Order Success',
      request: {
        params: {
          session_id: req.query.session_id || ''
        }
      }
    });
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering success page:', error);
    res.status(500).send(`Error: ${error.message}\n${error.stack}`);
  }
});

app.listen(port, () => {
  console.log(`🚀 Storefront server running at http://localhost:${port}`);
  console.log(`📦 Store slug: ${STORE_SLUG}`);
  console.log(`🔗 API URL: ${API_BASE}`);
  console.log(`\nAvailable routes:`);
  console.log(`  - http://localhost:${port}/`);
  console.log(`  - http://localhost:${port}/products`);
  console.log(`  - http://localhost:${port}/products/:slug`);
  console.log(`  - http://localhost:${port}/cart`);
  console.log(`  - http://localhost:${port}/success`);
});
