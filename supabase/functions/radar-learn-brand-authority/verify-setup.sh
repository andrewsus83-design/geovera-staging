#!/bin/bash

# Verification script for radar-learn-brand-authority deployment
# Usage: ./verify-setup.sh

set -e

echo "🔍 Verifying radar-learn-brand-authority setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((CHECKS_PASSED++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((CHECKS_FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check migration file exists
echo "📄 Checking migration file..."
if [ -f "../../migrations/20260213250000_brand_authority_patterns.sql" ]; then
  check_pass "Migration file exists"
else
  check_fail "Migration file not found"
fi

# 2. Check Edge Function files
echo ""
echo "📦 Checking Edge Function files..."

if [ -f "index.ts" ]; then
  check_pass "index.ts exists"

  # Check file size (should be >10KB)
  FILE_SIZE=$(wc -c < "index.ts")
  if [ "$FILE_SIZE" -gt 10000 ]; then
    check_pass "index.ts has content ($FILE_SIZE bytes)"
  else
    check_warn "index.ts seems too small ($FILE_SIZE bytes)"
  fi
else
  check_fail "index.ts not found"
fi

if [ -f "README.md" ]; then
  check_pass "README.md exists"
else
  check_fail "README.md not found"
fi

if [ -f "INTEGRATION.md" ]; then
  check_pass "INTEGRATION.md exists"
else
  check_fail "INTEGRATION.md not found"
fi

if [ -f "DEPLOYMENT.md" ]; then
  check_pass "DEPLOYMENT.md exists"
else
  check_fail "DEPLOYMENT.md not found"
fi

if [ -f "QUICK_REFERENCE.md" ]; then
  check_pass "QUICK_REFERENCE.md exists"
else
  check_fail "QUICK_REFERENCE.md not found"
fi

if [ -f "test.ts" ]; then
  check_pass "test.ts exists"
else
  check_fail "test.ts not found"
fi

# 3. Check code quality
echo ""
echo "🔬 Checking code quality..."

# Check for required imports
if grep -q "@supabase/supabase-js" index.ts; then
  check_pass "Supabase client import found"
else
  check_fail "Supabase client import missing"
fi

if grep -q "ANTHROPIC_API_KEY" index.ts; then
  check_pass "Anthropic API key check found"
else
  check_fail "Anthropic API key check missing"
fi

if grep -q "corsHeaders" index.ts; then
  check_pass "CORS headers configured"
else
  check_fail "CORS headers missing"
fi

# Check for main functions
if grep -q "learnPatternsWithClaude" index.ts; then
  check_pass "Pattern learning function found"
else
  check_fail "Pattern learning function missing"
fi

if grep -q "sampleContentForCategory" index.ts; then
  check_pass "Content sampling function found"
else
  check_fail "Content sampling function missing"
fi

# 4. Check migration SQL quality
echo ""
echo "🗄️  Checking migration SQL..."

MIGRATION_FILE="../../migrations/20260213250000_brand_authority_patterns.sql"

if grep -q "CREATE TABLE.*gv_brand_authority_patterns" "$MIGRATION_FILE"; then
  check_pass "Table creation statement found"
else
  check_fail "Table creation statement missing"
fi

if grep -q "CREATE INDEX.*idx_brand_authority_category" "$MIGRATION_FILE"; then
  check_pass "Category index found"
else
  check_fail "Category index missing"
fi

if grep -q "CREATE UNIQUE INDEX.*idx_brand_authority_unique_active" "$MIGRATION_FILE"; then
  check_pass "Unique active pattern constraint found"
else
  check_fail "Unique active pattern constraint missing"
fi

if grep -q "get_active_authority_patterns" "$MIGRATION_FILE"; then
  check_pass "Helper function found"
else
  check_fail "Helper function missing"
fi

# 5. Check documentation completeness
echo ""
echo "📚 Checking documentation..."

# Check README sections
if grep -q "## Overview" README.md && \
   grep -q "## API Reference" README.md && \
   grep -q "## Usage Examples" README.md && \
   grep -q "## Integration" README.md; then
  check_pass "README has all required sections"
else
  check_fail "README missing required sections"
fi

# Check DEPLOYMENT sections
if grep -q "## Prerequisites" DEPLOYMENT.md && \
   grep -q "## Deployment Steps" DEPLOYMENT.md && \
   grep -q "## Verification Checklist" DEPLOYMENT.md; then
  check_pass "DEPLOYMENT has all required sections"
else
  check_fail "DEPLOYMENT missing required sections"
fi

# 6. Check for common issues
echo ""
echo "🐛 Checking for common issues..."

# Check for hardcoded credentials
if grep -qi "sk-ant-" index.ts; then
  check_fail "Found hardcoded Anthropic API key!"
else
  check_pass "No hardcoded credentials found"
fi

# Check for TODO comments
TODO_COUNT=$(grep -c "TODO" index.ts || echo "0")
if [ "$TODO_COUNT" -eq 0 ]; then
  check_pass "No TODO comments (code complete)"
else
  check_warn "Found $TODO_COUNT TODO comments"
fi

# Check for console.log (should have some for debugging)
LOG_COUNT=$(grep -c "console.log" index.ts || echo "0")
if [ "$LOG_COUNT" -gt 0 ]; then
  check_pass "Logging statements present ($LOG_COUNT found)"
else
  check_warn "No logging statements found"
fi

# 7. Check test file
echo ""
echo "🧪 Checking test file..."

if grep -q "testCases" test.ts; then
  check_pass "Test cases defined"
else
  check_fail "Test cases missing"
fi

if grep -q "runAllTests" test.ts; then
  check_pass "Test runner function found"
else
  check_fail "Test runner function missing"
fi

# 8. Check summary document
echo ""
echo "📋 Checking summary document..."

SUMMARY_FILE="../../../RADAR_BRAND_AUTHORITY_LEARNING.md"
if [ -f "$SUMMARY_FILE" ]; then
  check_pass "Summary document exists"

  if grep -q "## System Architecture" "$SUMMARY_FILE" && \
     grep -q "## Cost Analysis" "$SUMMARY_FILE" && \
     grep -q "## Deployment Checklist" "$SUMMARY_FILE"; then
    check_pass "Summary has all required sections"
  else
    check_fail "Summary missing required sections"
  fi
else
  check_fail "Summary document not found"
fi

# Final summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed:${NC} $CHECKS_PASSED"
echo -e "${RED}Failed:${NC} $CHECKS_FAILED"
echo ""

if [ "$CHECKS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}✨ All checks passed! Ready for deployment.${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Apply migration: supabase db push"
  echo "  2. Deploy function: supabase functions deploy radar-learn-brand-authority --no-verify-jwt"
  echo "  3. Run tests: deno run --allow-net --allow-env test.ts"
  echo ""
  exit 0
else
  echo -e "${RED}⚠️  Some checks failed. Please review and fix issues above.${NC}"
  echo ""
  exit 1
fi
