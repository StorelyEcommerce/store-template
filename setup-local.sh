#!/bin/bash

# Local Setup Script for Store Platform
# This script helps set up the local development environment

set -e

echo "🚀 Setting up Store Platform for local testing..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

# Step 2: Build packages
echo ""
echo "🔨 Step 2: Building shared packages..."
npm run build:packages

# Step 3: Fix React dependencies for admin app
echo ""
echo "🔧 Step 3: Setting up React dependencies for admin app..."
cd apps/admin

# Create node_modules if it doesn't exist
mkdir -p node_modules

# Copy React if not already there
if [ ! -d "node_modules/react" ]; then
    echo "   Copying React to admin node_modules..."
    cp -r ../../node_modules/react node_modules/ 2>/dev/null || echo "   ⚠️  React not found in root, will need to install"
fi

if [ ! -d "node_modules/react-dom" ]; then
    echo "   Copying React-DOM to admin node_modules..."
    cp -r ../../node_modules/react-dom node_modules/ 2>/dev/null || echo "   ⚠️  React-DOM not found in root, will need to install"
fi

cd ../..

# Step 4: Check for .env files
echo ""
echo "📝 Step 4: Checking environment files..."

# Check edge-api .dev.vars
if [ ! -f "apps/edge-api/.dev.vars" ]; then
    echo "   ⚠️  apps/edge-api/.dev.vars not found. Creating template..."
    cat > apps/edge-api/.dev.vars << EOF
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
ADMIN_API_KEY=admin-secret-key
EOF
    echo "   ✅ Created apps/edge-api/.dev.vars (update with your values)"
else
    echo "   ✅ apps/edge-api/.dev.vars exists"
fi

# Check storefront .env
if [ ! -f "apps/storefront/.env" ]; then
    echo "   ⚠️  apps/storefront/.env not found. Creating..."
    cat > apps/storefront/.env << EOF
VITE_API_URL=http://localhost:8787
VITE_STORE_SLUG=demo-store
EOF
    echo "   ✅ Created apps/storefront/.env"
else
    echo "   ✅ apps/storefront/.env exists"
fi

# Check admin .env
if [ ! -f "apps/admin/.env" ]; then
    echo "   ⚠️  apps/admin/.env not found. Creating..."
    cat > apps/admin/.env << EOF
VITE_API_URL=http://localhost:8787
EOF
    echo "   ✅ Created apps/admin/.env"
else
    echo "   ✅ apps/admin/.env exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Set up Cloudflare D1 database:"
echo "   wrangler d1 create store-platform-db"
echo "   (Update apps/edge-api/wrangler.toml with the database_id)"
echo ""
echo "2. Apply database schema:"
echo "   cd apps/edge-api"
echo "   wrangler d1 execute store-platform-db --file=../../infra/db/schema.sql"
echo "   wrangler d1 execute store-platform-db --file=../../infra/db/seed.sql"
echo ""
echo "3. Start development servers in 3 terminals:"
echo "   Terminal 1: cd apps/edge-api && npm run dev"
echo "   Terminal 2: cd apps/storefront && npm run dev"
echo "   Terminal 3: cd apps/admin && npm run dev"
echo ""
echo "4. Open in browser:"
echo "   Storefront: http://localhost:5173"
echo "   Admin: http://localhost:5174"
echo "   (Login with ADMIN_API_KEY from .dev.vars)"
echo ""
echo "📖 See TESTING.md for detailed instructions"

