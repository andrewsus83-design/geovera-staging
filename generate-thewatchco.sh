#!/bin/bash

echo "🚀 Generating TheWatchCo Brand Intelligence Report..."
echo ""
echo "Brand: TheWatchCo"
echo "Country: Indonesia"
echo "Website: https://thewatch.co"
echo ""
echo "This will invoke the deployed Edge Function..."
echo ""

# Call the function via curl (with timeout)
RESPONSE=$(timeout 120 curl -s -X POST \
  "https://vozjwptzutolvkvfpknk.supabase.co/functions/v1/onboarding-workflow" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvenp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzQ0MzcsImV4cCI6MjA0OTk1MDQzN30.J5szSE_x0y7RJX5kGwO15S9b7iNTHrGHZQe3AzKVmms" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_name": "TheWatchCo",
    "country": "Indonesia"
  }')

echo "Response received!"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Report generated successfully!"
    
    # Extract HTML content
    HTML_CONTENT=$(echo "$RESPONSE" | jq -r '.report_html // empty')
    SLUG=$(echo "$RESPONSE" | jq -r '.slug // "thewatchco"')
    
    if [ ! -z "$HTML_CONTENT" ] && [ "$HTML_CONTENT" != "null" ]; then
        # Save to frontend/reports
        echo "$HTML_CONTENT" > "/Users/drew83/Desktop/geovera-staging/frontend/reports/${SLUG}.html"
        echo "✅ Report saved to: frontend/reports/${SLUG}.html"
        echo ""
        echo "🌐 Access URL:"
        echo "   https://geovera-staging.vercel.app/reports/${SLUG}.html"
    else
        echo "⚠️  No HTML content in response"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    fi
else
    echo "❌ Report generation failed!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
fi
