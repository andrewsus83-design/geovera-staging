#!/bin/bash

# Test script for generate-daily-insights Edge Function
# Usage: ./test-daily-insights.sh [brand_id] [tier]

BRAND_ID=${1:-""}
TIER=${2:-"premium"}
SUPABASE_URL="https://vozjwptzutolvkvfpknk.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvemp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNTQxMTksImV4cCI6MjA1MjYzMDExOX0.LsCo0kK-nOVw-c0rAXBY8-8Y8uqNZqnLjCYzE5Eh0NY"

if [ -z "$BRAND_ID" ]; then
  echo "Usage: ./test-daily-insights.sh [brand_id] [tier]"
  echo "Getting first brand from database..."

  # Get first brand ID from database
  BRAND_ID=$(curl -s "${SUPABASE_URL}/rest/v1/gv_brands?select=id&limit=1" \
    -H "apikey: ${ANON_KEY}" \
    -H "Authorization: Bearer ${ANON_KEY}" | jq -r '.[0].id')

  if [ -z "$BRAND_ID" ] || [ "$BRAND_ID" = "null" ]; then
    echo "Error: No brands found in database"
    exit 1
  fi

  echo "Using brand ID: $BRAND_ID"
fi

echo "Testing generate-daily-insights function..."
echo "Brand ID: $BRAND_ID"
echo "Tier: $TIER"
echo ""

# Make request
curl -X POST "${SUPABASE_URL}/functions/v1/generate-daily-insights" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"brandId\": \"${BRAND_ID}\",
    \"tier\": \"${TIER}\",
    \"forceRegenerate\": true
  }" | jq '.'

echo ""
echo "Test completed!"
