#!/bin/bash

# ============================================================================
# GEOVERA 500QA SYSTEM DEPLOYMENT SCRIPT
# Deploys: generate-500qa + updated daily-auto-research
# ============================================================================

set -e  # Exit on error

echo "🚀 GeoVera 500QA System Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# 1. VALIDATE ENVIRONMENT
# ============================================================================

echo "📋 Step 1: Validating environment..."
echo ""

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install: npm install -g supabase"
    exit 1
fi
echo -e "${GREEN}✓ Supabase CLI installed${NC}"

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Supabase${NC}"
    echo "Run: supabase login"
    exit 1
fi
echo -e "${GREEN}✓ Logged in to Supabase${NC}"

echo ""

# ============================================================================
# 2. VERIFY API KEYS
# ============================================================================

echo "🔑 Step 2: Verifying API keys..."
echo ""

required_keys=(
  "ANTHROPIC_API_KEY"
  "PERPLEXITY_API_KEY"
  "SERPAPI_KEY"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
)

missing_keys=()

for key in "${required_keys[@]}"; do
    # Check if secret is set (this will return error if not set, which is expected)
    if supabase secrets list 2>/dev/null | grep -q "$key"; then
        echo -e "${GREEN}✓ $key is set${NC}"
    else
        echo -e "${YELLOW}⚠ $key not found${NC}"
        missing_keys+=("$key")
    fi
done

if [ ${#missing_keys[@]} -ne 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Missing API keys. Set them with:${NC}"
    for key in "${missing_keys[@]}"; do
        echo "   supabase secrets set $key=YOUR_KEY_HERE"
    done
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# ============================================================================
# 3. DEPLOY FUNCTIONS
# ============================================================================

echo "📦 Step 3: Deploying Edge Functions..."
echo ""

# Deploy generate-500qa
echo "Deploying: generate-500qa..."
if supabase functions deploy generate-500qa; then
    echo -e "${GREEN}✓ generate-500qa deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy generate-500qa${NC}"
    exit 1
fi
echo ""

# Deploy daily-auto-research (updated version)
echo "Deploying: daily-auto-research..."
if supabase functions deploy daily-auto-research; then
    echo -e "${GREEN}✓ daily-auto-research deployed (with sync)${NC}"
else
    echo -e "${RED}❌ Failed to deploy daily-auto-research${NC}"
    exit 1
fi
echo ""

# ============================================================================
# 4. VERIFY DEPLOYMENT
# ============================================================================

echo "✅ Step 4: Verifying deployment..."
echo ""

if supabase functions list | grep -q "generate-500qa"; then
    echo -e "${GREEN}✓ generate-500qa is live${NC}"
else
    echo -e "${RED}❌ generate-500qa not found in functions list${NC}"
fi

if supabase functions list | grep -q "daily-auto-research"; then
    echo -e "${GREEN}✓ daily-auto-research is live${NC}"
else
    echo -e "${RED}❌ daily-auto-research not found in functions list${NC}"
fi

echo ""

# ============================================================================
# 5. DEPLOYMENT SUMMARY
# ============================================================================

echo "📊 Deployment Summary"
echo "====================="
echo ""
echo "✅ Functions Deployed:"
echo "   1. generate-500qa - Generates 500 deep strategic questions monthly"
echo "   2. daily-auto-research - Daily research with tier-based suggestions"
echo ""
echo "🎯 New Features:"
echo "   • 500 questions (was 300) with deeper insights"
echo "   • Tier-based research: Basic (20→5), Premium (30→10), Partner (50→20)"
echo "   • 20% negative sentiment tracking (threat alerts)"
echo "   • Auto-sync to Insights, To-Do, and Content Studio"
echo "   • Impact scoring from Perplexity research"
echo ""
echo "💰 Cost per Brand:"
echo "   • Basic tier: ~\$0.35/month (500QA) + \$0.10/day (research) = \$3.35/month"
echo "   • Premium tier: ~\$0.35/month (500QA) + \$0.15/day (research) = \$4.85/month"
echo "   • Partner tier: ~\$0.35/month (500QA) + \$0.25/day (research) = \$7.85/month"
echo ""
echo "🧪 Testing:"
echo ""
echo "# Generate 500 questions"
echo "curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/generate-500qa \\"
echo "  -H \"Authorization: Bearer YOUR_JWT\" \\"
echo "  -d '{\"brand_id\": \"uuid\"}'"
echo ""
echo "# Run daily research"
echo "curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/daily-auto-research \\"
echo "  -H \"Authorization: Bearer YOUR_JWT\" \\"
echo "  -d '{\"brand_id\": \"uuid\"}'"
echo ""
echo "🎉 Deployment Complete!"
echo ""
