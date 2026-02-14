#!/bin/bash

# GeoVera Navigation Verification Script
# Agent 12: Global Navigation & Design Polish Specialist
# Run this script to verify navigation standardization

echo "=============================================="
echo "GeoVera Navigation Verification"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Production pages to check
PAGES=(
    "index.html"
    "dashboard.html"
    "pricing.html"
    "chat.html"
    "content-studio.html"
    "radar.html"
    "insights.html"
    "settings.html"
    "creators.html"
    "analytics.html"
    "hub.html"
)

# Change to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# 1. Check Navigation Headers
echo "1. Checking Navigation Headers..."
echo "   ------------------------------"
nav_count=0
for page in "${PAGES[@]}"; do
    if grep -q 'aria-label="Main navigation"' "$page" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} $page has navigation"
        ((nav_count++))
    else
        echo -e "   ${RED}✗${NC} $page MISSING navigation"
    fi
done
echo "   Result: $nav_count/11 pages have navigation"
if [ "$nav_count" -eq 11 ]; then
    echo -e "   ${GREEN}PASS${NC} - All pages have navigation"
else
    echo -e "   ${RED}FAIL${NC} - Some pages missing navigation"
fi
echo ""

# 2. Check Border-Radius Violations
echo "2. Checking Border-Radius Violations..."
echo "   ------------------------------------"
violation_count=0
for page in "${PAGES[@]}"; do
    violations=$(grep -c 'border-radius: [1-9]' "$page" 2>/dev/null | head -1 || echo "0")
    # Filter out logos and avatars
    clean_violations=$(grep 'border-radius: [1-9]' "$page" 2>/dev/null | grep -v '50%' | grep -v 'logo' | grep -v 'avatar' | wc -l | tr -d ' ')
    if [ "$clean_violations" -eq 0 ]; then
        echo -e "   ${GREEN}✓${NC} $page: 0 violations"
    else
        echo -e "   ${RED}✗${NC} $page: $clean_violations violations"
        ((violation_count+=clean_violations))
    fi
done
echo "   Total violations: $violation_count"
if [ "$violation_count" -eq 0 ]; then
    echo -e "   ${GREEN}PASS${NC} - No border-radius violations"
else
    echo -e "   ${RED}FAIL${NC} - Border-radius violations found"
fi
echo ""

# 3. Check Georgia Font
echo "3. Checking Georgia Font..."
echo "   ------------------------"
georgia_count=0
for page in "${PAGES[@]}"; do
    if grep -q "Georgia" "$page" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} $page has Georgia font"
        ((georgia_count++))
    else
        echo -e "   ${RED}✗${NC} $page MISSING Georgia font"
    fi
done
echo "   Result: $georgia_count/11 pages have Georgia"
if [ "$georgia_count" -eq 11 ]; then
    echo -e "   ${GREEN}PASS${NC} - All pages use Georgia font"
else
    echo -e "   ${RED}FAIL${NC} - Some pages missing Georgia font"
fi
echo ""

# 4. Check Design Tokens
echo "4. Checking Design Tokens..."
echo "   -------------------------"
token_count=0
required_tokens=("--gv-hero" "--gv-anchor" "--gv-body")
for page in "${PAGES[@]}"; do
    has_all_tokens=true
    for token in "${required_tokens[@]}"; do
        if ! grep -q "$token" "$page" 2>/dev/null; then
            has_all_tokens=false
            break
        fi
    done
    if [ "$has_all_tokens" = true ]; then
        echo -e "   ${GREEN}✓${NC} $page has design tokens"
        ((token_count++))
    else
        echo -e "   ${YELLOW}⚠${NC} $page missing some design tokens"
    fi
done
echo "   Result: $token_count/11 pages have all tokens"
echo ""

# 5. Check ARIA Labels
echo "5. Checking ARIA Accessibility..."
echo "   ------------------------------"
aria_count=0
for page in "${PAGES[@]}"; do
    has_aria=false
    if grep -q 'role="banner"' "$page" 2>/dev/null && \
       grep -q 'aria-label="Main navigation"' "$page" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} $page has ARIA labels"
        ((aria_count++))
        has_aria=true
    fi
    if [ "$has_aria" = false ]; then
        echo -e "   ${RED}✗${NC} $page MISSING ARIA labels"
    fi
done
echo "   Result: $aria_count/11 pages have ARIA labels"
if [ "$aria_count" -eq 11 ]; then
    echo -e "   ${GREEN}PASS${NC} - All pages have ARIA accessibility"
else
    echo -e "   ${RED}FAIL${NC} - Some pages missing ARIA labels"
fi
echo ""

# Summary
echo "=============================================="
echo "SUMMARY"
echo "=============================================="
echo ""

total_checks=5
passed_checks=0

[ "$nav_count" -eq 11 ] && ((passed_checks++))
[ "$violation_count" -eq 0 ] && ((passed_checks++))
[ "$georgia_count" -eq 11 ] && ((passed_checks++))
[ "$token_count" -ge 8 ] && ((passed_checks++))
[ "$aria_count" -eq 11 ] && ((passed_checks++))

echo "Navigation Headers:    $nav_count/11 pages"
echo "Border-Radius:         $violation_count violations"
echo "Georgia Font:          $georgia_count/11 pages"
echo "Design Tokens:         $token_count/11 pages"
echo "ARIA Accessibility:    $aria_count/11 pages"
echo ""
echo "Checks Passed:         $passed_checks/$total_checks"
echo ""

if [ "$passed_checks" -eq "$total_checks" ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo "Production ready! 🎯"
    exit 0
else
    echo -e "${RED}✗ SOME CHECKS FAILED${NC}"
    echo "Please review issues above."
    exit 1
fi
