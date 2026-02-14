#!/bin/bash
# Inject environment variables as meta tags into HTML files

SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_KEY="${VITE_SUPABASE_ANON_KEY}"
APP_URL="${VITE_APP_URL}"

echo "Injecting environment variables..."
echo "SUPABASE_URL: ${SUPABASE_URL:0:30}..."
echo "SUPABASE_KEY: ${SUPABASE_KEY:0:30}..."
echo "APP_URL: ${APP_URL}"

# Find all HTML files and inject meta tags
for file in *.html; do
  if [ -f "$file" ]; then
    # Check if meta tags already exist
    if ! grep -q 'name="supabase-url"' "$file"; then
      # Insert meta tags after <head>
      sed -i '' "/<head>/a\\
    <meta name=\"supabase-url\" content=\"${SUPABASE_URL}\">\\
    <meta name=\"supabase-anon-key\" content=\"${SUPABASE_KEY}\">\\
    <meta name=\"app-url\" content=\"${APP_URL}\">
" "$file"
      echo "Injected env into $file"
    fi
  fi
done

echo "Environment injection complete!"
