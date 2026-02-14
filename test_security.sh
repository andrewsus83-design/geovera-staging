#!/bin/bash
# Security Testing Script for GeoVera
# Run this after applying security fixes

set -e

echo "🔒 GeoVera Security Testing Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAIL++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

echo "Test 1: Checking for hardcoded credentials in frontend..."
if grep -r "SUPABASE_KEY\|SUPABASE_ANON_KEY" frontend/*.html > /dev/null 2>&1; then
    fail "Hardcoded credentials found in HTML files"
    echo "   Found in:"
    grep -l "SUPABASE_KEY\|SUPABASE_ANON_KEY" frontend/*.html | head -5
else
    pass "No hardcoded credentials in HTML files"
fi
echo ""

echo "Test 2: Checking for .env.local file..."
if [ -f "frontend/.env.local" ]; then
    pass ".env.local exists"
else
    fail ".env.local not found - credentials not moved to env vars"
fi
echo ""

echo "Test 3: Checking .gitignore..."
if grep -q ".env.local" frontend/.gitignore 2>/dev/null; then
    pass ".env.local is in .gitignore"
else
    warn ".env.local should be added to .gitignore"
fi
echo ""

echo "Test 4: Checking migration files..."
if [ -f "SECURITY_FIX_CRITICAL.sql" ]; then
    pass "Security fix SQL exists"
else
    fail "SECURITY_FIX_CRITICAL.sql not found"
fi
echo ""

echo "Test 5: Checking if Supabase CLI is installed..."
if command -v supabase &> /dev/null; then
    pass "Supabase CLI installed"
    echo "   Version: $(supabase --version)"
else
    warn "Supabase CLI not installed - cannot run DB tests"
fi
echo ""

echo "Test 6: Checking frontend file structure..."
CRITICAL_FILES=("login-working.html" "dashboard.html" "onboarding-v4.html")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "frontend/$file" ]; then
        pass "Found frontend/$file"
    else
        fail "Missing frontend/$file"
    fi
done
echo ""

echo "Test 7: Checking for Edge Functions..."
FUNCTIONS_DIR="supabase/functions"
if [ -d "$FUNCTIONS_DIR" ]; then
    FUNC_COUNT=$(find $FUNCTIONS_DIR -name "index.ts" | wc -l)
    pass "Found $FUNC_COUNT Edge Functions"
else
    fail "Edge Functions directory not found"
fi
echo ""

echo "Test 8: Checking for exposed secrets..."
SECRET_PATTERNS=("password\s*=\s*['\"]" "api_key\s*=\s*['\"]" "secret\s*=\s*['\"]")
FOUND_SECRETS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -rE "$pattern" frontend/*.html > /dev/null 2>&1; then
        ((FOUND_SECRETS++))
    fi
done
if [ $FOUND_SECRETS -eq 0 ]; then
    pass "No obvious secrets found in frontend"
else
    warn "Found $FOUND_SECRETS potential secrets in frontend files"
fi
echo ""

echo "Test 9: Checking for SQL injection vulnerabilities in Edge Functions..."
if grep -r "\${\|string interpolation" supabase/functions/ | grep -v "Deno.env" > /dev/null 2>&1; then
    warn "Potential SQL injection risks found - review Edge Functions"
else
    pass "No obvious SQL injection patterns found"
fi
echo ""

echo "Test 10: Checking CORS configuration..."
if grep -r "Access-Control-Allow-Origin.*\*" supabase/functions/ > /dev/null 2>&1; then
    warn "CORS set to '*' - consider restricting in production"
else
    pass "CORS appears to be restricted"
fi
echo ""

echo ""
echo "===================================="
echo "📊 Test Results"
echo "===================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run QUICK_FIX_SCRIPT.sql in Supabase SQL Editor"
    echo "2. Test authentication flow manually"
    echo "3. Test tier-based access control"
    echo "4. Deploy to staging and test end-to-end"
    exit 0
else
    echo -e "${RED}⚠️  $FAIL test(s) failed!${NC}"
    echo ""
    echo "Please fix the failed tests before deploying:"
    echo "- Review SECURITY_AUDIT_REPORT.md for details"
    echo "- Run QUICK_FIX_SCRIPT.sql to fix RLS issues"
    echo "- Move credentials to .env.local"
    exit 1
fi
