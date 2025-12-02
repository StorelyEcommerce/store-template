# Debugging "Failed to Load Store" Error

## Quick Checks

### 1. Is the Edge API Running?

Check if wrangler is running:
```bash
ps aux | grep wrangler | grep -v grep
```

If not running, start it:
```bash
cd apps/edge-api
npm run dev
```

**Note the port** in the output (e.g., `http://localhost:54597` or `http://localhost:8787`)

### 2. Check the API Port

The API port might have changed. Check what port wrangler is using:

```bash
# Look for the port in the wrangler output, or check:
lsof -i -P | grep LISTEN | grep node
```

### 3. Update .env Files

Once you know the actual API port, update:

**apps/storefront/.env:**
```
VITE_API_URL=http://localhost:ACTUAL_PORT_HERE
VITE_STORE_SLUG=demo-store
```

**apps/admin/.env:**
```
VITE_API_URL=http://localhost:ACTUAL_PORT_HERE
```

Then **restart the frontend dev servers** (Ctrl+C and `npm run dev` again).

### 4. Test the API Directly

Test if the API is responding:

```bash
# Replace PORT with actual port
curl http://localhost:PORT/v1/stores/demo-store
```

You should get JSON with store data. If you get an error, the API isn't working.

### 5. Check Browser Console

Open browser DevTools (F12) and check:
- **Console tab**: Look for error messages
- **Network tab**: Check if the request to `/v1/stores/demo-store` is failing

Common errors:
- `Failed to fetch` → API not running or wrong URL
- `404 Not Found` → Store slug doesn't exist in database
- `CORS error` → API not allowing requests from frontend

### 6. Verify Store Exists in Database

Check if the store exists:

```bash
cd apps/edge-api
wrangler d1 execute store-platform-db --command "SELECT slug, name FROM stores"
```

You should see `demo-store` in the results.

### 7. Common Issues

**Issue: API port keeps changing**
- Wrangler uses random ports sometimes
- Solution: Use `--port` flag or check terminal output each time

**Issue: Store not found**
- The slug might be wrong
- Solution: Check database or use correct slug from seed data

**Issue: CORS errors**
- API might not be allowing requests
- Solution: CORS is enabled by default, but check if API is actually running

## Step-by-Step Fix

1. **Start Edge API:**
   ```bash
   cd apps/edge-api
   npm run dev
   ```
   Note the port (e.g., `Ready on http://localhost:54597`)

2. **Update .env files with correct port:**
   ```bash
   # In apps/storefront/.env
   echo "VITE_API_URL=http://localhost:54597" > apps/storefront/.env
   echo "VITE_STORE_SLUG=demo-store" >> apps/storefront/.env
   
   # In apps/admin/.env
   echo "VITE_API_URL=http://localhost:54597" > apps/admin/.env
   ```

3. **Restart frontend servers:**
   ```bash
   # Storefront - press Ctrl+C, then:
   cd apps/storefront
   npm run dev
   
   # Admin - press Ctrl+C, then:
   cd apps/admin
   npm run dev
   ```

4. **Test in browser:**
   - Open http://localhost:5173
   - Check browser console for errors
   - Should see products loading

## Still Not Working?

Check the browser console for the exact error message and share it for more specific help.

