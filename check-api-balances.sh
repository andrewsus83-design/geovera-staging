#!/bin/bash
# check-api-balances.sh
# Automated API balance checker for GeoVera

echo "💳 GeoVera API Balance Checker"
echo "================================"
echo "Date: $(date)"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables (if .env file exists)
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Track if any API needs refill
NEEDS_REFILL=0

# 1. Anthropic (Claude)
echo "1️⃣  ANTHROPIC (Claude API):"
echo "   Dashboard: https://console.anthropic.com/settings/billing"
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "   ${RED}❌ API key not found${NC}"
else
    ANTHROPIC_RESPONSE=$(curl -s https://api.anthropic.com/v1/organization/usage \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01")

    if echo "$ANTHROPIC_RESPONSE" | grep -q "error"; then
        echo -e "   ${RED}❌ Error checking balance${NC}"
    else
        echo -e "   ${GREEN}✅ Connected${NC}"
        echo "   Response: $ANTHROPIC_RESPONSE"
    fi
fi
echo ""

# 2. OpenAI
echo "2️⃣  OPENAI (GPT-4 API):"
echo "   Dashboard: https://platform.openai.com/usage"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "   ${RED}❌ API key not found${NC}"
else
    OPENAI_RESPONSE=$(curl -s https://api.openai.com/v1/models \
        -H "Authorization: Bearer $OPENAI_API_KEY")

    if echo "$OPENAI_RESPONSE" | grep -q "error"; then
        echo -e "   ${RED}❌ Error: $(echo $OPENAI_RESPONSE | jq -r '.error.message')${NC}"
    else
        echo -e "   ${GREEN}✅ Connected${NC}"
        echo "   (Check usage at dashboard - API doesn't expose balance)"
    fi
fi
echo ""

# 3. Perplexity
echo "3️⃣  PERPLEXITY AI:"
echo "   Dashboard: https://www.perplexity.ai/settings/api"
if [ -z "$PERPLEXITY_API_KEY" ]; then
    echo -e "   ${RED}❌ API key not found${NC}"
else
    # Perplexity doesn't have a balance endpoint, just verify key works
    echo -e "   ${YELLOW}⚠️  No balance API available${NC}"
    echo "   Check dashboard manually for credits"
fi
echo ""

# 4. Apify
echo "4️⃣  APIFY (Web Scraping):"
echo "   Dashboard: https://console.apify.com/billing/usage"
if [ -z "$APIFY_API_TOKEN" ]; then
    echo -e "   ${RED}❌ API token not found${NC}"
else
    APIFY_RESPONSE=$(curl -s "https://api.apify.com/v2/account?token=$APIFY_API_TOKEN")

    if echo "$APIFY_RESPONSE" | grep -q "error"; then
        echo -e "   ${RED}❌ Error checking balance${NC}"
    else
        APIFY_CREDITS=$(echo "$APIFY_RESPONSE" | jq -r '.data.usageCredits // "N/A"')
        echo -e "   ${GREEN}✅ Connected${NC}"
        echo "   Usage Credits: $APIFY_CREDITS"

        # Alert if credits are low (less than 10)
        if [ "$APIFY_CREDITS" != "N/A" ] && [ $(echo "$APIFY_CREDITS < 10" | bc) -eq 1 ]; then
            echo -e "   ${RED}⚠️  LOW BALANCE! Refill needed!${NC}"
            NEEDS_REFILL=1
        fi
    fi
fi
echo ""

# 5. SerpAPI
echo "5️⃣  SERPAPI (Google Search):"
echo "   Dashboard: https://serpapi.com/account"
if [ -z "$SERPAPI_KEY" ]; then
    echo -e "   ${RED}❌ API key not found${NC}"
else
    SERPAPI_RESPONSE=$(curl -s "https://serpapi.com/account?api_key=$SERPAPI_KEY")

    if echo "$SERPAPI_RESPONSE" | grep -q "error"; then
        echo -e "   ${RED}❌ Error checking balance${NC}"
    else
        SERPAPI_PLAN=$(echo "$SERPAPI_RESPONSE" | jq -r '.account_type // "N/A"')
        SERPAPI_SEARCHES_LEFT=$(echo "$SERPAPI_RESPONSE" | jq -r '.plan_searches_left // "N/A"')

        echo -e "   ${GREEN}✅ Connected${NC}"
        echo "   Plan: $SERPAPI_PLAN"
        echo "   Searches Left: $SERPAPI_SEARCHES_LEFT"

        # Alert if less than 100 searches left
        if [ "$SERPAPI_SEARCHES_LEFT" != "N/A" ] && [ "$SERPAPI_SEARCHES_LEFT" -lt 100 ]; then
            echo -e "   ${RED}⚠️  LOW BALANCE! Less than 100 searches left!${NC}"
            NEEDS_REFILL=1
        fi
    fi
fi
echo ""

# 6. Notion
echo "6️⃣  NOTION API (FREE):"
echo "   Dashboard: https://www.notion.so/my-integrations"
if [ -z "$NOTION_API_KEY" ]; then
    echo -e "   ${RED}❌ API key not found${NC}"
else
    NOTION_RESPONSE=$(curl -s https://api.notion.com/v1/users/me \
        -H "Authorization: Bearer $NOTION_API_KEY" \
        -H "Notion-Version: 2022-06-28")

    if echo "$NOTION_RESPONSE" | grep -q "error"; then
        echo -e "   ${RED}❌ Error: Invalid API key${NC}"
    else
        NOTION_NAME=$(echo "$NOTION_RESPONSE" | jq -r '.name // "N/A"')
        echo -e "   ${GREEN}✅ Connected${NC}"
        echo "   User: $NOTION_NAME"
        echo "   (FREE - No balance to check)"
    fi
fi
echo ""

# 7. Cloudinary
echo "7️⃣  CLOUDINARY (Images):"
echo "   Dashboard: https://cloudinary.com/console/usage"
if [ -z "$CLOUDINARY_API_KEY" ]; then
    echo -e "   ${RED}❌ API key not found${NC}"
else
    echo -e "   ${YELLOW}⚠️  Check balance manually at dashboard${NC}"
    echo "   (API balance check requires cloud name + secret)"
fi
echo ""

# 8. Supabase
echo "8️⃣  SUPABASE (Database):"
echo "   Dashboard: https://supabase.com/dashboard"
if [ -z "$SUPABASE_URL" ]; then
    echo -e "   ${RED}❌ Supabase URL not found${NC}"
elif [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "   ${RED}❌ Service role key not found${NC}"
else
    SUPABASE_RESPONSE=$(curl -s "$SUPABASE_URL/rest/v1/" \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

    if echo "$SUPABASE_RESPONSE" | grep -q "error"; then
        echo -e "   ${RED}❌ Error connecting${NC}"
    else
        echo -e "   ${GREEN}✅ Connected${NC}"
        echo "   (Check usage at dashboard - API doesn't expose quotas)"
    fi
fi
echo ""

# Summary
echo "================================"
if [ $NEEDS_REFILL -eq 1 ]; then
    echo -e "${RED}⚠️  ALERT: Some APIs need refill!${NC}"
    echo "Check the warnings above and refill accounts."
else
    echo -e "${GREEN}✅ All API balances OK!${NC}"
fi
echo ""
echo "Next steps:"
echo "1. Review any warnings above"
echo "2. Check dashboards for detailed usage"
echo "3. Refill low-balance accounts"
echo ""
echo "Full documentation: ./API_INVENTORY_AND_BALANCE.md"
