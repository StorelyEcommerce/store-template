# Storefront App (Liquid)

This directory contains the customer-facing Storefront application, built with **Liquid templates** and served via **Express**.

It provides a server-side rendered, SEO-friendly shopping experience.

## Architecture

- **Server**: Node.js + Express (`server.js`)
- **Templating**: LiquidJS
- **Styling**: Tailwind CSS (served statically from `theme/assets`)
- **Data Fetching**: Fetches data from the Edge API (Cloudflare Worker)
- **Cart**: Client-side JavaScript (`theme/assets/cart.js`) using LocalStorage

## Directory Structure

```
storefront-app/
├── server.js             # Express server & Liquid configuration
├── theme/                # Liquid theme files
│   ├── layouts/          # Base layouts (theme.liquid)
│   ├── templates/        # Page templates (index, product, cart, etc.)
│   ├── snippets/         # Reusable components (header, footer, card)
│   ├── assets/           # CSS, JS, and images
│   └── config/           # Liquid filters & config
├── public/               # Static public assets
└── package.json          # Dependencies
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```
   The storefront will be available at [http://localhost:3000](http://localhost:3000).

3. **Environment Variables:**
   Create a `.env` file (optional) or set variables in your environment:
   - `PORT`: Server port (default: 3000)
   - `API_URL`: URL of the Edge API (default: http://localhost:8787)
   - `STORE_SLUG`: Slug of the store to fetch (default: demo-store)

## Liquid Variables

The following variables are available in templates:

- `store`: Store object with settings
- `template`: The current template name
- `api_url`: Base URL for API calls
- `page_title`: Page title
- `request`: Request parameters

## Theme Customization

The theme files are located in `theme/`. See [theme/README.md](theme/README.md) for detailed documentation on the theme structure and available Liquid variables.

## Comparison to Previous React App

This Liquid implementation replaces the previous React SPA to improve SEO and initial load performance.
- React components have been converted to Liquid snippets.
- Client-side routing is replaced by server-side routing (Express).
- Global state (Cart) is managed via `cart.js`.
