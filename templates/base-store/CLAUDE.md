# Base Store Template

This is a full-stack ecommerce store template with customer storefront, admin dashboard, and Cloudflare Workers API.

## Project Structure

```
base-store/
├── src/                    # Customer-facing storefront (React + Vite)
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   ├── index.css          # Global styles (Tailwind)
│   ├── api/               # API client
│   ├── components/        # Reusable components
│   ├── context/           # React context (Cart)
│   └── pages/             # Page components
├── admin-app/             # Admin dashboard (React + Vite)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── [config files]
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
└── public/                # Static assets
```

## Main Storefront (Root)

The main storefront is the primary app that runs when you execute `npm run dev` or `bun run dev`.

### Features
- Product catalog with grid views
- Shopping cart with local storage persistence
- Product detail pages
- Checkout process
- Success/confirmation page
- Responsive design with warm cream palette

### Key Files
- `src/App.tsx` - Main app with React Router
- `src/pages/HomePage.tsx` - Landing page with featured products
- `src/pages/ProductsPage.tsx` - Product listing
- `src/pages/ProductDetailPage.tsx` - Single product view
- `src/pages/CartPage.tsx` - Shopping cart
- `src/components/Header.tsx` - Navigation header
- `src/components/ProductCard.tsx` - Product display card
- `src/context/CartContext.tsx` - Cart state management
- `src/api/client.ts` - API client for backend

## Admin Dashboard (admin-app/)

Separate React app for store administration.

### Features
- Dashboard with key metrics
- Product management (CRUD)
- Order management
- Payment monitoring
- Dark theme with responsive sidebar

### Key Files
- `admin-app/src/App.tsx` - Admin app with routing
- `admin-app/src/pages/DashboardPage.tsx` - Overview metrics
- `admin-app/src/pages/ProductsPage.tsx` - Product management
- `admin-app/src/pages/OrdersPage.tsx` - Order tracking
- `admin-app/src/components/Sidebar.tsx` - Navigation sidebar

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

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Routing**: React Router v7
- **Icons**: Lucide React
- **API**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)

## Running Locally

```bash
# Install dependencies
npm install

# Start ALL services (storefront, admin, API) concurrently
npm run dev

# Or start services individually:
npm run dev:storefront  # Storefront on port 5173
npm run dev:admin       # Admin dashboard on port 5174
npm run dev:api         # API worker on port 8787

# Initialize database
npm run db:init
npm run db:seed
```

## Ports

- **Storefront**: Port 5173 (or PORT env var)
- **Admin Dashboard**: Port 5174
- **Edge API**: Port 8787

## Environment Variables

### Storefront
- `VITE_API_URL` - API base URL (default: http://localhost:8787)
- `VITE_STORE_SLUG` - Store identifier (default: demo-store)

### Admin
- `VITE_API_URL` - API base URL
- `VITE_STORE_SLUG` - Store identifier

## Database Schema

Located in `infra/db/schema.sql`:
- `stores` - Store configuration
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records

## DO NOT MODIFY

The following files should not be modified:
- package.json
- vite.config.ts
- tsconfig.json / tsconfig.app.json / tsconfig.node.json
- tailwind.config.js / tailwind.config.cjs
- postcss.config.cjs
- eslint.config.js
- admin-app/[config files]
- api-worker/package.json
- api-worker/wrangler.toml
- infra/db/schema.sql (structure)
