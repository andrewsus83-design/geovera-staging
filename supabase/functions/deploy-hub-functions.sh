#!/bin/bash

# ============================================================
# Deploy Authority Hub Functions
# ============================================================
# This script deploys all 4 Hub Edge Functions to Supabase
#
# Prerequisites:
# - Supabase CLI installed
# - Logged in to Supabase: supabase login
# - Project linked: supabase link --project-ref YOUR_PROJECT_REF
# - Environment variables set (see below)
# ============================================================

set -e  # Exit on error

echo "🚀 Deploying Authority Hub Functions"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI not found. Please install it first:"
    echo "  npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI found"

# Check if project is linked
if [ ! -f "./.supabase/config.toml" ]; then
    print_error "No Supabase project linked. Please run:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

print_success "Supabase project linked"

# ============================================================
# Check Environment Variables
# ============================================================

print_status "Checking environment variables..."

REQUIRED_VARS=(
    "PERPLEXITY_API_KEY"
    "ANTHROPIC_API_KEY"
    "OPENAI_API_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    # Check if secret exists (this will fail if not set, but we'll handle it)
    if ! supabase secrets list 2>/dev/null | grep -q "$var"; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_warning "Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_warning "Please set them using:"
    echo "  supabase secrets set PERPLEXITY_API_KEY=your_key"
    echo "  supabase secrets set ANTHROPIC_API_KEY=your_key"
    echo "  supabase secrets set OPENAI_API_KEY=your_key"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "All environment variables set"
fi

echo ""

# ============================================================
# Deploy Functions
# ============================================================

FUNCTIONS=(
    "hub-discover-content"
    "hub-generate-article"
    "hub-generate-charts"
    "hub-create-collection"
)

FAILED=()

for func in "${FUNCTIONS[@]}"; do
    print_status "Deploying $func..."

    if supabase functions deploy "$func" --no-verify-jwt; then
        print_success "$func deployed successfully"
    else
        print_error "$func deployment failed"
        FAILED+=("$func")
    fi

    echo ""
done

# ============================================================
# Summary
# ============================================================

echo "====================================="
echo "Deployment Summary"
echo "====================================="
echo ""

if [ ${#FAILED[@]} -eq 0 ]; then
    print_success "All functions deployed successfully!"
    echo ""
    echo "Functions deployed:"
    for func in "${FUNCTIONS[@]}"; do
        echo "  ✓ $func"
    done
else
    print_error "Some functions failed to deploy:"
    for func in "${FAILED[@]}"; do
        echo "  ✗ $func"
    done
    echo ""
    echo "Please check the error messages above and try again."
    exit 1
fi

echo ""
echo "====================================="
echo "Next Steps"
echo "====================================="
echo ""
echo "1. Test the functions:"
echo "   supabase functions invoke hub-create-collection \\"
echo "     --body '{\"category\": \"beauty\"}'"
echo ""
echo "2. View function logs:"
echo "   supabase functions logs hub-create-collection"
echo ""
echo "3. Create a test collection:"
echo "   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/hub-create-collection \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"category\": \"beauty\"}'"
echo ""
echo "4. Set up daily automation (optional):"
echo "   See HUB_FUNCTIONS_README.md for cron job examples"
echo ""

print_success "Deployment complete! 🎉"
