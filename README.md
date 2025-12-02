# Storely Store Templates

This repository contains ecommerce store templates for use with the Storely Agent platform and Cloudflare Vide SDK.

## Repository Structure

```
store-template/
├── deploy_templates.sh      # Deployment script for R2
├── template_catalog.json    # Template catalog metadata
├── templates/               # Template source directories
│   └── base-store/          # Base ecommerce template
│       ├── package.json
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       ├── .donttouch_files.json
│       ├── .redacted_files.json
│       ├── .important_files.json
│       ├── public/
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           ├── index.css
│           ├── api/
│           ├── components/
│           ├── context/
│           └── pages/
└── zips/                    # Generated zip files
```

## Available Templates

### base-store

A comprehensive ecommerce store template with:

- **Product catalog** with grid views and search
- **Shopping cart** with local storage persistence
- **Checkout flow** with Stripe integration hooks
- **Responsive design** for all devices
- **Beautiful UI** with warm cream palette and terracotta accents

**Tech Stack:**
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons

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

To work on a template locally:

```bash
cd templates/base-store
npm install
npm run dev
```

## License

MIT
