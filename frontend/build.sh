#!/bin/bash
set -e

echo "=== GeoVera Intelligence Platform - Build Script ==="
echo "Injecting environment variables..."

# Inject environment variables into HTML files
./inject-env.sh

echo "Build complete!"
