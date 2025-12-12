# Storely Store Templates

This repository contains ecommerce store templates for use with the Storely Agent platform and Cloudflare Vide SDK.

## Repository Structure

```
store-template/
├── deploy_templates.sh      # Deployment script for R2
├── template_catalog.json    # Template catalog metadata
├── templates/               # Template source directories
│   └── base-store/          # Full-stack ecommerce template
│       ├── package.json     # Root workspace package.json
│       ├── .donttouch_files.json
│       ├── .redacted_files.json
│       ├── .important_files.json
│       ├── apps/
│       │   ├── storefront/  # Customer-facing React app
│       │   ├── admin/       # Admin dashboard React app
│       │   └── edge-api/    # Cloudflare Workers API
│       ├── packages/
│       │   ├── shared-config/
│       │   ├── shared-types/
│       │   ├── shared-utils/
│       │   └── ui/
│       └── infra/
│           └── db/          # D1 database schema & seeds
└── zips/                    # Generated zip files
```

## Available Templates

### base-store

A comprehensive full-stack ecommerce template with:

**Storefront (Customer-Facing):**
- Liquid templates for server-side rendering (SEO friendly)
- Product catalog with grid views and search
- Shopping cart with local storage persistence
- Checkout flow with Stripe integration hooks
- Beautiful UI with warm cream palette and terracotta accents
- Responsive design for all devices

**Admin Dashboard:**
- Liquid templates for server-side rendering
- Dashboard with key metrics and statistics
- Product management (CRUD operations)
- Order management and tracking
- Payment monitoring
- Responsive sidebar navigation
- Dark theme design

**Edge API (Cloudflare Workers):**
- RESTful API built with Hono
- Store resolution middleware
- Authentication middleware
- Product, order, and webhook routes
- D1 database integration

**Shared Packages:**
- `shared-config` - Shared configuration
- `shared-types` - TypeScript interfaces and types
- `shared-utils` - API client, formatters
- `ui` - Reusable components (styles)

**Infrastructure:**
- D1 database schema (`infra/db/schema.sql`)
- Sample seed data (`infra/db/seed.sql`)

**Tech Stack:**
- LiquidJS for templating (Server-Side Rendering)
- Node.js & Express for serving apps
- Tailwind CSS for styling
- Hono for API routing
- Cloudflare Workers & D1
- Lucide for icons

## Deployment

Deploy templates to Cloudflare R2:

```bash
# Set required environment variables
export BUCKET_NAME=your-r2-bucket-name
export CLOUDFLARE_API_TOKEN=your-api-token
export CLOUDFLARE_ACCOUNT_ID=your-account-id

# Run deployment script
./deploy_templates.sh
```

The script will:
1. Upload `template_catalog.json` to R2
2. Create zip files for each template in `templates/`
3. Upload zip files to R2

## Adding New Templates

1. Create a new directory under `templates/` (e.g., `templates/store-fashion/`)
2. Add your template files (must include `package.json`)
3. Add optional metadata files:
   - `.donttouch_files.json` - Files that shouldn't be modified
   - `.redacted_files.json` - Files to hide from AI
   - `.important_files.json` - Important files to highlight
4. Update `template_catalog.json` with the new template entry
5. Run `./deploy_templates.sh` to deploy

## Template Catalog Format

```json
[
  {
    "name": "template-name",
    "language": "typescript",
    "frameworks": ["react", "vite", "tailwindcss"],
    "description": {
      "selection": "Description for AI template selection",
      "usage": "Detailed usage instructions for developers"
    }
  }
]
```

## Local Development

To work on the base-store template locally:

```bash
cd templates/base-store

# Initialize and seed database
npm run db:init
npm run db:seed

# Run edge API (port 8787)
cd apps/edge-api
npm install
npm run dev

# Run storefront (port 3000)
cd ../storefront-app
npm install
npm run dev

# Run admin dashboard (port 3001)
cd ../admin-app
npm install
npm run dev
```

## License

MIT
