# Admin App (Liquid)

This directory contains the Admin Dashboard application, built with **Liquid templates** and served via **Express**.

It provides a server-side rendered interface for managing stores, products, orders, and payments.

## Architecture

- **Server**: Node.js + Express (`server.js`)
- **Templating**: LiquidJS
- **Styling**: Tailwind CSS (served statically from `theme/assets`)
- **Data Fetching**: Fetches data from the Edge API (Cloudflare Worker)

## Directory Structure

```
admin-app/
├── server.js             # Express server & Liquid configuration
├── theme/                # Liquid theme files
│   ├── layouts/          # Base layouts (admin.liquid)
│   ├── templates/        # Page templates (dashboard, products, etc.)
│   ├── snippets/         # Reusable components (sidebar, etc.)
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
   The admin dashboard will be available at [http://localhost:3001](http://localhost:3001).

3. **Environment Variables:**
   Create a `.env` file (optional) or set variables in your environment:
   - `PORT`: Server port (default: 3001)
   - `API_URL`: URL of the Edge API (default: http://localhost:8787)
   - `ADMIN_TOKEN`: Admin authentication token (default: admin-secret-key)

## Liquid Variables

The following variables are available in templates:

- `layout`: The layout file to use (e.g., `theme`)
- `template`: The current template name
- `content_for_layout`: Content from the child template
- `api_url`: Base URL for API calls
- `admin_token`: Token for API calls
- `current_path`: Current request path

## Filters

Custom Liquid filters are registered in `theme/config/liquid-filters.js`:
- `asset_url`: Generates URL for assets
- `money`: Formats price in cents to currency
- `date`: Formats dates
- `json`: JSON encoding

