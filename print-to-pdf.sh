#!/bin/bash

# Print HTML to PDF using macOS built-in tools
HTML_FILE="/Users/drew83/Desktop/geovera-staging/AQUVIVA_ONBOARDING_REPORT.html"
PDF_FILE="/Users/drew83/Desktop/geovera-staging/AQUVIVA_ONBOARDING_REPORT.pdf"

echo "🖨️  Printing HTML to PDF..."
echo "Source: $HTML_FILE"
echo "Output: $PDF_FILE"
echo ""

# Method 1: Try using wkhtmltopdf if available
if command -v wkhtmltopdf &> /dev/null; then
    echo "Using wkhtmltopdf..."
    wkhtmltopdf --enable-local-file-access \
                --page-size A4 \
                --margin-top 20mm \
                --margin-bottom 20mm \
                --margin-left 20mm \
                --margin-right 20mm \
                "$HTML_FILE" "$PDF_FILE"
    exit 0
fi

# Method 2: Use Safari via AppleScript
echo "Using Safari and AppleScript to print to PDF..."

osascript <<EOF
tell application "Safari"
    activate
    open POSIX file "$HTML_FILE"
    delay 2

    tell application "System Events"
        keystroke "p" using command down
        delay 1
        keystroke "p" using command down
        delay 1

        -- Navigate to save location
        keystroke "g" using {command down, shift down}
        delay 0.5
        keystroke "/Users/drew83/Desktop/geovera-staging/"
        delay 0.5
        key code 36 -- Return key
        delay 0.5

        -- Enter filename
        keystroke "AQUVIVA_ONBOARDING_REPORT"
        delay 0.5

        -- Click Save
        key code 36 -- Return key
    end tell

    delay 2
    quit
end tell
EOF

if [ -f "$PDF_FILE" ]; then
    echo "✅ PDF created successfully!"
    ls -lh "$PDF_FILE"
else
    echo "❌ PDF creation failed. Please print manually:"
    echo "   1. Open: $HTML_FILE"
    echo "   2. Press Cmd+P"
    echo "   3. Select 'Save as PDF'"
    echo "   4. Save to: $PDF_FILE"
fi
