#!/bin/bash
# Open brand intelligence reports from report-html folder

FOLDER="report-html"

echo "🌍 GeoVera Brand Intelligence Reports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if folder exists
if [ ! -d "$FOLDER" ]; then
  echo "❌ Error: $FOLDER folder not found!"
  exit 1
fi

# Count reports
REPORT_COUNT=$(ls -1 "$FOLDER"/*.html 2>/dev/null | wc -l | tr -d ' ')

if [ "$REPORT_COUNT" -eq 0 ]; then
  echo "⚠️  No reports found in $FOLDER/"
  echo ""
  echo "Generate reports first with:"
  echo "  node generate-report-local.js \"Brand Name\" \"Country\""
  exit 1
fi

echo "📊 Found $REPORT_COUNT report(s):"
echo ""

# List reports
i=1
for file in "$FOLDER"/*.html; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    name=$(echo "$filename" | sed 's/-/ /g' | sed 's/.html//' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1')
    filesize=$(ls -lh "$file" | awk '{print $5}')
    echo "  $i. $name ($filesize)"
    i=$((i+1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# If argument provided, open specific report
if [ -n "$1" ]; then
  REPORT_FILE="$FOLDER/$1.html"
  if [ -f "$REPORT_FILE" ]; then
    echo "🌐 Opening: $1"
    open "$REPORT_FILE"
    exit 0
  else
    echo "❌ Report not found: $1"
    echo "Available: $(ls -1 $FOLDER/*.html | sed 's/report-html\///' | sed 's/.html//' | paste -sd ', ' -)"
    exit 1
  fi
fi

# Ask user which report to open
echo "Choose an option:"
echo ""
echo "  [1-$REPORT_COUNT] Open specific report"
echo "  [a] Open all reports"
echo "  [q] Quit"
echo ""
read -p "Your choice: " choice

case "$choice" in
  a|A)
    echo ""
    echo "🌐 Opening all reports..."
    for file in "$FOLDER"/*.html; do
      if [ -f "$file" ]; then
        echo "  Opening: $(basename $file)"
        open "$file"
        sleep 0.5
      fi
    done
    echo ""
    echo "✅ Done!"
    ;;
  q|Q)
    echo "Bye! 👋"
    exit 0
    ;;
  [0-9]*)
    if [ "$choice" -ge 1 ] && [ "$choice" -le "$REPORT_COUNT" ]; then
      file=$(ls -1 "$FOLDER"/*.html | sed -n "${choice}p")
      echo ""
      echo "🌐 Opening: $(basename $file)"
      open "$file"
      echo "✅ Done!"
    else
      echo "❌ Invalid choice: $choice"
      exit 1
    fi
    ;;
  *)
    echo "❌ Invalid choice: $choice"
    exit 1
    ;;
esac
