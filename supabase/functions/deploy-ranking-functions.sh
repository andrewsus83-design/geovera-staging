#!/bin/bash

# Deploy Ranking & Analytics Edge Functions
# This script deploys all three ranking calculation functions

set -e  # Exit on error

echo "======================================"
echo "Deploying Ranking & Analytics Functions"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${RED}Error: Not logged in to Supabase${NC}"
    echo "Login with: supabase login"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking environment variables...${NC}"

# Check if API keys are set (for trends function)
echo "Checking for PERPLEXITY_API_KEY..."
if supabase secrets list | grep -q "PERPLEXITY_API_KEY"; then
    echo -e "${GREEN}✓ PERPLEXITY_API_KEY is set${NC}"
else
    echo -e "${YELLOW}⚠ PERPLEXITY_API_KEY not found${NC}"
    read -p "Enter Perplexity API Key (or press Enter to skip): " perplexity_key
    if [ ! -z "$perplexity_key" ]; then
        supabase secrets set PERPLEXITY_API_KEY="$perplexity_key"
        echo -e "${GREEN}✓ PERPLEXITY_API_KEY set${NC}"
    fi
fi

echo "Checking for SERPAPI_API_KEY..."
if supabase secrets list | grep -q "SERPAPI_API_KEY"; then
    echo -e "${GREEN}✓ SERPAPI_API_KEY is set${NC}"
else
    echo -e "${YELLOW}⚠ SERPAPI_API_KEY not found${NC}"
    read -p "Enter SerpAPI API Key (or press Enter to skip): " serpapi_key
    if [ ! -z "$serpapi_key" ]; then
        supabase secrets set SERPAPI_API_KEY="$serpapi_key"
        echo -e "${GREEN}✓ SERPAPI_API_KEY set${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}Step 2: Deploying functions...${NC}"
echo ""

# Deploy radar-calculate-rankings
echo -e "${YELLOW}Deploying radar-calculate-rankings...${NC}"
if supabase functions deploy radar-calculate-rankings; then
    echo -e "${GREEN}✓ radar-calculate-rankings deployed successfully${NC}"
else
    echo -e "${RED}✗ Failed to deploy radar-calculate-rankings${NC}"
    exit 1
fi
echo ""

# Deploy radar-calculate-marketshare
echo -e "${YELLOW}Deploying radar-calculate-marketshare...${NC}"
if supabase functions deploy radar-calculate-marketshare; then
    echo -e "${GREEN}✓ radar-calculate-marketshare deployed successfully${NC}"
else
    echo -e "${RED}✗ Failed to deploy radar-calculate-marketshare${NC}"
    exit 1
fi
echo ""

# Deploy radar-discover-trends
echo -e "${YELLOW}Deploying radar-discover-trends...${NC}"
if supabase functions deploy radar-discover-trends; then
    echo -e "${GREEN}✓ radar-discover-trends deployed successfully${NC}"
else
    echo -e "${RED}✗ Failed to deploy radar-discover-trends${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}======================================"
echo "✓ All functions deployed successfully!"
echo "======================================${NC}"
echo ""
echo "Available functions:"
echo "  1. radar-calculate-rankings"
echo "  2. radar-calculate-marketshare"
echo "  3. radar-discover-trends"
echo ""
echo "Test with:"
echo "  supabase functions invoke radar-calculate-rankings --data '{\"category\":\"beauty\"}'"
echo "  supabase functions invoke radar-calculate-marketshare --data '{\"category\":\"beauty\"}'"
echo "  supabase functions invoke radar-discover-trends --data '{\"category\":\"beauty\"}'"
echo ""
