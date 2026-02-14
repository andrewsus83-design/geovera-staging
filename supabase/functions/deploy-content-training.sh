#!/bin/bash

# ============================================================================
# GeoVera Content Training System - Deployment Script
# Deploys all content training Edge Functions
# ============================================================================

set -e

echo "🚀 Deploying GeoVera Content Training System..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please install it first."
    echo "   npm install -g supabase"
    exit 1
fi

# Navigate to functions directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Deploy analyze-visual-content
echo "📦 [1/5] Deploying analyze-visual-content..."
supabase functions deploy analyze-visual-content
echo "✅ analyze-visual-content deployed"
echo ""

# Deploy train-brand-model
echo "📦 [2/5] Deploying train-brand-model..."
supabase functions deploy train-brand-model
echo "✅ train-brand-model deployed"
echo ""

# Deploy record-content-feedback
echo "📦 [3/5] Deploying record-content-feedback..."
supabase functions deploy record-content-feedback
echo "✅ record-content-feedback deployed"
echo ""

# Deploy updated generate-image
echo "📦 [4/5] Deploying generate-image (enhanced)..."
supabase functions deploy generate-image
echo "✅ generate-image deployed"
echo ""

# Deploy updated generate-video
echo "📦 [5/5] Deploying generate-video (enhanced)..."
supabase functions deploy generate-video
echo "✅ generate-video deployed"
echo ""

echo "🎉 All Content Training functions deployed successfully!"
echo ""
echo "📋 Deployed Functions:"
echo "   1. analyze-visual-content - Analyze visual content patterns"
echo "   2. train-brand-model - Train brand visual guidelines"
echo "   3. record-content-feedback - Record user feedback"
echo "   4. generate-image - Generate brand-consistent images"
echo "   5. generate-video - Generate brand-consistent videos"
echo ""
echo "📚 Next Steps:"
echo "   1. Apply database migration: supabase migration up"
echo "   2. Test functions with curl or Postman"
echo "   3. Review documentation: VISUAL_TRAINING_GUIDE.md"
echo ""
echo "🔗 Function URLs:"
echo "   https://your-project.supabase.co/functions/v1/analyze-visual-content"
echo "   https://your-project.supabase.co/functions/v1/train-brand-model"
echo "   https://your-project.supabase.co/functions/v1/record-content-feedback"
echo "   https://your-project.supabase.co/functions/v1/generate-image"
echo "   https://your-project.supabase.co/functions/v1/generate-video"
echo ""
