#!/bin/bash

# GeoVera Intelligence Platform - Security Fix Script
# Removes all hardcoded Supabase credentials from HTML files
# WARNING: This script modifies files in place. Commit your work first!

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=================================="
echo "GeoVera Security Fix Script"
echo "=================================="
echo ""
echo "This script will:"
echo "1. Remove hardcoded Supabase credentials"
echo "2. Replace with environment-based configuration"
echo "3. Fix all affected HTML files"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
FIXED_COUNT=0

# Function to fix a file
fix_file() {
    local file="$1"
    echo -e "${YELLOW}Processing:${NC} $file"

    # Check if file contains hardcoded credentials
    if grep -q "const SUPABASE_URL = 'https://vozjwptzutolvkvfpknk.supabase.co'" "$file" || \
       grep -q "const SUPABASE_URL = 'https://trvvkdmqhtqoxgtxvlac.supabase.co'" "$file"; then

        # Create backup
        cp "$file" "$file.backup"

        # Fix production project credentials (vozjwptzutolvkvfpknk)
        sed -i.tmp "s|const SUPABASE_URL = 'https://vozjwptzutolvkvfpknk.supabase.co';|const ENV_CONFIG = window.getEnvConfig();\n        const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;|g" "$file"

        # Fix legacy project credentials (trvvkdmqhtqoxgtxvlac)
        sed -i.tmp "s|const SUPABASE_URL = 'https://trvvkdmqhtqoxgtxvlac.supabase.co';|const ENV_CONFIG = window.getEnvConfig();\n        const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;|g" "$file"

        # Fix SUPABASE_KEY/SUPABASE_ANON_KEY declarations
        sed -i.tmp "s|const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^']*';|const SUPABASE_KEY = ENV_CONFIG.SUPABASE_ANON_KEY;|g" "$file"
        sed -i.tmp "s|const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9[^']*';|const SUPABASE_ANON_KEY = ENV_CONFIG.SUPABASE_ANON_KEY;|g" "$file"

        # Add env-loader.js script if not present
        if ! grep -q "env-loader.js" "$file"; then
            sed -i.tmp 's|<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>|<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    <script src="env-loader.js"></script>|g' "$file"
        fi

        # Remove temp file
        rm -f "$file.tmp"

        echo -e "${GREEN}✓ Fixed:${NC} $file"
        FIXED_COUNT=$((FIXED_COUNT + 1))
    else
        echo -e "${YELLOW}  Skipped (no hardcoded credentials found)${NC}"
    fi
}

# Fix all frontend HTML files
echo ""
echo "Fixing frontend HTML files..."
echo ""

for file in frontend/*.html; do
    if [ -f "$file" ]; then
        fix_file "$file"
    fi
done

# Fix test files
if [ -f "test-onboarding-flow.html" ]; then
    fix_file "test-onboarding-flow.html"
fi

# Summary
echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo -e "${GREEN}Files fixed: $FIXED_COUNT${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test one of the HTML files to ensure it works"
echo "3. Update .env.local with your actual credentials"
echo "4. Rotate your Supabase anon key in the dashboard"
echo "5. Commit the changes"
echo ""
echo "Backup files created with .backup extension"
echo "=================================="
