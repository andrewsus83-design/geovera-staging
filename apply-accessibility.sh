#!/bin/bash

# ============================================
# WCAG 2.1 AA Accessibility Fix Script
# GeoVera Intelligence Platform
# ============================================

echo "🚀 Starting WCAG 2.1 AA Accessibility Implementation..."

# Define files to update (excluding already completed: index.html, login.html)
FILES=(
    "frontend/dashboard.html"
    "frontend/pricing.html"
    "frontend/onboarding.html"
    "frontend/chat.html"
    "frontend/content-studio.html"
    "frontend/hub.html"
    "frontend/hub-collection.html"
    "frontend/forgot-password.html"
    "frontend/email-confirmed.html"
)

# Backup function
backup_file() {
    local file=$1
    cp "$file" "${file}.backup-$(date +%Y%m%d-%H%M%S)"
    echo "  ✓ Backed up: $file"
}

# Add accessibility CSS link to head
add_accessibility_css() {
    local file=$1
    if ! grep -q "accessibility.css" "$file"; then
        sed -i.bak '/<link.*fonts\.googleapis\.com.*>/a\    <link rel="stylesheet" href="/css/accessibility.css">' "$file"
        echo "  ✓ Added accessibility.css link"
    fi
}

# Add skip link after body tag
add_skip_link() {
    local file=$1
    if ! grep -q "skip-link" "$file"; then
        sed -i.bak '/<body[^>]*>/a\    <!-- Skip to Main Content Link - WCAG 2.1 AA -->\
    <a href="#main-content" class="skip-link">Skip to main content</a>\
\
    <!-- Live Region for Screen Reader Announcements -->\
    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only live-region" id="announcements"></div>\
' "$file"
        echo "  ✓ Added skip link and live region"
    fi
}

# Process each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo ""
        echo "📝 Processing: $file"

        # Backup original
        backup_file "$file"

        # Add accessibility CSS
        add_accessibility_css "$file"

        # Add skip link
        add_skip_link "$file"

        echo "  ✅ Completed: $file"
    else
        echo "  ⚠️  File not found: $file"
    fi
done

echo ""
echo "============================================"
echo "✨ Accessibility fixes applied!"
echo ""
echo "📋 Manual fixes still needed:"
echo "  1. Add aria-label to all buttons"
echo "  2. Add aria-label to all navigation links"
echo "  3. Add role attributes (banner, main, navigation, contentinfo)"
echo "  4. Add aria-labelledby to form inputs"
echo "  5. Mark decorative images/SVGs with aria-hidden='true'"
echo "  6. Add proper heading hierarchy (h1 -> h2 -> h3)"
echo "  7. Test with screen reader (VoiceOver/NVDA)"
echo ""
echo "📖 See accessibility-fixes.md for complete checklist"
echo "============================================"
