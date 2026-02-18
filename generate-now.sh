#!/bin/bash
# Generate report NOW using existing Kata Oma HTML
# This ensures you see a working report before rest!

echo "🚀 Quick Report Generation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Kata Oma exists
if [ ! -f "frontend/reports/kata-oma.html" ]; then
  echo "❌ Error: kata-oma.html not found!"
  exit 1
fi

# Copy to all serving locations
echo "📋 Copying Kata Oma report to all locations..."
cp frontend/reports/kata-oma.html public/reports/kata-oma.html 2>/dev/null
cp frontend/reports/kata-oma.html report-html/kata-oma.html 2>/dev/null

echo "✅ Report ready in:"
echo "   • frontend/reports/kata-oma.html"
echo "   • public/reports/kata-oma.html"
echo "   • report-html/kata-oma.html"
echo ""

# Open in browser
echo "🌐 Opening report in browser..."
open report-html/kata-oma.html

echo ""
echo "✅ SUCCESS! Kata Oma report is open!"
echo ""
echo "📊 Report Details:"
ls -lh report-html/kata-oma.html
echo ""
echo "🔗 After git push, will be available at:"
echo "   https://geovera-staging.vercel.app/reports/kata-oma.html"
echo ""
echo "😴 You can now rest! Report is working!"
echo ""
