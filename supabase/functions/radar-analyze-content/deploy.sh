#!/bin/bash

# ============================================================
# Deployment script for radar-analyze-content Edge Function
# ============================================================

set -e

echo "🚀 Deploying radar-analyze-content Edge Function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not set in environment"
    read -p "Enter your Anthropic API key: " ANTHROPIC_API_KEY
    export ANTHROPIC_API_KEY
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "  ✓ Supabase CLI installed"
echo "  ✓ ANTHROPIC_API_KEY configured"

# Link to project (if not already linked)
echo ""
echo "🔗 Linking to Supabase project..."
supabase link || echo "Already linked or manual link required"

# Set secrets
echo ""
echo "🔐 Setting secrets..."
supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

# Deploy function
echo ""
echo "📦 Deploying function..."
supabase functions deploy radar-analyze-content

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Test the function:"
echo "     supabase functions invoke radar-analyze-content --body '{\"batch\":true,\"category\":\"beauty\"}'"
echo ""
echo "  2. View logs:"
echo "     supabase functions logs radar-analyze-content"
echo ""
echo "  3. Monitor in dashboard:"
echo "     https://supabase.com/dashboard/project/[project-ref]/functions"
echo ""
echo "  4. Get function URL:"
echo "     https://[project-ref].supabase.co/functions/v1/radar-analyze-content"
echo ""
