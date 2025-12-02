# Local Testing Guide

This guide will help you test the store template locally.

## Prerequisites

1. **Node.js 18+** installed
2. **Wrangler CLI** installed: `npm install -g wrangler`
3. **Cloudflare account** (for D1 database - free tier works)
4. **Stripe account** (optional, for payment testing)

## Step 1: Install Dependencies

```bash
cd /Users/jayyala/store-template
npm install
```

## Step 2: Set Up Database

### Create D1 Database

```bash
wrangler d1 create store-platform-db
```

This will output a `database_id`. Copy it.

### Update Database ID

Edit `apps/edge-api/wrangler.toml` and replace the placeholder:

```toml
database_id = "your-actual-database-id-here"
```

### Apply Schema and Seed Data

```bash
cd apps/edge-api

# Apply schema
wrangler d1 execute store-platform-db --file=../../infra/db/schema.sql

# Seed initial data
wrangler d1 execute store-platform-db --file=../../infra/db/seed.sql
```

## Step 3: Configure Environment Variables

### Edge API (.dev.vars)

The file `apps/edge-api/.dev.vars` should exist. Update it with your values:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
ADMIN_API_KEY=admin-secret-key
```

**Note:** For local testing without Stripe, you can use placeholder values:
- `STRIPE_SECRET_KEY=sk_test_placeholder`
- `STRIPE_WEBHOOK_SECRET=whsec_placeholder`
- `ADMIN_API_KEY=admin-secret-key` (use this to login to admin dashboard)

### Frontend Apps (.env files)

Create `.env` files for the frontend apps:

**apps/storefront/.env:**
```bash
VITE_API_URL=http://localhost:8787
VITE_STORE_SLUG=demo-store
```

**apps/admin/.env:**
```bash
VITE_API_URL=http://localhost:8787
```

## Step 4: Fix React Dependencies (One-time setup)

The admin app needs React in its local node_modules. Run this once:

```bash
cd apps/admin
cp -r ../../node_modules/react node_modules/ 2>/dev/null || true
cp -r ../../node_modules/react-dom node_modules/ 2>/dev/null || true
```

## Step 5: Start Development Servers

You'll need **3 terminal windows**:

### Terminal 1: Edge API

```bash
cd /Users/jayyala/store-template/apps/edge-api
npm run dev
```

**Note:** Wrangler may use a different port (like 54366 or 54597). Check the terminal output for the actual port. If it's not 8787, update your frontend `.env` files with the correct port.

### Terminal 2: Storefront

```bash
cd /Users/jayyala/store-template/apps/storefront
npm run dev
```

Should be available at: **http://localhost:5173**

### Terminal 3: Admin Dashboard

```bash
cd /Users/jayyala/store-template/apps/admin
npm run dev
```

Should be available at: **http://localhost:5174** (or 5173 if storefront isn't running)

## Step 6: Test the Applications

### Test Storefront

1. Open **http://localhost:5173** in your browser
2. You should see:
   - Products listed (Classic T-Shirt $25.00, Denim Jeans $60.00, Sneakers $85.00)
   - Navigation menu (Home, Cart)
3. Click on a product to view details
4. Try adding items to cart
5. Test the checkout flow (will redirect to Stripe if configured)

### Test Admin Dashboard

1. Open **http://localhost:5174** in your browser
2. You'll see the login page
3. Enter the `ADMIN_API_KEY` from your `.dev.vars` file (default: `admin-secret-key`)
4. Click "Login"
5. You should see:
   - Products page (default)
   - Navigation: Products, Orders, Payments
6. **Products Page:**
   - Select a store from the dropdown
   - View existing products
   - Click "Add Product" to create new products
   - Edit or delete existing products
7. **Orders Page:**
   - View all orders for the selected store
8. **Payments Page:**
   - View payment records

### Test API Directly

You can test the API endpoints directly:

```bash
# Get store info
curl http://localhost:8787/v1/stores/demo-store

# Get products
curl http://localhost:8787/v1/stores/demo-store/products

# Get admin stores (requires auth)
curl -H "Authorization: Bearer admin-secret-key" http://localhost:8787/v1/admin/stores
```

**Note:** Replace `8787` with the actual port if Wrangler uses a different one.

## Troubleshooting

### Admin App Won't Start (React Errors)

If you see errors about React modules:

```bash
cd apps/admin
rm -rf node_modules/react node_modules/react-dom
cp -r ../../node_modules/react node_modules/
cp -r ../../node_modules/react-dom node_modules/
```

Then restart the dev server.

### API Port Mismatch

If Wrangler uses a different port (check terminal output):

1. Note the actual port (e.g., `http://localhost:54366`)
2. Update `apps/storefront/.env`:
   ```
   VITE_API_URL=http://localhost:54366
   ```
3. Update `apps/admin/.env`:
   ```
   VITE_API_URL=http://localhost:54366
   ```
4. Restart the frontend dev servers

### Products Show "$NaN"

This means the API isn't transforming data correctly. Check:
1. Edge API is running
2. API URL in frontend `.env` files matches the actual API port
3. Restart the edge-api server after making code changes

### Database Errors

If you see database connection errors:

1. Verify database ID in `apps/edge-api/wrangler.toml` is correct
2. Re-run schema and seed:
   ```bash
   cd apps/edge-api
   wrangler d1 execute store-platform-db --file=../../infra/db/schema.sql
   wrangler d1 execute store-platform-db --file=../../infra/db/seed.sql
   ```

### CORS Errors

CORS is enabled by default. If you see CORS errors:
1. Check that the API URL in frontend `.env` files is correct
2. Ensure the edge-api server is running
3. Check browser console for specific error messages

## Quick Test Checklist

- [ ] All 3 servers start without errors
- [ ] Storefront loads at http://localhost:5173
- [ ] Products display with correct prices
- [ ] Admin dashboard loads at http://localhost:5174
- [ ] Can login to admin with API key
- [ ] Can view products in admin
- [ ] Can create/edit products in admin
- [ ] API endpoints respond correctly

## Next Steps

Once everything is working:

1. **Test Stripe Integration:**
   - Get a Stripe test key from https://dashboard.stripe.com/test/apikeys
   - Update `.dev.vars` with real test keys
   - Test checkout flow with test card: `4242 4242 4242 4242`

2. **Set Up Webhooks:**
   ```bash
   stripe listen --forward-to localhost:8787/v1/webhooks/stripe
   ```
   Update `.dev.vars` with the webhook secret from Stripe CLI

3. **Customize Store:**
   - Create new stores via admin API
   - Customize theme configurations
   - Add more products

