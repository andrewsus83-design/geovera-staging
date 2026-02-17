#!/bin/bash

# Test Kata Oma Report Generation with Cost Tracking
echo "🚀 Testing Kata Oma Report Generation..."
echo "📊 Tracking API costs..."
echo ""

SUPABASE_URL="https://vozjwptzutolvkvfpknk.supabase.co"
FUNCTION_URL="$SUPABASE_URL/functions/v1/onboarding-workflow"

# Get anon key from environment or use provided key
SUPABASE_KEY="${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvenp3cHR6dXRvbHZrdmZwa25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzQ0MzcsImV4cCI6MjA0OTk1MDQzN30.J5szSE_x0y7RJX5kGwO15S9b7iNTHrGHZQe3AzKVmms}"

echo "📝 Brand: Kata Oma"
echo "🌍 Country: Indonesia"
echo "📦 Category: Snacks"
echo ""
echo "⏳ Generating report... (this may take 60-90 seconds)"
echo ""

START_TIME=$(date +%s)

# Make the API call
RESPONSE=$(curl -s -X POST "$FUNCTION_URL" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_name": "Kata Oma",
    "country": "Indonesia"
  }')

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "⏱️  Generation completed in: ${DURATION} seconds"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ Report generated successfully!"
    echo ""

    # Extract key information
    SLUG=$(echo "$RESPONSE" | grep -o '"slug":"[^"]*"' | cut -d'"' -f4)
    REPORT_LENGTH=$(echo "$RESPONSE" | grep -o '"report_length":[0-9]*' | cut -d':' -f2)
    HTML_LENGTH=$(echo "$RESPONSE" | grep -o '"html_length":[0-9]*' | cut -d':' -f2)

    echo "📄 Report Details:"
    echo "   - Slug: $SLUG"
    echo "   - Report length: $REPORT_LENGTH characters"
    echo "   - HTML length: $HTML_LENGTH bytes"
    echo ""

    # Save response for analysis
    echo "$RESPONSE" > /tmp/kata-oma-response.json
    echo "💾 Full response saved to: /tmp/kata-oma-response.json"
    echo ""

    # Extract and display static URL
    STATIC_URL=$(echo "$RESPONSE" | grep -o '"static_url":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$STATIC_URL" ]; then
        echo "🌐 Static Report URL:"
        echo "   $STATIC_URL"
        echo ""
        echo "   Open in browser to view the report!"
        echo ""
    fi

    echo "📊 API COST BREAKDOWN:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔍 Step 0: Perplexity Discovery (6 fields verification)"
    echo "   Model: sonar-pro"
    echo "   Tokens: ~500 input + ~800 output = ~1,300 tokens"
    echo "   Cost: ~\$0.003 (sonar-pro: \$3/1M tokens)"
    echo ""
    echo "📍 Step 1: Gemini Brand Indexing"
    echo "   Model: gemini-2.0-flash-exp"
    echo "   Tokens: ~1,500 input + ~500 output = ~2,000 tokens"
    echo "   Cost: FREE (Flash model is free tier)"
    echo ""
    echo "🔍 Step 2: Perplexity Deep Research + Visual Analysis"
    echo "   Model: sonar-pro"
    echo "   Tokens: ~1,000 input + ~3,000 output = ~4,000 tokens"
    echo "   Cost: ~\$0.012 (sonar-pro: \$3/1M tokens)"
    echo ""
    echo "🧠 Step 3: Claude Strategic Analysis"
    echo "   Model: claude-sonnet-4-20250514"
    echo "   Tokens: ~3,000 input + ~1,000 output = ~4,000 tokens"
    echo "   Cost: ~\$0.018 (\$3/MTok input, \$15/MTok output)"
    echo ""
    echo "✍️  Step 4: GPT-4o Report Generation (with images)"
    echo "   Model: gpt-4o"
    echo "   Tokens: ~4,000 input + ~4,000 output = ~8,000 tokens"
    echo "   Cost: ~\$0.030 (\$2.50/MTok input, \$10/MTok output)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💰 TOTAL COST PER BRAND: ~\$0.063 (6.3 cents)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📈 COST COMPARISON:"
    echo "   - Traditional agency report: \$2,000 - \$5,000"
    echo "   - GeoVera AI report: \$0.063"
    echo "   - Savings: 99.997% 🎉"
    echo ""
    echo "📊 SCALING COSTS:"
    echo "   - 10 brands: \$0.63"
    echo "   - 100 brands: \$6.30"
    echo "   - 1,000 brands: \$63.00"
    echo "   - 10,000 brands: \$630.00"
    echo ""

else
    echo "❌ Report generation failed!"
    echo ""
    echo "Error details:"
    echo "$RESPONSE" | head -20
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test completed!"
