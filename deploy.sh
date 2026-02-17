#!/bin/bash

# ============================================================================
# GEOVERA DEPLOYMENT SCRIPT
# Automated deployment for database + Edge Functions
# ============================================================================

set -e  # Exit on error

echo "🚀 GeoVera Deployment Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# ============================================================================
# STEP 1: Deploy Database Schema
# ============================================================================

echo "📊 Step 1: Deploying Database Schema..."
echo "================================"

if [ -f "supabase/migrations/20260217_complete_system_schema.sql" ]; then
    echo "✅ Migration file found"

    read -p "Deploy database schema? (y/n): " deploy_db
    if [ "$deploy_db" = "y" ]; then
        echo "Deploying database..."
        supabase db push

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database deployed successfully${NC}"
        else
            echo -e "${RED}❌ Database deployment failed${NC}"
            exit 1
        fi
    else
        echo "⏭️  Skipping database deployment"
    fi
else
    echo -e "${YELLOW}⚠️  Migration file not found${NC}"
fi

echo ""

# ============================================================================
# STEP 2: Set Environment Secrets
# ============================================================================

echo "🔐 Step 2: Setting Environment Secrets..."
echo "================================"

read -p "Set API keys? (y/n): " set_secrets
if [ "$set_secrets" = "y" ]; then

    echo "Enter your API keys (press Enter to skip):"
    echo ""

    # Anthropic (Claude)
    read -p "Anthropic API Key (sk-ant-...): " ANTHROPIC_KEY
    if [ ! -z "$ANTHROPIC_KEY" ]; then
        supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
        echo -e "${GREEN}✅ Anthropic key set${NC}"
    fi

    # OpenAI
    read -p "OpenAI API Key (sk-...): " OPENAI_KEY
    if [ ! -z "$OPENAI_KEY" ]; then
        supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"
        echo -e "${GREEN}✅ OpenAI key set${NC}"
    fi

    # Perplexity
    read -p "Perplexity API Key (pplx-...): " PERPLEXITY_KEY
    if [ ! -z "$PERPLEXITY_KEY" ]; then
        supabase secrets set PERPLEXITY_API_KEY="$PERPLEXITY_KEY"
        echo -e "${GREEN}✅ Perplexity key set${NC}"
    fi

    # Apify
    read -p "Apify API Key: " APIFY_KEY
    if [ ! -z "$APIFY_KEY" ]; then
        supabase secrets set APIFY_API_KEY="$APIFY_KEY"
        echo -e "${GREEN}✅ Apify key set${NC}"
    fi

    # SerpAPI
    read -p "SerpAPI Key: " SERPAPI_KEY
    if [ ! -z "$SERPAPI_KEY" ]; then
        supabase secrets set SERPAPI_KEY="$SERPAPI_KEY"
        echo -e "${GREEN}✅ SerpAPI key set${NC}"
    fi

    # Google Gemini
    read -p "Google Gemini API Key: " GEMINI_KEY
    if [ ! -z "$GEMINI_KEY" ]; then
        supabase secrets set GEMINI_API_KEY="$GEMINI_KEY"
        echo -e "${GREEN}✅ Gemini key set${NC}"
    fi

else
    echo "⏭️  Skipping secrets setup"
fi

echo ""

# ============================================================================
# STEP 3: Deploy Edge Functions
# ============================================================================

echo "⚡ Step 3: Deploying Edge Functions..."
echo "================================"

# List all functions in supabase/functions directory
if [ -d "supabase/functions" ]; then
    functions=$(ls -d supabase/functions/*/ 2>/dev/null | xargs -n 1 basename)

    if [ ! -z "$functions" ]; then
        echo "Found functions:"
        echo "$functions"
        echo ""

        read -p "Deploy all Edge Functions? (y/n): " deploy_functions
        if [ "$deploy_functions" = "y" ]; then
            for func in $functions; do
                echo "Deploying $func..."
                supabase functions deploy "$func"

                if [ $? -eq 0 ]; then
                    echo -e "${GREEN}✅ $func deployed${NC}"
                else
                    echo -e "${RED}❌ $func deployment failed${NC}"
                fi
            done
        else
            echo "⏭️  Skipping Edge Functions deployment"
        fi
    else
        echo -e "${YELLOW}⚠️  No Edge Functions found${NC}"
        echo "Create functions with: supabase functions new <function-name>"
    fi
else
    echo -e "${YELLOW}⚠️  supabase/functions directory not found${NC}"
fi

echo ""

# ============================================================================
# STEP 4: Verify Deployment
# ============================================================================

echo "🔍 Step 4: Verifying Deployment..."
echo "================================"

# Test database connection
echo "Testing database connection..."
supabase db execute "SELECT COUNT(*) as category_count FROM gv_categories;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"

    # Check data
    echo ""
    echo "Database stats:"
    supabase db execute "SELECT
        (SELECT COUNT(*) FROM gv_categories) as categories,
        (SELECT COUNT(*) FROM gv_sub_categories) as sub_categories,
        (SELECT COUNT(*) FROM gv_brands) as brands;"
else
    echo -e "${RED}❌ Database connection failed${NC}"
fi

echo ""

# ============================================================================
# STEP 5: Summary
# ============================================================================

echo "📋 Deployment Summary"
echo "================================"
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Verify data in Supabase Dashboard"
echo "2. Test Edge Functions with: supabase functions invoke <function-name>"
echo "3. Set up cron jobs for automated processing"
echo "4. Start monitoring with first category"
echo ""
echo "Documentation:"
echo "- DEPLOYMENT_READY_SUMMARY.md"
echo "- COMPLETE_COST_SUMMARY.md"
echo "- SEO_GEO_FIXED_VARIABLE_MODEL.md"
echo ""
echo "🎉 GeoVera is ready to launch!"
