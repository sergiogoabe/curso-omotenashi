#!/bin/bash

# Omotenashi Production Deployment Script
# Usage: ./deploy-vercel.sh [--prod] [--no-cache]

set -e

PROJECT_DIR="/data/data/com.termux/files/home/Projects/Omotenashi"
cd "$PROJECT_DIR"

echo "🚀 Omotenashi - Vercel Production Deployment"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .vercel exists
if [ ! -d ".vercel" ]; then
    echo -e "${RED}❌ Project not linked to Vercel. Run:${NC}"
    echo "   npx vercel link"
    exit 1
fi

# Extract project ID
PROJECT_ID=$(grep -o '"projectId":"[^"]*' .vercel/project.json | cut -d'"' -f4)
ORG_ID=$(grep -o '"orgId":"[^"]*' .vercel/project.json | cut -d'"' -f4)

echo -e "${GREEN}✓ Vercel Project Linked${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Org ID: $ORG_ID"

# Clean up
echo -e "\n${YELLOW}⏳ Cleaning build cache...${NC}"
rm -rf .next node_modules/.cache

# Install dependencies
echo -e "\n${YELLOW}⏳ Installing dependencies...${NC}"
npm ci --prefer-offline --no-audit

# Generate Prisma client
echo -e "\n${YELLOW}⏳ Generating Prisma client...${NC}"
npx prisma generate

# Type check
echo -e "\n${YELLOW}⏳ Validating TypeScript...${NC}"
npx tsc --noEmit

# Build
echo -e "\n${YELLOW}⏳ Building Next.js (this may take 5-10 minutes)...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Build successful!${NC}"
else
    echo -e "\n${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
fi

# Deploy
echo -e "\n${YELLOW}⏳ Deploying to Vercel...${NC}"

if [[ "$*" == *"--prod"* ]]; then
    echo "🔴 PRODUCTION DEPLOY"
    npx vercel deploy --prod --yes --token="${VERCEL_TOKEN}"
else
    echo "⚪ PREVIEW DEPLOY"
    npx vercel deploy --yes --token="${VERCEL_TOKEN}"
fi

echo -e "\n${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "🌐 Access your app:"
if [[ "$*" == *"--prod"* ]]; then
    echo "   Production: https://curso-omotenashi.vercel.app"
else
    echo "   Preview URL displayed above"
fi

echo -e "\n📊 Next steps:"
echo "   1. Verify app is running"
echo "   2. Test auth flow"
echo "   3. Monitor logs: vercel logs --prod"
