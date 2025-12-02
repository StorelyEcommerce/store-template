# Multi-Tenant E-Commerce Platform

A Cloudflare-native, API-first, multi-tenant e-commerce platform built with TypeScript, React, and modern web technologies.

## Features

✅ **Multi-tenant architecture** - Support for multiple stores with isolated data  
✅ **API-first design** - Clean REST APIs for frontends and external integrations  
✅ **Themeable storefronts** - Each store can have its own theme configuration  
✅ **Stripe checkout integration** - Secure payment processing  
✅ **Admin dashboard** - Manage products, orders, and payments  
✅ **Webhook handling** - Automatic order and payment updates  
✅ **Type-safe shared packages** - Consistent types across the platform  

## Project Structure

```
├── apps/
│   ├── edge-api/      # Cloudflare Workers API (backend)
│   ├── storefront/     # Buyer-facing React storefront
│   └── admin/          # Admin dashboard for store management
├── packages/
│   ├── shared-types/   # TypeScript types and interfaces
│   ├── shared-utils/   # API client, formatters, helpers
│   ├── shared-config/  # Constants and configuration
│   └── ui/             # Shared React UI components
└── infra/
    ├── db/             # Database schema and seed data
    └── wrangler/       # Cloudflare Workers configuration
```

## Prerequisites

- Node.js 18+ and npm/pnpm
- Cloudflare account (for D1 database and Workers)
- Stripe account (for payments)
- Wrangler CLI: `npm install -g wrangler`

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
cd /Users/jayyala/store-template
./setup-local.sh
```

This will:
- Install all dependencies
- Build shared packages
- Set up React dependencies for admin app
- Create `.env` files with default values

### Option 2: Manual Setup

### 1. Install Dependencies

```bash
# From the root directory
npm install
# or
pnpm install
```

### 1a. Fix Admin App Dependencies

The admin app needs React in its local node_modules:

```bash
cd apps/admin
mkdir -p node_modules
cp -r ../../node_modules/react node_modules/ 2>/dev/null || true
cp -r ../../node_modules/react-dom node_modules/ 2>/dev/null || true
cd ../..
```

### 2. Set Up Cloudflare D1 Database

```bash
# Create a D1 database
wrangler d1 create store-platform-db

# This will output a database_id. Update infra/wrangler/wrangler.toml with this ID.
```

### 3. Apply Database Schema

```bash
# From the edge-api directory
cd apps/edge-api

# Apply schema
wrangler d1 execute store-platform-db --file=../../infra/db/schema.sql

# Seed initial data
wrangler d1 execute store-platform-db --file=../../infra/db/seed.sql
```

### 4. Configure Environment Variables

Create a `.dev.vars` file in `apps/edge-api/`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_API_KEY=your-secret-admin-key
```

Update `infra/wrangler/wrangler.toml` with your D1 database ID and environment variables.

### 5. Start Development Servers

You need **3 separate terminal windows**:

**Terminal 1 - Edge API:**
```bash
cd apps/edge-api
npm run dev
```

**Important:** Check the terminal output for the actual port. It should be `http://localhost:8787`, but Wrangler may use a different port (like `http://localhost:54366`). If it's different, update your frontend `.env` files with the correct port.

**Terminal 2 - Storefront:**
```bash
cd apps/storefront
npm run dev
```
Storefront will be available at: **http://localhost:5173**

**Terminal 3 - Admin Dashboard:**
```bash
cd apps/admin
npm run dev
```
Admin will be available at: **http://localhost:5174** (or 5173 if storefront isn't running)

### 6. Configure Frontend Environment Variables

Create `.env` files in the frontend apps:

**apps/storefront/.env:**
```
VITE_API_URL=http://localhost:8787
VITE_STORE_SLUG=demo-store
```

**apps/admin/.env:**
```
VITE_API_URL=http://localhost:8787
```

## Testing the Complete Flow

### 1. Access the Storefront

1. Open http://localhost:5173
2. You should see products from the seeded database
3. Click on a product to view details
4. Add items to cart or checkout directly

### 2. Complete a Purchase

1. Add products to cart or use "Buy Now"
2. Enter your email address
3. Click "Checkout" - you'll be redirected to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete the payment

### 3. View Orders in Admin

1. Open http://localhost:5174
2. Login with your `ADMIN_API_KEY` (from `.dev.vars`)
3. Navigate to "Orders" to see completed orders
4. Navigate to "Payments" to see payment records

