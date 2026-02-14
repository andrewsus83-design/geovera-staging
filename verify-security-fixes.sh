#!/bin/bash

# GeoVera Intelligence Platform - Security Fix Verification Script
# Verifies that all critical security issues have been addressed

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo ""
echo "=================================================================="
echo "GeoVera Intelligence Platform - Security Verification"
echo "=================================================================="
echo ""

# Test 1: Check for hardcoded credentials in active HTML files
echo -e "${BLUE}Test 1: Checking for hardcoded Supabase URLs in HTML files...${NC}"
HARDCODED_URLS=$(grep -r "https://vozjwptzutolvkvfpknk.supabase.co\|https://trvvkdmqhtqoxgtxvlac.supabase.co" \
  --include="*.html" \
  --exclude-dir=archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  frontend/ 2>/dev/null | wc -l || echo "0")

if [ "$HARDCODED_URLS" -eq 0 ]; then
  echo -e "${GREEN}✓ PASSED: No hardcoded Supabase URLs found in active HTML files${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED: Found $HARDCODED_URLS hardcoded Supabase URLs${NC}"
  grep -r "https://vozjwptzutolvkvfpknk.supabase.co\|https://trvvkdmqhtqoxgtxvlac.supabase.co" \
    --include="*.html" \
    --exclude-dir=archive \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude="*.backup" \
    frontend/ 2>/dev/null | head -5
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: Check for JWT tokens in HTML files
echo -e "${BLUE}Test 2: Checking for hardcoded JWT tokens in HTML files...${NC}"
HARDCODED_JWTS=$(grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\." \
  --include="*.html" \
  --exclude-dir=archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  frontend/ 2>/dev/null | wc -l || echo "0")

if [ "$HARDCODED_JWTS" -eq 0 ]; then
  echo -e "${GREEN}✓ PASSED: No hardcoded JWT tokens found in active HTML files${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED: Found $HARDCODED_JWTS hardcoded JWT tokens${NC}"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: Check that .env files are in .gitignore
echo -e "${BLUE}Test 3: Checking .gitignore for .env protection...${NC}"
if grep -q "\.env" .gitignore 2>/dev/null; then
  echo -e "${GREEN}✓ PASSED: .env files are protected in .gitignore${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED: .env files not found in .gitignore${NC}"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: Check that env-loader.js exists
echo -e "${BLUE}Test 4: Checking for env-loader.js...${NC}"
if [ -f "frontend/env-loader.js" ]; then
  echo -e "${GREEN}✓ PASSED: env-loader.js exists${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED: env-loader.js not found${NC}"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 5: Check that .env.example exists
echo -e "${BLUE}Test 5: Checking for .env.example...${NC}"
if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓ PASSED: .env.example exists${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED: .env.example not found${NC}"
  FAILED=$((FAILED + 1))
fi
echo ""

# Test 6: Check that .env.local exists (warning if missing)
echo -e "${BLUE}Test 6: Checking for .env.local...${NC}"
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓ PASSED: .env.local exists${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARNING: .env.local not found (needed for local development)${NC}"
  echo -e "${YELLOW}  Create it by copying .env.example${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 7: Check that HTML files use ENV_CONFIG pattern
echo -e "${BLUE}Test 7: Checking for ENV_CONFIG usage pattern...${NC}"
ENV_PATTERN_COUNT=$(grep -r "window.getEnvConfig()" \
  --include="*.html" \
  --exclude-dir=archive \
  --exclude-dir=node_modules \
  --exclude-dir=.git \
  --exclude="*.backup" \
  frontend/ 2>/dev/null | wc -l || echo "0")

if [ "$ENV_PATTERN_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ PASSED: Found $ENV_PATTERN_COUNT files using ENV_CONFIG pattern${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARNING: No files found using ENV_CONFIG pattern${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 8: Check for credentials in archive (warning only)
echo -e "${BLUE}Test 8: Checking archive folder for old credentials...${NC}"
if [ -d "archive" ]; then
  ARCHIVE_CREDS=$(grep -r "https://vozjwptzutolvkvfpknk.supabase.co\|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\." \
    --include="*.html" \
    --include="*.ts" \
    --include="*.js" \
    archive/ 2>/dev/null | wc -l || echo "0")

  if [ "$ARCHIVE_CREDS" -gt 0 ]; then
    echo -e "${YELLOW}⚠ WARNING: Found $ARCHIVE_CREDS old credentials in archive folder${NC}"
    echo -e "${YELLOW}  This is OK if these are unused files, but consider cleaning them up${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "${GREEN}✓ PASSED: No credentials in archive folder${NC}"
    PASSED=$((PASSED + 1))
  fi
else
  echo -e "${YELLOW}⚠ INFO: No archive folder found${NC}"
fi
echo ""

# Test 9: Check that config.js exists
echo -e "${BLUE}Test 9: Checking for config.js...${NC}"
if [ -f "frontend/config.js" ]; then
  echo -e "${GREEN}✓ PASSED: config.js exists${NC}"
  PASSED=$((PASSED + 1))
else
  echo -e "${YELLOW}⚠ WARNING: config.js not found${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Test 10: Check for backup files
echo -e "${BLUE}Test 10: Checking for backup files...${NC}"
BACKUP_COUNT=$(find frontend -name "*.backup" 2>/dev/null | wc -l || echo "0")
if [ "$BACKUP_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ INFO: Found $BACKUP_COUNT backup files (for rollback if needed)${NC}"
  echo -e "${YELLOW}  You can safely delete these once you've verified the fixes work${NC}"
else
  echo -e "${YELLOW}⚠ INFO: No backup files found${NC}"
fi
echo ""

# Summary
echo "=================================================================="
echo "Security Verification Summary"
echo "=================================================================="
echo -e "${GREEN}Tests Passed: $PASSED${NC}"
echo -e "${RED}Tests Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✓ ALL CRITICAL SECURITY TESTS PASSED!${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Review SECURITY_FIX_INSTRUCTIONS.md"
  echo "2. Rotate Supabase anon key in dashboard"
  echo "3. Configure redirect URLs in Supabase"
  echo "4. Test authentication flow"
  echo "5. Deploy to production"
  echo ""
  exit 0
else
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}✗ SECURITY VERIFICATION FAILED!${NC}"
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo ""
  echo "Please fix the failed tests before deploying to production."
  echo "Review SECURITY_FIX_INSTRUCTIONS.md for guidance."
  echo ""
  exit 1
fi
