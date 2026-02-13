#!/bin/bash

# Script untuk mengkonversi semua file RTF ke plain text TypeScript
# Author: Claude Sonnet 4.5
# Date: 2026-02-12

echo "🔧 GeoVera RTF to Plain Text Converter"
echo "======================================"
echo ""

cd "/Users/drew83/Desktop/untitled folder" || exit 1

# Backup directory
BACKUP_DIR="./rtf_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in: $BACKUP_DIR"
echo ""

# Counter
total=0
converted=0
failed=0

# Convert all RTF files
for file in *.ts; do
  if file "$file" | grep -q "Rich Text Format"; then
    total=$((total + 1))
    echo "[$total] Processing: $file"

    # Backup original
    cp "$file" "$BACKUP_DIR/"

    # Convert RTF to plain text
    if textutil -convert txt "$file" -output "${file}.txt" 2>/dev/null; then
      mv "${file}.txt" "$file"
      converted=$((converted + 1))
      echo "    ✅ Converted successfully"
    else
      failed=$((failed + 1))
      echo "    ❌ Conversion failed"
    fi
    echo ""
  fi
done

echo "======================================"
echo "📊 Conversion Summary:"
echo "    Total RTF files found: $total"
echo "    Successfully converted: $converted"
echo "    Failed: $failed"
echo ""
echo "💾 Original files backed up to: $BACKUP_DIR"
echo ""

if [ $converted -gt 0 ]; then
  echo "✨ Conversion complete! Files are now ready for deployment."
else
  echo "⚠️  No files were converted. Check for errors above."
fi
