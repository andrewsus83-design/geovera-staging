#!/bin/bash
#
# GeoVera Production Deployment Script
# This script deploys all edge functions to production
#

set -e

echo "================================================================"
echo "GeoVera Production Deployment to geovera.xyz"
echo "================================================================"
echo ""
echo "This script will deploy all 26 edge functions to production."
echo ""
read -p "Are you ready to deploy? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Starting deployment..."
echo ""

# Edge Functions to deploy
FUNCTIONS=(
    "ai-chat"
    "analyze-visual-content"
    "buzzsumo-discover-viral"
    "buzzsumo-generate-story"
    "buzzsumo-get-discoveries"
    "generate-article"
    "generate-daily-insights"
    "generate-image"
    "generate-video"
    "hub-create-collection"
    "hub-discover-content"
    "hub-generate-article"
    "hub-generate-charts"
    "onboard-brand-v4"
    "radar-analyze-content"
    "radar-calculate-marketshare"
    "radar-calculate-rankings"
    "radar-discover-brands"
    "radar-discover-creators"
    "radar-discover-trends"
    "radar-learn-brand-authority"
    "radar-scrape-content"
    "radar-scrape-serpapi"
    "record-content-feedback"
    "simple-onboarding"
    "train-brand-model"
)

DEPLOYED=0
FAILED=0
FAILED_FUNCTIONS=()

# Deploy each function
for func in "${FUNCTIONS[@]}"; do
    echo "-----------------------------------------------------------"
    echo "Deploying: $func"
    echo "-----------------------------------------------------------"
    
    if supabase functions deploy "$func" 2>&1; then
        DEPLOYED=$((DEPLOYED + 1))
        echo "✓ $func deployed successfully"
    else
        FAILED=$((FAILED + 1))
        FAILED_FUNCTIONS+=("$func")
        echo "✗ $func failed to deploy"
    fi
    echo ""
done

echo "================================================================"
echo "Deployment Summary"
echo "================================================================"
echo "Successfully deployed: $DEPLOYED / ${#FUNCTIONS[@]}"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "Failed functions:"
    for func in "${FAILED_FUNCTIONS[@]}"; do
        echo "  - $func"
    done
    echo ""
    echo "⚠️  Deployment completed with errors!"
    exit 1
else
    echo "✓ All functions deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy frontend to geovera.xyz via Vercel"
    echo "2. Configure DNS records for geovera.xyz"
    echo "3. Run smoke tests from FINAL_SMOKE_TEST_RESULTS.md"
    echo "4. Monitor logs for first 24 hours"
    echo ""
    echo "🚀 Production deployment complete!"
fi