### 4. Manage Products

1. In the admin dashboard, go to "Products"
2. Select a store from the dropdown
3. Click "Add Product" to create new products
4. Edit or delete existing products

## Stripe Webhook Setup (Local Development)

For local webhook testing, use Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8787/v1/webhooks/stripe
```

The CLI will provide a webhook signing secret. Update your `.dev.vars` with this secret.

## API Endpoints

### Public Store API

- `GET /v1/stores/:slug` - Get store details and theme config
- `GET /v1/stores/:slug/products` - List active products
- `GET /v1/stores/:slug/products/:id` - Get product details
- `POST /v1/stores/:slug/checkout` - Create Stripe checkout session

### Admin API (Requires Authorization: Bearer <ADMIN_API_KEY>)

- `GET /v1/admin/stores` - List all stores
- `POST /v1/admin/stores` - Create a new store
- `GET /v1/admin/stores/:id` - Get store details
- `PUT /v1/admin/stores/:id` - Update store
- `GET /v1/admin/stores/:storeId/products` - List products
- `POST /v1/admin/stores/:storeId/products` - Create product
- `PUT /v1/admin/stores/:storeId/products/:productId` - Update product
- `DELETE /v1/admin/stores/:storeId/products/:productId` - Delete product
- `GET /v1/admin/stores/:storeId/orders` - List orders
- `GET /v1/admin/stores/:storeId/payments` - List payments

### Webhooks

- `POST /v1/webhooks/stripe` - Stripe webhook endpoint

## Database Schema

The platform uses Cloudflare D1 (SQLite) with the following main tables:

- `stores` - Store/tenant information and theme configs
- `products` - Product catalog (scoped by store_id)
- `orders` - Customer orders (scoped by store_id)
- `order_items` - Order line items
- `payments` - Payment records (scoped by store_id)
- `users` - Admin and customer users
- `api_keys` - API keys for integrations
- `webhook_endpoints` - External webhook subscriptions
- `webhook_events` - Webhook delivery logs

All store-scoped tables include `store_id` for multi-tenant isolation.

## Deployment

### Deploy Edge API

```bash
cd apps/edge-api
wrangler deploy
```

### Deploy Storefront & Admin

Both frontend apps can be deployed to Cloudflare Pages:

```bash
cd apps/storefront
npm run build
# Upload dist/ to Cloudflare Pages

cd apps/admin
npm run build
# Upload dist/ to Cloudflare Pages
```

Or use Wrangler Pages:

```bash
wrangler pages deploy apps/storefront/dist --project-name=storefront
wrangler pages deploy apps/admin/dist --project-name=admin
```

## Development Notes

- The platform is designed to be API-first, so external applications can integrate easily
- Multi-tenant isolation is enforced at the database level via `store_id`
- Theme configuration allows stores to customize their frontend without code changes
- Cart state is managed client-side with localStorage
- Admin authentication uses a simple API key (can be upgraded to JWT/sessions later)

## Troubleshooting

**Admin app won't start (React module errors):**
```bash
cd apps/admin
rm -rf node_modules/react node_modules/react-dom
cp -r ../../node_modules/react node_modules/
cp -r ../../node_modules/react-dom node_modules/
```
Then restart the dev server.

**API port mismatch:**
- Wrangler may use a different port than 8787
- Check the terminal output when starting `npm run dev` in `apps/edge-api`
- Update `VITE_API_URL` in both `apps/storefront/.env` and `apps/admin/.env` to match the actual port
- Restart the frontend dev servers

**Database connection issues:**
- Ensure D1 database is created and ID is correct in `wrangler.toml`
- Check that schema has been applied: `wrangler d1 execute store-platform-db --file=../../infra/db/schema.sql`

**Products show "$NaN":**
- Verify the API is running and accessible
- Check that `VITE_API_URL` in frontend `.env` files matches the actual API port
- Restart edge-api after code changes

**Stripe webhook not working:**
- Verify webhook secret in `.dev.vars` matches Stripe CLI output
- Check that webhook endpoint URL is correct
- Ensure Stripe CLI is forwarding to the correct port

**Frontend can't connect to API:**
- Verify `VITE_API_URL` is set correctly in frontend `.env` files
- Check that edge-api is running on the expected port
- Ensure CORS is enabled (it should be by default)

**See TESTING.md for a comprehensive local testing guide.**

## License

MIT
