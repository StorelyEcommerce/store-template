#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Store Templates to R2${NC}"
echo ""

# Get bucket name from environment variables
BUCKET_NAME=${BUCKET_NAME:-${R2_BUCKET_NAME}}
if [ -z "$BUCKET_NAME" ]; then
    echo -e "${RED}Error: BUCKET_NAME or R2_BUCKET_NAME must be set${NC}"
    exit 1
fi

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}Error: CLOUDFLARE_API_TOKEN must be set${NC}"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}Error: CLOUDFLARE_ACCOUNT_ID must be set${NC}"
    exit 1
fi

echo -e "${YELLOW}Bucket: ${BUCKET_NAME}${NC}"
echo ""

# Create zips directory if it doesn't exist
mkdir -p ./zips

# Upload template catalog
echo -e "${GREEN}📋 Uploading template_catalog.json...${NC}"
wrangler r2 object put "$BUCKET_NAME/template_catalog.json" \
    --file=./template_catalog.json \
    --content-type="application/json"
echo -e "${GREEN}   ✓ template_catalog.json uploaded${NC}"
echo ""

# Build and upload each template
echo -e "${GREEN}📦 Building and uploading templates...${NC}"
for template_dir in templates/*/; do
    if [ -d "$template_dir" ]; then
        template_name=$(basename "$template_dir")
        echo -e "${YELLOW}   Processing: ${template_name}${NC}"
        
        # Create zip file from template directory
        # Navigate to template directory and zip contents at root level
        cd "$template_dir"
        
        # Remove any existing zip for this template
        rm -f "../../zips/${template_name}.zip"
        
        # Create zip excluding unwanted files/directories
        zip -r "../../zips/${template_name}.zip" . \
            -x "*.git*" \
            -x "node_modules/*" \
            -x ".DS_Store" \
            -x "*.log" \
            -x "dist/*" \
            -x ".env" \
            -x ".env.local" \
            -x ".env.*.local"
        
        cd ../..
        
        echo -e "${GREEN}   ✓ Created zips/${template_name}.zip${NC}"
        
        # Upload to R2
        wrangler r2 object put "$BUCKET_NAME/${template_name}.zip" \
            --file="./zips/${template_name}.zip" \
            --content-type="application/zip"
        
        echo -e "${GREEN}   ✓ Uploaded ${template_name}.zip to R2${NC}"
        echo ""
    fi
done

echo -e "${GREEN}✅ Templates deployed successfully!${NC}"
echo ""
echo "Deployed files:"
echo "  - template_catalog.json"
for zip_file in zips/*.zip; do
    if [ -f "$zip_file" ]; then
        echo "  - $(basename "$zip_file")"
    fi
done

