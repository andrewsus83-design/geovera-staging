#!/bin/bash

# ============================================================================
# QA Generator Deployment Script
# ============================================================================
# Deploys the qa-generator Edge Function to Supabase
#
# Usage: ./deploy-qa-generator.sh
# ============================================================================

set -e  # Exit on error

echo "=========================================================================="
echo "  QA Generator - Deploy to Supabase"
echo "=========================================================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if we're in the correct directory
if [ ! -f "supabase/functions/qa-generator/index.ts" ]; then
    echo "❌ Error: qa-generator function not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "✅ Function files found"
echo ""

# Verify environment variables
echo "📋 Checking required environment variables..."

REQUIRED_VARS=(
    "ANTHROPIC_API_KEY"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        echo "   ✅ $var is set"
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo ""
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these variables before deploying:"
    echo "   export ANTHROPIC_API_KEY=your_key_here"
    echo "   export SUPABASE_URL=your_url_here"
    echo "   export SUPABASE_SERVICE_ROLE_KEY=your_key_here"
    exit 1
fi

echo ""
echo "=========================================================================="
echo "  Deploying qa-generator Function"
echo "=========================================================================="
echo ""

# Deploy the function
echo "🚀 Deploying function..."
supabase functions deploy qa-generator

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================================================="
    echo "  ✅ Deployment Successful!"
    echo "=========================================================================="
    echo ""
    echo "Function URL:"
    echo "  ${SUPABASE_URL}/functions/v1/qa-generator"
    echo ""
    echo "Test the function:"
    echo "  deno run --allow-net --allow-env supabase/functions/test-qa-generator.ts"
    echo ""
    echo "Or use curl:"
    echo "  curl -X POST ${SUPABASE_URL}/functions/v1/qa-generator \\"
    echo "    -H \"Authorization: Bearer YOUR_TOKEN\" \\"
    echo "    -H \"Content-Type: application/json\" \\"
    echo "    -d '{\"category_id\": \"YOUR_CATEGORY_UUID\"}'"
    echo ""
    echo "Expected output:"
    echo "  - 600 Social QA pairs (40%)"
    echo "  - 500 GEO QA pairs (33%)"
    echo "  - 400 SEO QA pairs (27%)"
    echo "  - Total: 1500 QA pairs"
    echo ""
    echo "Cost: ~$0.48 per category (Claude 3.5 Sonnet)"
    echo ""
else
    echo ""
    echo "=========================================================================="
    echo "  ❌ Deployment Failed"
    echo "=========================================================================="
    echo ""
    echo "Please check the error messages above and try again."
    exit 1
fi
