# AI Context for Base Store Template

This document provides context for AI assistants working on this ecommerce store template.

## Project Overview

This is a full-stack ecommerce template built for Cloudflare's edge infrastructure. It consists of three main applications and shared packages organized as a monorepo.

## Architecture

```
base-store/
├── apps/
│   ├── storefront/     # Customer-facing React app (port 5173)
│   ├── admin/          # Admin dashboard React app (port 5174)
│   └── edge-api/       # Cloudflare Workers API with Hono (port 8787)
├── packages/
│   ├── shared-config/  # Shared configuration constants
│   ├── shared-types/   # TypeScript interfaces and types
│   ├── shared-utils/   # Utility functions (formatters, API client)
│   └── ui/             # Shared React UI components
└── infra/
    └── db/             # D1 database schema and seed files
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Routing | React Router v7 |
| Icons | Lucide React |
| API | Hono (on Cloudflare Workers) |
| Database | Cloudflare D1 (SQLite) |
| Payments | Stripe (integration hooks) |

## Key Files to Understand

### Storefront (`apps/storefront/`)
- `src/App.tsx` - Main app with routes
- `src/api/client.ts` - API client with all store/cart methods
- `src/context/CartContext.tsx` - Cart state management (uses localStorage)
- `src/pages/HomePage.tsx` - Landing page with featured products
- `src/pages/ProductDetailPage.tsx` - Single product view with add to cart
- `src/pages/CartPage.tsx` - Cart with checkout form

### Admin Dashboard (`apps/admin/`)
- `src/App.tsx` - Main app with sidebar navigation
- `src/api/client.ts` - Admin API client
- `src/context/StoreContext.tsx` - Store state management
- `src/pages/DashboardPage.tsx` - Stats and overview
- `src/pages/ProductsPage.tsx` - Product CRUD operations
- `src/pages/OrdersPage.tsx` - Order management

### Edge API (`apps/edge-api/`)
- `src/index.ts` - Main Hono app with route registration
- `src/routes/store.ts` - Public store endpoints (products, cart, checkout)
- `src/routes/admin.ts` - Admin endpoints (CRUD for products, orders)
- `src/routes/webhook.ts` - Stripe webhook handlers
- `src/middleware/store-resolver.ts` - Resolves store from slug
- `src/middleware/auth.ts` - Admin authentication
- `wrangler.toml` - Cloudflare Workers configuration

### Database (`infra/db/`)
- `schema.sql` - Table definitions (stores, products, orders, order_items, payments)
- `seed.sql` - Sample data for demo-store

## API Endpoints

### Public (Store)
```
GET  /v1/stores/:slug                    # Get store config
GET  /v1/stores/:slug/products           # List products
GET  /v1/stores/:slug/products/:id       # Get product
POST /v1/stores/:slug/checkout           # Create Stripe checkout
```

### Admin (Protected)
```
GET    /v1/admin/products                # List all products
POST   /v1/admin/products                # Create product
PUT    /v1/admin/products/:id            # Update product
DELETE /v1/admin/products/:id            # Delete product
GET    /v1/admin/orders                  # List orders
GET    /v1/admin/orders/:id              # Get order details
```

## Environment Variables

### Frontend Apps
- `VITE_API_URL` - API base URL (default: `http://localhost:8787`)
- `VITE_STORE_SLUG` - Store identifier (default: `demo-store`)

### Edge API (in wrangler.toml)
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ADMIN_API_KEY` - Admin API authentication key

## Design System

### Storefront Theme
- **Background**: Warm cream (`#faf8f5`)
- **Primary/Accent**: Terracotta (`#d95f3d`)
- **Text**: Dark brown (`#2d2924`)
- **Headings Font**: Fraunces (serif)
- **Body Font**: Source Sans 3

### Admin Theme
- Dark theme with accent colors
- Sidebar navigation pattern

## Common Patterns

### Cart Management (Storefront)
Cart is stored in localStorage and synced with product data from API:
```typescript
const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
```

### API Requests
Both apps use a typed API client:
```typescript
// Storefront
import { api } from '../api/client';
const products = await api.getProducts();

// Admin
import { adminApi } from '../api/client';
const orders = await adminApi.getOrders();
```

### Price Handling
Prices are stored in cents and formatted for display:
```typescript
import { formatPrice } from '../api/client';
formatPrice(2500, 'usd'); // "$25.00"
```

## DO NOT MODIFY

These files are configuration files that should not be edited:
- `package.json` (all)
- `tsconfig.json` files
- `vite.config.ts` files
- `wrangler.toml`
- `tailwind.config.js/cjs`
- `postcss.config.js/cjs`
- `eslint.config.js`

## Development Commands

```bash
# Install dependencies
npm install

# Initialize database (required before first run)
npm run db:init
npm run db:seed

# Run individual apps
npm run dev:api         # API on :8787
npm run dev:storefront  # Storefront on :5173
npm run dev:admin       # Admin on :5174

# Build
npm run build:packages  # Build shared packages first
npm run build           # Build all apps
```

## Database Schema

```sql
-- Main tables
stores          # Store configuration and theme
products        # Product catalog
orders          # Customer orders
order_items     # Line items in orders
payments        # Payment records (Stripe)
```

## Stripe Integration

Checkout flow:
1. Customer fills cart and checkout form
2. Frontend calls `POST /v1/stores/:slug/checkout`
3. API creates Stripe Checkout Session
4. Customer redirected to Stripe
5. On success, redirected to `/success?session_id=...`
6. Webhook updates order status

## Tips for AI Assistants

1. **Always check the API client** (`src/api/client.ts`) before adding new API calls
2. **Use existing components** from `packages/ui/` when possible
3. **Follow the existing patterns** for new pages/features
4. **Prices are in cents** - always use `formatPrice()` for display
5. **Cart is client-side** - no server-side cart storage
6. **Check D1 schema** in `infra/db/schema.sql` for database structure
7. **Admin routes are protected** - check `src/middleware/auth.ts` for auth logic

