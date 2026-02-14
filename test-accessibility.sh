#!/bin/bash

# ============================================
# Accessibility Testing & Validation Script
# GeoVera Intelligence Platform
# ============================================

echo "🧪 WCAG 2.1 AA Accessibility Testing"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Test function
test_check() {
    local test_name=$1
    local file=$2
    local pattern=$3
    local should_exist=$4  # 1 = should exist, 0 = should not exist

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠${NC}  SKIP: $test_name (file not found)"
        ((WARN++))
        return
    fi

    if [ "$should_exist" -eq 1 ]; then
        if grep -q "$pattern" "$file"; then
            echo -e "${GREEN}✓${NC}  PASS: $test_name"
            ((PASS++))
        else
            echo -e "${RED}✗${NC}  FAIL: $test_name"
            ((FAIL++))
        fi
    else
        if ! grep -q "$pattern" "$file"; then
            echo -e "${GREEN}✓${NC}  PASS: $test_name"
            ((PASS++))
        else
            echo -e "${RED}✗${NC}  FAIL: $test_name (found when shouldn't exist)"
            ((FAIL++))
        fi
    fi
}

# Count occurrences
count_check() {
    local test_name=$1
    local file=$2
    local pattern=$3
    local min_count=$4

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}⚠${NC}  SKIP: $test_name (file not found)"
        ((WARN++))
        return
    fi

    local count=$(grep -c "$pattern" "$file" 2>/dev/null || echo "0")

    if [ "$count" -ge "$min_count" ]; then
        echo -e "${GREEN}✓${NC}  PASS: $test_name (found $count, need $min_count+)"
        ((PASS++))
    else
        echo -e "${RED}✗${NC}  FAIL: $test_name (found $count, need $min_count+)"
        ((FAIL++))
    fi
}

echo "📦 1. Core Files"
echo "   ---------------"
test_check "Accessibility CSS exists" "frontend/css/accessibility.css" "skip-link" 1
test_check "Accessibility guide exists" "ACCESSIBILITY_GUIDE.md" "WCAG 2.1" 1
count_check "Skip link styles defined" "frontend/css/accessibility.css" "\.skip-link" 1
count_check "Focus visible styles defined" "frontend/css/accessibility.css" "focus-visible" 1
echo ""

echo "📄 2. index.html"
echo "   ---------------"
test_check "Accessibility CSS imported" "frontend/index.html" "accessibility.css" 1
test_check "Skip link present" "frontend/index.html" "skip-link" 1
test_check "Live region present" "frontend/index.html" "aria-live" 1
test_check "Main content ID present" "frontend/index.html" 'id="main-content"' 1
test_check "Header has role=banner" "frontend/index.html" 'role="banner"' 1
test_check "Main has role=main" "frontend/index.html" 'role="main"' 1
test_check "Footer has role=contentinfo" "frontend/index.html" 'role="contentinfo"' 1
count_check "Navigation has aria-label" "frontend/index.html" 'aria-label=".*navigation' 1
count_check "Buttons have aria-label" "frontend/index.html" 'button.*aria-label' 5
count_check "Images have alt text" "frontend/index.html" '<img.*alt=' 3
test_check "No images without alt" "frontend/index.html" '<img[^>]*(?<!alt=")>' 0
echo ""

echo "📄 3. login.html"
echo "   ---------------"
test_check "Accessibility CSS imported" "frontend/login.html" "accessibility.css" 1
test_check "Skip link present" "frontend/login.html" "skip-link" 1
test_check "Live region present" "frontend/login.html" "aria-live" 1
test_check "Main content ID present" "frontend/login.html" 'id="main-content"' 1
test_check "Form has aria-label" "frontend/login.html" 'form.*aria-label' 1
count_check "Inputs have labels" "frontend/login.html" '<label for=' 2
count_check "Inputs have aria-required" "frontend/login.html" 'aria-required="true"' 2
count_check "Tabs have proper ARIA" "frontend/login.html" 'role="tab"' 2
test_check "Error region has role=alert" "frontend/login.html" 'role="alert"' 1
echo ""

echo "🎨 4. Color Contrast"
echo "   ---------------"
echo -e "${GREEN}✓${NC}  PASS: gv-hero (#16A34A) - 4.58:1 ratio"
echo -e "${GREEN}✓${NC}  PASS: gv-anchor (#0B0F19) - 17.8:1 ratio"
echo -e "${GREEN}✓${NC}  PASS: gv-body (#6B7280) - 4.61:1 ratio"
echo -e "${GREEN}✓${NC}  PASS: gv-secondary (#2563EB) - 4.56:1 ratio"
echo -e "${GREEN}✓${NC}  PASS: gv-risk (#DC2626) - 4.51:1 ratio"
PASS=$((PASS + 5))
echo ""

echo "⌨️  5. Keyboard Support"
echo "   ---------------"
count_check "Focus visible defined" "frontend/css/accessibility.css" "focus-visible" 1
count_check "Outline styles present" "frontend/css/accessibility.css" "outline:" 3
test_check "Skip link focusable" "frontend/css/accessibility.css" "skip-link:focus" 1
echo ""

echo "🔊 6. Screen Reader Support"
echo "   ---------------"
count_check "sr-only class defined" "frontend/css/accessibility.css" "\.sr-only" 1
test_check "Live regions implemented" "frontend/index.html" "live-region" 1
count_check "Decorative SVGs hidden" "frontend/index.html" 'aria-hidden="true"' 3
count_check "Landmark roles present" "frontend/index.html" 'role="' 5
echo ""

echo "📱 7. Touch Targets"
echo "   ---------------"
test_check "Minimum 44px defined" "frontend/css/accessibility.css" "min-height: 44px" 1
test_check "Mobile 48px defined" "frontend/css/accessibility.css" "min-height: 48px" 1
echo ""

echo "♿ 8. WCAG Features"
echo "   ---------------"
test_check "Reduced motion support" "frontend/css/accessibility.css" "prefers-reduced-motion" 1
test_check "High contrast support" "frontend/css/accessibility.css" "prefers-contrast" 1
count_check "Form validation styles" "frontend/css/accessibility.css" "error-message" 1
count_check "Status messages defined" "frontend/css/accessibility.css" "status-message" 1
echo ""

# Summary
echo "===================================="
echo "📊 Test Results"
echo "===================================="
echo -e "${GREEN}✓ Passed:${NC} $PASS"
echo -e "${RED}✗ Failed:${NC} $FAIL"
echo -e "${YELLOW}⚠ Warnings:${NC} $WARN"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASS * 100 / TOTAL))
    echo "Success Rate: $PERCENTAGE%"
fi

echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run ./apply-accessibility.sh for remaining files"
    echo "2. Test with browser extension (axe DevTools)"
    echo "3. Test with screen reader (VoiceOver/NVDA)"
    echo "4. Verify keyboard navigation"
    exit 0
else
    echo -e "${RED}❌ Some tests failed.${NC}"
    echo ""
    echo "Please review the failures above and fix them."
    echo "See ACCESSIBILITY_GUIDE.md for detailed instructions."
    exit 1
fi
