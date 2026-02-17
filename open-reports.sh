#!/bin/bash
# Open reports directly in browser

echo "🌐 Opening reports in default browser..."
echo ""

for file in frontend/reports/*.html; do
  if [ -f "$file" ]; then
    echo "Opening: $file"
    open "$file"
    sleep 1
  fi
done

echo ""
echo "✅ All reports opened!"
