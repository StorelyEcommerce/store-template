# Base Store Template

This is a full-stack ecommerce store template with customer storefront, admin dashboard, and Cloudflare Workers API.

## Project Structure

```
base-store/
├── storefront-app/         # Customer-facing storefront (Express + Liquid)
│   ├── server.js          # Express server with LiquidJS
│   ├── theme/
│   │   ├── layouts/       # Base layouts (theme.liquid)
│   │   ├── templates/     # Page templates (index, product, cart, etc.)
│   │   ├── snippets/      # Reusable components (header, footer, product-card)
│   │   ├── assets/        # CSS, JS (styles.css → compiled → index.css)
│   │   └── config/        # Liquid filters
│   ├── tailwind.config.js # Tailwind configuration
│   └── package.json       # Storefront dependencies
├── admin-app/             # Admin dashboard (Express + Liquid)
│   ├── server.js
│   ├── theme/
│   └── package.json
├── api-worker/            # Cloudflare Workers API (Hono)
│   ├── src/
│   │   ├── index.ts       # API entry point
│   │   ├── middleware/    # Auth, store resolver
│   │   ├── routes/        # API routes
│   │   └── types.ts
│   └── wrangler.toml
├── infra/
│   └── db/
│       ├── schema.sql     # D1 database schema
│       └── seed.sql       # Sample data
└── package.json           # Root orchestration scripts
```

## Customer Storefront (storefront-app/)

Server-side rendered storefront using Express and Liquid templates.

### Features
- Product catalog with grid views
- Shopping cart with local storage persistence
- Product detail pages
- Checkout process
- Success/confirmation page
- Responsive design with warm cream palette
- SEO-friendly server-side rendering

### Key Files
- `storefront-app/server.js` - Express server with Liquid config
- `storefront-app/theme/templates/index.liquid` - Homepage
- `storefront-app/theme/templates/collection.liquid` - Products page
- `storefront-app/theme/templates/product.liquid` - Product detail
- `storefront-app/theme/templates/cart.liquid` - Shopping cart
- `storefront-app/theme/snippets/header.liquid` - Navigation header
- `storefront-app/theme/snippets/product-card.liquid` - Product card
- `storefront-app/theme/assets/styles.css` - Source CSS (Tailwind)
- `storefront-app/theme/assets/index.css` - Compiled CSS (auto-generated)
- `storefront-app/theme/assets/cart.js` - Cart functionality

### CSS Build System
The storefront uses Tailwind CSS with a build step:
- **Source**: `theme/assets/styles.css` - Edit this file, supports @tailwind, @apply
- **Output**: `theme/assets/index.css` - Auto-compiled, DO NOT edit
- **Build**: `npm run build:css` compiles styles.css → index.css

## Admin Dashboard (admin-app/)

Server-side rendered admin dashboard using Express and Liquid.

### Features
- Dashboard with key metrics
- Product management (CRUD)
- Order management
- Payment monitoring
- Dark theme with responsive sidebar

### Key Files
- `admin-app/server.js` - Express server
- `admin-app/theme/templates/` - Admin page templates
- `admin-app/theme/snippets/` - Admin components

## API Worker (api-worker/)

Cloudflare Workers API built with Hono.

### Features
- RESTful API endpoints
- Store resolution middleware
- Authentication middleware
- D1 database integration

### Key Files
- `api-worker/src/index.ts` - Hono app entry
- `api-worker/src/routes/store.ts` - Public store routes
- `api-worker/src/routes/admin.ts` - Admin routes
- `api-worker/src/middleware/auth.ts` - Auth middleware

## Tech Stack

- **Storefront/Admin**: Node.js, Express, LiquidJS, Tailwind CSS
- **Icons**: Lucide (via inline SVG)
- **API**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)

## Running Locally

```bash
# Install dependencies (also builds CSS)
npm install

# Start ALL services (storefront, admin, API) concurrently
npm run dev

# Or start services individually:
npm run dev:storefront  # Storefront on port 3000
npm run dev:admin       # Admin dashboard on port 3001
npm run dev:api         # API worker on port 8787

# Initialize database
npm run db:init
npm run db:seed
```

## Ports

- **Storefront**: Port 3000 (or PORT env var)
- **Admin Dashboard**: Port 3001
- **Edge API**: Port 8787

## Environment Variables

### Storefront/Admin
- `PORT` - Server port
- `API_URL` - API base URL (default: http://localhost:8787)
- `STORE_SLUG` - Store identifier (default: demo-store)

## Database Schema

Located in `infra/db/schema.sql`:
- `stores` - Store configuration
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records

## DO NOT MODIFY

The following files should not be modified:
- package.json (root and apps)
- storefront-app/tailwind.config.js
- api-worker/wrangler.toml
- infra/db/schema.sql (structure)
