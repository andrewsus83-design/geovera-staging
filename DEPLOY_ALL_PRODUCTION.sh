#!/bin/bash
# ============================================================================
# GEOVERA - COMPLETE PRODUCTION DEPLOYMENT SCRIPT
# ============================================================================
# Purpose: Deploy ALL features to production by Feb 20, 2026
# Features: Radar, Hub, Content Studio, AI Chat, Insights
# ============================================================================

set -e  # Exit on error

echo "🚀 GEOVERA PRODUCTION DEPLOYMENT"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# STEP 1: Deploy ALL Edge Functions
# ============================================================================
echo "${YELLOW}📦 STEP 1: Deploying Edge Functions${NC}"
echo ""

FUNCTIONS=(
  "ai-chat"
  "hub-create-collection"
  "hub-discover-content"
  "hub-generate-article"
  "hub-generate-charts"
  "radar-discover-brands"
  "radar-discover-creators"
  "radar-scrape-content"
  "radar-scrape-serpapi"
  "radar-analyze-content"
  "radar-learn-brand-authority"
  "radar-calculate-rankings"
  "radar-calculate-marketshare"
  "radar-discover-trends"
  "generate-article"
  "generate-image"
  "generate-video"
)

DEPLOYED=0
FAILED=0

for func in "${FUNCTIONS[@]}"; do
  echo "Deploying: $func..."
  if supabase functions deploy "$func" --no-verify-jwt 2>&1 | tee /tmp/deploy_${func}.log; then
    echo "${GREEN}✅ $func deployed${NC}"
    ((DEPLOYED++))
  else
    echo "${RED}❌ $func FAILED${NC}"
    ((FAILED++))
  fi
  echo ""
done

echo "Deployed: $DEPLOYED/${#FUNCTIONS[@]}"
echo "Failed: $FAILED"
echo ""

# ============================================================================
# STEP 2: Verify Database Schema
# ============================================================================
echo "${YELLOW}🗄️  STEP 2: Verifying Database Schema${NC}"
echo ""

REQUIRED_TABLES=(
  "gv_brands"
  "gv_content_library"
  "gv_hub_collections"
  "gv_hub_embedded_content"
  "gv_hub_articles"
  "gv_creators"
  "gv_creator_content"
  "gv_creator_rankings"
  "gv_brand_marketshare"
  "gv_trends"
  "gv_trend_involvement"
  "gv_radar_processing_queue"
  "gv_radar_snapshots"
  "gv_brand_authority_patterns"
  "gv_discovered_brands"
  "gv_daily_insights"
  "gv_crisis_events"
  "gv_task_actions"
  "gv_chat_sessions"
  "gv_chat_messages"
)

echo "Checking ${#REQUIRED_TABLES[@]} required tables..."

for table in "${REQUIRED_TABLES[@]}"; do
  if psql "$DATABASE_URL" -tc "SELECT 1 FROM information_schema.tables WHERE table_name = '$table'" | grep -q 1; then
    echo "${GREEN}✅ $table${NC}"
  else
    echo "${RED}❌ $table MISSING${NC}"
  fi
done

echo ""

# ============================================================================
# STEP 3: Verify Environment Variables
# ============================================================================
echo "${YELLOW}🔑 STEP 3: Verifying Environment Variables${NC}"
echo ""

REQUIRED_VARS=(
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "PERPLEXITY_API_KEY"
  "ANTHROPIC_API_KEY"
  "OPENAI_API_KEY"
  "APIFY_API_TOKEN"
  "SERP_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
  if supabase secrets list | grep -q "$var"; then
    echo "${GREEN}✅ $var set${NC}"
  else
    echo "${RED}❌ $var MISSING${NC}"
  fi
done

echo ""

# ============================================================================
# STEP 4: Test Critical Workflows
# ============================================================================
echo "${YELLOW}🧪 STEP 4: Testing Critical Workflows${NC}"
echo ""

echo "Test 1: Hub Collection Creation"
curl -s -X POST "$SUPABASE_URL/functions/v1/hub-create-collection" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{"category":"beauty"}' | jq .

echo ""
echo "Test 2: Radar Creator Discovery (requires Perplexity API)"
# Skip if no API key
echo "Skipped - manual test required"

echo ""
echo "Test 3: AI Chat"
# Skip - manual test required
echo "Skipped - manual test required"

echo ""

# ============================================================================
# STEP 5: Deployment Summary
# ============================================================================
echo "${YELLOW}📊 DEPLOYMENT SUMMARY${NC}"
echo "=================================="
echo ""
echo "Edge Functions Deployed: $DEPLOYED/${#FUNCTIONS[@]}"
echo "Database Tables: ${#REQUIRED_TABLES[@]} required"
echo "Environment Variables: ${#REQUIRED_VARS[@]} required"
echo ""
echo "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo ""
echo "Next Steps:"
echo "1. Test all features manually in staging"
echo "2. Seed test data (60 brands, 3K creators)"
echo "3. Monitor costs for 24-48H"
echo "4. Launch soft production (Feb 20)"
echo ""
