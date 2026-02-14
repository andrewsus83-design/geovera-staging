#!/usr/bin/env python3
"""
GeoVera Intelligence Platform - Security Fix Script
Removes all hardcoded Supabase credentials from HTML files
"""

import os
import re
import sys
from pathlib import Path

# Hardcoded credentials patterns to find and remove
SUPABASE_URL_PRODUCTION = 'https://vozjwptzutolvkvfpknk.supabase.co'
SUPABASE_URL_LEGACY = 'https://trvvkdmqhtqoxgtxvlac.supabase.co'

# Pattern to match JWT tokens (starts with eyJ)
JWT_PATTERN = r"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"

def fix_file(file_path):
    """Fix a single HTML file by removing hardcoded credentials"""
    print(f"Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    modified = False

    # Check if file has hardcoded credentials
    has_credentials = (
        SUPABASE_URL_PRODUCTION in content or
        SUPABASE_URL_LEGACY in content or
        re.search(JWT_PATTERN, content)
    )

    if not has_credentials:
        print(f"  ✓ Skipped (no hardcoded credentials)")
        return False

    # Backup original file
    backup_path = str(file_path) + '.backup'
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(original_content)

    # Add env-loader.js script if not present
    if 'env-loader.js' not in content:
        # Add after supabase CDN script
        content = content.replace(
            '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
            '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n    <script src="env-loader.js"></script>'
        )
        modified = True

    # Pattern 1: Fix SUPABASE_URL declarations
    # Match: const SUPABASE_URL = 'https://vozjwptzutolvkvfpknk.supabase.co';
    pattern1 = rf"const SUPABASE_URL = '{SUPABASE_URL_PRODUCTION}';"
    if pattern1 in content:
        # Add ENV_CONFIG declaration if not present
        if 'const ENV_CONFIG = window.getEnvConfig();' not in content:
            replacement = """const ENV_CONFIG = window.getEnvConfig();
        const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;"""
        else:
            replacement = "const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;"
        content = content.replace(pattern1, replacement)
        modified = True

    # Pattern 2: Fix legacy SUPABASE_URL
    pattern2 = rf"const SUPABASE_URL = '{SUPABASE_URL_LEGACY}';"
    if pattern2 in content:
        if 'const ENV_CONFIG = window.getEnvConfig();' not in content:
            replacement = """const ENV_CONFIG = window.getEnvConfig();
        const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;"""
        else:
            replacement = "const SUPABASE_URL = ENV_CONFIG.SUPABASE_URL;"
        content = content.replace(pattern2, replacement)
        modified = True

    # Pattern 3: Fix SUPABASE_KEY with JWT token
    content = re.sub(
        rf"const SUPABASE_KEY = '{JWT_PATTERN}';",
        "const SUPABASE_KEY = ENV_CONFIG.SUPABASE_ANON_KEY;",
        content
    )

    # Pattern 4: Fix SUPABASE_ANON_KEY with JWT token
    content = re.sub(
        rf"const SUPABASE_ANON_KEY = '{JWT_PATTERN}';",
        "const SUPABASE_ANON_KEY = ENV_CONFIG.SUPABASE_ANON_KEY;",
        content
    )

    # Check if we actually modified content
    if content != original_content:
        modified = True

    if modified:
        # Write fixed content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Fixed: {file_path}")
        return True
    else:
        print(f"  ✓ Skipped (no changes needed)")
        return False

def main():
    """Main function to fix all HTML files"""
    script_dir = Path(__file__).parent
    frontend_dir = script_dir / 'frontend'

    print("=" * 50)
    print("GeoVera Security Fix Script")
    print("=" * 50)
    print()

    if not frontend_dir.exists():
        print(f"ERROR: Frontend directory not found: {frontend_dir}")
        sys.exit(1)

    # Get all HTML files
    html_files = list(frontend_dir.glob('*.html'))

    # Also check root level test file
    test_file = script_dir / 'test-onboarding-flow.html'
    if test_file.exists():
        html_files.append(test_file)

    if not html_files:
        print("No HTML files found!")
        sys.exit(1)

    print(f"Found {len(html_files)} HTML files to process\n")

    # Fix each file
    fixed_count = 0
    for file_path in sorted(html_files):
        if fix_file(file_path):
            fixed_count += 1

    print()
    print("=" * 50)
    print("Summary")
    print("=" * 50)
    print(f"Files processed: {len(html_files)}")
    print(f"Files fixed: {fixed_count}")
    print(f"Files skipped: {len(html_files) - fixed_count}")
    print()
    print("Next steps:")
    print("1. Review changes: git diff")
    print("2. Update .env.local with actual credentials")
    print("3. Test the application")
    print("4. Rotate Supabase anon key in dashboard")
    print("5. Commit changes")
    print()
    print("Backup files saved with .backup extension")
    print("=" * 50)

if __name__ == '__main__':
    main()
