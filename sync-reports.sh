#!/bin/bash
# Sync reports from Supabase Storage → local report-html/ folder
# Usage: ./sync-reports.sh [slug]
#   No args: list available reports
#   With slug: download specific report (e.g. ./sync-reports.sh aquviva)
#   "all": download all reports (requires supabase CLI)

SUPABASE_URL="https://vozjwptzutolvkvfpknk.supabase.co"
STORAGE_BASE="${SUPABASE_URL}/storage/v1/object/public/reports/report-html"
LOCAL_DIR="$(dirname "$0")/report-html"

slug="$1"

download_report() {
  local s="$1"
  local url="${STORAGE_BASE}/${s}.html"
  local dest="${LOCAL_DIR}/${s}.html"

  echo "Downloading ${s}..."
  http_code=$(curl -s -o "$dest" -w "%{http_code}" "$url")

  if [ "$http_code" = "200" ]; then
    size=$(ls -lh "$dest" | awk '{print $5}')
    echo "  ✓ Saved to report-html/${s}.html (${size})"
  else
    rm -f "$dest"
    echo "  ✗ Not found in storage (HTTP ${http_code})"
    return 1
  fi
}

if [ -z "$slug" ]; then
  echo "Usage:"
  echo "  ./sync-reports.sh <slug>     Download one report"
  echo "  ./sync-reports.sh all        Download all reports from storage"
  echo ""
  echo "Local reports in report-html/:"
  ls "${LOCAL_DIR}"/*.html 2>/dev/null | xargs -I{} basename {} .html | sed 's/^/  /'
  exit 0
fi

if [ "$slug" = "all" ]; then
  # Use supabase CLI to list files in storage bucket subfolder
  if ! command -v supabase &>/dev/null; then
    echo "supabase CLI not found — specify a slug manually"
    exit 1
  fi

  echo "Listing reports in storage..."
  slugs=$(supabase storage ls ss:///reports/report-html --project-ref vozjwptzutolvkvfpknk 2>/dev/null \
    | grep '\.html$' | sed 's/\.html$//')

  if [ -z "$slugs" ]; then
    echo "No reports found in storage (or CLI error)"
    exit 1
  fi

  success=0
  for s in $slugs; do
    download_report "$s" && ((success++))
  done
  echo ""
  echo "Done — ${success} report(s) synced to report-html/"
else
  download_report "$slug"
fi
