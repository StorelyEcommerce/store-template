# Fixed Port Configuration ✅

## Problem Solved

The Edge API now uses a **fixed port 8787** so you don't need to update `.env` files every time you restart.

## What Changed

Updated `apps/edge-api/package.json`:
```json
"dev": "wrangler dev --port 8787"
```

Now when you run `npm run dev` in the edge-api directory, it will **always** use port 8787.

## Current Configuration

### Ports (Fixed)
- **Edge API**: http://localhost:8787 (fixed)
- **Storefront**: http://localhost:5173
- **Admin**: http://localhost:5174

### Environment Files (No Changes Needed)

**apps/storefront/.env:**
```
VITE_API_URL=http://localhost:8787
VITE_STORE_SLUG=demo-store
```

**apps/admin/.env:**
```
VITE_API_URL=http://localhost:8787
```

## Usage

1. **Start Edge API:**
   ```bash
   cd apps/edge-api
   npm run dev
   ```
   Will always start on port 8787 ✅

2. **Start Storefront:**
   ```bash
   cd apps/storefront
   npm run dev
   ```

3. **Start Admin:**
   ```bash
   cd apps/admin
   npm run dev
   ```

No more port changes! 🎉

