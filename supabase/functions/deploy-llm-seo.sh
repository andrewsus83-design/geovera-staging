#!/bin/bash

# ============================================================================
# GEOVERA - LLM SEO, GEO & Social Search Deployment Script
# Deploys Edge Functions for Feature 2: Search Intelligence
# ============================================================================

set -e

echo "🚀 Deploying GeoVera LLM SEO Functions..."
echo "=========================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo ""
echo "📦 Functions to deploy:"
echo "  1. llm-seo-tracker     - Track brand visibility on AI platforms (ChatGPT, Gemini, etc.)"
echo "  2. generate-300qa      - Generate 300 monthly questions with Claude"
echo "  3. perplexity-research - Deep market research with Perplexity"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🔑 Checking required environment variables..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please fill in the API keys before deploying."
        exit 1
    else
        echo "❌ No .env.example found. Please create .env manually with:"
        echo "   OPENAI_API_KEY=..."
        echo "   GEMINI_API_KEY=..."
        echo "   PERPLEXITY_API_KEY=..."
        echo "   ANTHROPIC_API_KEY=..."
        echo "   SERPAPI_KEY=..."
        exit 1
    fi
fi

# Load environment variables
source .env

# Validate required API keys
REQUIRED_KEYS=(
    "OPENAI_API_KEY"
    "GEMINI_API_KEY"
    "PERPLEXITY_API_KEY"
    "ANTHROPIC_API_KEY"
)

MISSING_KEYS=()

for key in "${REQUIRED_KEYS[@]}"; do
    if [ -z "${!key}" ]; then
        MISSING_KEYS+=("$key")
    else
        echo "✅ $key configured"
    fi
done

if [ ${#MISSING_KEYS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Missing required API keys:"
    for key in "${MISSING_KEYS[@]}"; do
        echo "   - $key"
    done
    echo ""
    echo "Please add these to your .env file and Supabase secrets:"
    echo "   supabase secrets set OPENAI_API_KEY=sk-..."
    echo "   supabase secrets set GEMINI_API_KEY=..."
    echo "   supabase secrets set PERPLEXITY_API_KEY=pplx-..."
    echo "   supabase secrets set ANTHROPIC_API_KEY=sk-ant-..."
    exit 1
fi

echo ""
echo "📤 Setting secrets on Supabase..."

# Set secrets (only if they're not already set)
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY" --project-ref ${SUPABASE_PROJECT_REF:-auto}
supabase secrets set GEMINI_API_KEY="$GEMINI_API_KEY" --project-ref ${SUPABASE_PROJECT_REF:-auto}
supabase secrets set PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY" --project-ref ${SUPABASE_PROJECT_REF:-auto}
supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" --project-ref ${SUPABASE_PROJECT_REF:-auto}

echo "✅ Secrets configured"

echo ""
echo "🚀 Deploying functions..."
echo ""

# Deploy LLM SEO Tracker
echo "1️⃣  Deploying llm-seo-tracker..."
supabase functions deploy llm-seo-tracker \
    --project-ref ${SUPABASE_PROJECT_REF:-auto} \
    --no-verify-jwt
echo "✅ llm-seo-tracker deployed"
echo ""

# Deploy 300QA Generator
echo "2️⃣  Deploying generate-300qa..."
supabase functions deploy generate-300qa \
    --project-ref ${SUPABASE_PROJECT_REF:-auto} \
    --no-verify-jwt
echo "✅ generate-300qa deployed"
echo ""

# Deploy Perplexity Research
echo "3️⃣  Deploying perplexity-research..."
supabase functions deploy perplexity-research \
    --project-ref ${SUPABASE_PROJECT_REF:-auto} \
    --no-verify-jwt
echo "✅ perplexity-research deployed"
echo ""

echo "=========================================="
echo "✅ All LLM SEO functions deployed successfully!"
echo ""
echo "📊 Function URLs:"
echo "  - llm-seo-tracker:     https://your-project.supabase.co/functions/v1/llm-seo-tracker"
echo "  - generate-300qa:      https://your-project.supabase.co/functions/v1/generate-300qa"
echo "  - perplexity-research: https://your-project.supabase.co/functions/v1/perplexity-research"
echo ""
echo "🧪 To test the functions:"
echo "   deno run --allow-all supabase/functions/llm-seo-tracker/test.ts"
echo ""
echo "📖 Documentation:"
echo "   See supabase/functions/llm-seo-tracker/README.md"
echo ""

# Ask if user wants to run tests
echo ""
read -p "Run test script? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧪 Running tests..."
    deno run --allow-all supabase/functions/llm-seo-tracker/test.ts
fi

echo ""
echo "🎉 Deployment complete!"
