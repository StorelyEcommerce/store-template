# Liquid Theme for Storefront

This directory contains the Liquid template files for the storefront. The theme follows a Shopify-like structure with layouts, templates, snippets, and assets.

## Directory Structure

```
theme/
├── layouts/
│   └── theme.liquid          # Base layout with header and footer
├── templates/
│   ├── index.liquid          # Homepage
│   ├── collection.liquid     # Products listing page
│   ├── product.liquid        # Product detail page
│   ├── cart.liquid           # Shopping cart page
│   └── success.liquid        # Order success page
├── snippets/
│   ├── header.liquid         # Header component
│   ├── footer.liquid         # Footer component
│   └── product-card.liquid   # Product card component
└── assets/
    ├── index.css             # Main stylesheet
    ├── cart.js               # Cart API and functionality
    └── app.js                # General app utilities
```

## Liquid Variables

The templates expect the following variables to be available:

### Global Variables
- `store` - Store object with:
  - `id` - Store ID
  - `slug` - Store slug
  - `name` - Store name
  - `currency` - Currency code (e.g., 'usd')
  - `themeConfig` - Theme configuration object

### Page-Specific Variables

#### Homepage (index.liquid)
- `featured_products` - Array of featured products (first 4 products)

#### Collection Page (collection.liquid)
- `products` - Array of all products
- `request.params.search` - Search query parameter

#### Product Page (product.liquid)
- `product` - Single product object with:
  - `id` - Product ID
  - `slug` - Product slug
  - `title` - Product title
  - `description` - Product description
  - `priceCents` - Price in cents
  - `currency` - Currency code
  - `imageUrl` - Product image URL
  - `stock` - Stock quantity
  - `isActive` - Active status
  - `createdAt` - Creation date

#### Cart Page (cart.liquid)
- Cart is managed client-side via JavaScript (see `cart.js`)

#### Success Page (success.liquid)
- `request.params.session_id` - Stripe session ID

## Liquid Filters

### Money Filter
The theme uses a custom `money` filter for formatting prices:

```liquid
{{ product.priceCents | divided_by: 100.0 | money: store.currency }}
```

Note: You may need to implement a custom Liquid filter for the `money` filter if your Liquid renderer doesn't support it. See the JavaScript implementation in `product.liquid` for an alternative approach.

## Asset URLs

Assets are referenced using the `asset_url` filter:

```liquid
<link rel="stylesheet" href="{{ 'index.css' | asset_url }}">
<script src="{{ 'cart.js' | asset_url }}" defer></script>
```

## JavaScript API

The theme includes a `CartAPI` class for managing the shopping cart:

```javascript
// Add item to cart
await window.CartAPI.addToCart(productId, quantity);

// Get current cart
const cart = await window.CartAPI.getCart();

// Update item quantity
await window.CartAPI.updateQuantity(productId, quantity);

// Remove item from cart
await window.CartAPI.removeFromCart(productId);

// Clear cart
await window.CartAPI.clearCart();

// Create checkout session
const { checkoutUrl } = await window.CartAPI.createCheckout(email, shippingAddress);
```

## Integration

To use these Liquid templates, you need a server that can render Liquid templates. The server should:

1. Load the appropriate template based on the route
2. Fetch data from your API (e.g., `/v1/stores/:slug/products`)
3. Render the template with the data
4. Serve the rendered HTML

### Example Server Integration (Node.js with liquidjs)

```javascript
const { Liquid } = require('liquidjs');
const path = require('path');

const engine = new Liquid({
  root: path.resolve(__dirname, 'theme'),
  extname: '.liquid'
});

// Register asset_url filter
engine.registerFilter('asset_url', (value) => {
  return `/assets/${value}`;
});

// Register money filter
engine.registerFilter('money', (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(value);
});

// Render homepage
async function renderHomepage(store, products) {
  return engine.renderFile('templates/index', {
    store,
    featured_products: products.slice(0, 4),
    template: 'index'
  });
}
```

## Styling

The theme uses a warm cream and terracotta color palette. All styles are in `assets/index.css` using CSS custom properties for easy theming.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox
- LocalStorage for cart persistence
