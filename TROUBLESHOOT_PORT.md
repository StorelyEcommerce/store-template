# Troubleshooting Port 8787 "Address Already in Use"

## Quick Fix

If you get "Address already in use" error on port 8787:

### Option 1: Kill the Process (Mac/Linux)
```bash
# Find what's using the port
lsof -i :8787

# Kill it (replace PID with the number from above)
kill -9 <PID>

# Or kill all node/wrangler processes
pkill -f wrangler
pkill -f "node.*edge-api"
```

### Option 2: Use a Different Port Temporarily

If port 8787 is stuck, you can temporarily use a different port:

1. **Update edge-api package.json:**
   ```json
   "dev": "wrangler dev --port 8788"
   ```

2. **Update .env files:**
   ```bash
   # apps/storefront/.env
   VITE_API_URL=http://localhost:8788
   
   # apps/admin/.env
   VITE_API_URL=http://localhost:8788
   ```

### Option 3: Wait and Retry

Sometimes the port takes a moment to free up after killing a process. Wait 2-3 seconds and try again.

## Check if Port is Free

```bash
lsof -i :8787
```

If this returns nothing, the port is free.

## Common Causes

1. **Previous server didn't shut down cleanly** - Kill the process
2. **Another application using port 8787** - Check with `lsof -i :8787`
3. **Zombie process** - Restart your terminal or computer

## Verify Server Started

After starting, you should see:
```
[wrangler:inf] Ready on http://localhost:8787
```

If you see the "Address already in use" error, use one of the options above.

