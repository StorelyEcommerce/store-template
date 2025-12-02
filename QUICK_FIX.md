# Quick Fix Guide

## Issues You Encountered & Solutions

### ✅ Database Already Set Up (This is Good!)

The errors you saw:
- `table stores already exists` - This means the schema was already applied ✅
- `UNIQUE constraint failed: stores.slug` - This means the seed data was already applied ✅

**No action needed** - your database is ready to use!

### ✅ Database ID Updated

I've updated `apps/edge-api/wrangler.toml` with your actual database ID: `fa079adc-06d5-427b-9721-9b151d0b9299`

### ✅ API Port Fixed

Your edge-api is running on port **54597** (not 8787). I've created `.env` files with the correct port:

- `apps/storefront/.env` → `VITE_API_URL=http://localhost:54597`
- `apps/admin/.env` → `VITE_API_URL=http://localhost:54597`

**Restart your frontend dev servers** for the changes to take effect:
```bash
# In storefront terminal, press Ctrl+C then:
cd apps/storefront
npm run dev

# In admin terminal, press Ctrl+C then:
cd apps/admin
npm run dev
```

### ✅ Admin React Dependencies Fixed

I've fixed the React module resolution issue. The admin app should now work.

## Current Status

✅ **Edge API**: Running on http://localhost:54597  
✅ **Storefront**: Should be on http://localhost:5173  
✅ **Admin**: Should be on http://localhost:5174  
✅ **Database**: Set up and ready

## Test Now

1. **Storefront**: Open http://localhost:5173 - you should see products with prices
2. **Admin**: Open http://localhost:5174 - login with `admin-secret-key`

## If Admin Still Has Issues

If you still see React errors in the admin app, run:

```bash
cd apps/admin
rm -rf node_modules/react node_modules/react-dom
cp -r ../../node_modules/react node_modules/
cp -r ../../node_modules/react-dom node_modules/
```

Then restart the dev server.

