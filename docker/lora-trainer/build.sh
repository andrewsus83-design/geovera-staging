#!/bin/bash
# ─── GeoVera LoRA Trainer — Docker Build & Push Script ────────────────────────
#
# Usage:
#   ./build.sh              → build + push latest
#   ./build.sh --no-push    → build only (no Docker Hub push)
#   ./build.sh --tag v1.2   → build with custom tag
#
# Requires:
#   - Docker installed and running
#   - docker login (already authenticated to Docker Hub as geovera)
#   - NVIDIA Docker runtime (for --platform linux/amd64 GPU builds)
#
# After push, update Vast.ai instances to use: geovera/lora-trainer:latest

set -e

IMAGE_NAME="geovera/lora-trainer"
TAG="latest"
PUSH=true

# Parse args
for arg in "$@"; do
  case $arg in
    --no-push)
      PUSH=false
      ;;
    --tag)
      shift
      TAG="$1"
      ;;
    --tag=*)
      TAG="${arg#*=}"
      ;;
  esac
done

FULL_TAG="${IMAGE_NAME}:${TAG}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " GeoVera LoRA Trainer Docker Build"
echo " Image: ${FULL_TAG}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build — target linux/amd64 (Vast.ai GPU servers are x86_64)
echo ""
echo "→ Building Docker image..."
docker build \
  --platform linux/amd64 \
  --tag "${FULL_TAG}" \
  --file Dockerfile \
  .

echo ""
echo "✓ Build complete: ${FULL_TAG}"

if [ "$PUSH" = true ]; then
  echo ""
  echo "→ Pushing to Docker Hub..."
  docker push "${FULL_TAG}"

  # Also tag as dated version for rollback
  DATED_TAG="${IMAGE_NAME}:$(date +%Y%m%d)"
  docker tag "${FULL_TAG}" "${DATED_TAG}"
  docker push "${DATED_TAG}"

  echo ""
  echo "✓ Pushed:"
  echo "   ${FULL_TAG}"
  echo "   ${DATED_TAG}"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " Done! Next steps:"
  echo " 1. New Vast.ai instances will auto-pull: ${FULL_TAG}"
  echo " 2. In-progress instances are NOT updated (they're already running)"
  echo " 3. To use in train-lora edge function:"
  echo "    image: \"${FULL_TAG}\""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " Built locally only (--no-push). To push:"
  echo "   docker push ${FULL_TAG}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
