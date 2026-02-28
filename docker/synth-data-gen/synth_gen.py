#!/usr/bin/env python3
"""
GeoVera Synthetic Training Data Generator
=========================================
Runs inside a Vast.ai GPU instance.

Pipeline:
  1. Download source images (from ZIP_URL or IMAGE_URLS)
  2. Background removal (BRIA RMBG-2.0)
  3. Multi-view generation (Zero123++ — 6 views per image)
  4. Relighting variations (IC-Light v2 — 2 lighting presets)
  5. Quality filtering (CLIP similarity + blur + brightness)
  6. AI captioning (Google Gemini Vision)
  7. Package as ZIP → upload to Supabase Storage
  8. Trigger train-lora via webhook

Environment variables:
  ZIP_URL          — URL to source images ZIP (or use IMAGE_URLS)
  IMAGE_URLS       — JSON array of image URLs (alternative to ZIP_URL)
  TRIGGER_WORD     — LoRA trigger word (e.g. "GSHOCK_DW5900_WATCH")
  SLUG             — Brand slug (e.g. "twc-gshock-dw5900")
  BRAND_NAME       — Human readable name (e.g. "G-Shock DW-5900BB")
  PRODUCT_TYPE     — Product type (default: "watch")
  SUPABASE_URL     — Supabase project URL
  SUPABASE_KEY     — Supabase service role key
  WEBHOOK_URL      — URL to call when done (triggers train-lora)
  GEMINI_API_KEY   — Google AI API key for captioning
  MAX_SOURCE       — Max source images to process (default: 3)
  TARGET_IMAGES    — Target synthetic image count (default: 15)
  SKIP_RELIGHT     — Set "true" to skip IC-Light (saves VRAM)
  SKIP_MULTIVIEW   — Set "true" to skip Zero123++ (just cleanup + relight)
"""

import os
import sys
import json
import time
import shutil
import zipfile
import logging
import requests
from pathlib import Path

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


def banner(msg: str):
    log.info("=" * 60)
    log.info(f"  {msg}")
    log.info("=" * 60)


# ─── Config from env ──────────────────────────────────────────────────────────

ZIP_URL       = os.environ.get("ZIP_URL", "")
IMAGE_URLS    = json.loads(os.environ.get("IMAGE_URLS", "[]"))
TRIGGER_WORD  = os.environ.get("TRIGGER_WORD", "")
SLUG          = os.environ.get("SLUG", "")
BRAND_NAME    = os.environ.get("BRAND_NAME", "")
PRODUCT_TYPE  = os.environ.get("PRODUCT_TYPE", "watch")
SUPABASE_URL  = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY  = os.environ.get("SUPABASE_KEY", "")
WEBHOOK_URL   = os.environ.get("WEBHOOK_URL", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MAX_SOURCE    = int(os.environ.get("MAX_SOURCE", "3"))
TARGET_IMAGES = int(os.environ.get("TARGET_IMAGES", "15"))
SKIP_RELIGHT  = os.environ.get("SKIP_RELIGHT", "false").lower() == "true"
SKIP_MULTIVIEW = os.environ.get("SKIP_MULTIVIEW", "false").lower() == "true"

# Paths
WORK_DIR      = Path("/tmp/synth_gen")
SOURCE_DIR    = WORK_DIR / "source"
NOBG_DIR      = WORK_DIR / "nobg"
MULTIVIEW_DIR = WORK_DIR / "multiview"
RELIT_DIR     = WORK_DIR / "relit"
FINAL_DIR     = WORK_DIR / "final"
OUTPUT_ZIP    = WORK_DIR / f"{SLUG}_synth_training.zip"


# ─── Utilities ────────────────────────────────────────────────────────────────

def fail(msg: str):
    log.error(f"FAILED: {msg}")
    send_webhook({"success": False, "error": msg, "slug": SLUG})
    sys.exit(1)


def send_webhook(payload: dict):
    if not WEBHOOK_URL:
        log.info("No WEBHOOK_URL set — skipping webhook")
        return
    try:
        r = requests.post(WEBHOOK_URL, json=payload, timeout=30)
        log.info(f"Webhook: {r.status_code}")
    except Exception as e:
        log.warning(f"Webhook failed: {e}")


def download_file(url: str, dest: Path) -> Path:
    """Download file from URL to dest path."""
    r = requests.get(url, stream=True, timeout=120)
    if r.status_code != 200:
        raise Exception(f"HTTP {r.status_code} downloading {url}")
    with open(dest, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    return dest


def get_image_files(directory: Path) -> list:
    """Get all image files from directory."""
    exts = ["*.jpg", "*.jpeg", "*.png", "*.webp"]
    files = []
    for ext in exts:
        files.extend(directory.glob(ext))
    return sorted(files)


# ─── Validate ─────────────────────────────────────────────────────────────────

if not all([TRIGGER_WORD, SLUG, SUPABASE_URL, SUPABASE_KEY]):
    fail("Missing required env vars: TRIGGER_WORD, SLUG, SUPABASE_URL, SUPABASE_KEY")

if not ZIP_URL and not IMAGE_URLS:
    fail("Must provide ZIP_URL or IMAGE_URLS")

if not BRAND_NAME:
    BRAND_NAME = SLUG.replace("-", " ").replace("_", " ").title()

banner(f"GeoVera Synthetic Data Generator")
log.info(f"  Slug:         {SLUG}")
log.info(f"  Trigger word: {TRIGGER_WORD}")
log.info(f"  Brand name:   {BRAND_NAME}")
log.info(f"  Product type: {PRODUCT_TYPE}")
log.info(f"  Target imgs:  {TARGET_IMAGES}")
log.info(f"  Skip relight: {SKIP_RELIGHT}")
log.info(f"  Skip multiview: {SKIP_MULTIVIEW}")
log.info(f"  Gemini:       {'yes' if GEMINI_API_KEY else 'no (template captions)'}")

start_time = time.time()

# Setup directories
for d in [WORK_DIR, SOURCE_DIR, NOBG_DIR, MULTIVIEW_DIR, RELIT_DIR, FINAL_DIR]:
    d.mkdir(parents=True, exist_ok=True)


# ─── Stage 0: Download source images ──────────────────────────────────────────

banner("Stage 0: Download Source Images")

if ZIP_URL:
    log.info(f"Downloading ZIP: {ZIP_URL}")
    zip_path = WORK_DIR / "source.zip"
    download_file(ZIP_URL, zip_path)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(SOURCE_DIR)
    log.info(f"ZIP extracted to {SOURCE_DIR}")

elif IMAGE_URLS:
    log.info(f"Downloading {len(IMAGE_URLS)} individual images")
    for i, url in enumerate(IMAGE_URLS[:MAX_SOURCE * 3]):
        ext = url.split("?")[0].rsplit(".", 1)[-1].lower()
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            ext = "jpg"
        dest = SOURCE_DIR / f"source_{i:03d}.{ext}"
        try:
            download_file(url, dest)
            log.info(f"  [{i+1}] Downloaded: {dest.name}")
        except Exception as e:
            log.warning(f"  [{i+1}] Failed: {e}")

# Flatten nested dirs
for img in SOURCE_DIR.rglob("*.jpg"):
    if img.parent != SOURCE_DIR:
        shutil.move(str(img), str(SOURCE_DIR / img.name))
for img in SOURCE_DIR.rglob("*.png"):
    if img.parent != SOURCE_DIR:
        shutil.move(str(img), str(SOURCE_DIR / img.name))

source_images = get_image_files(SOURCE_DIR)[:MAX_SOURCE]

if not source_images:
    fail("No source images found after download")

log.info(f"Source images: {len(source_images)}")
for img in source_images:
    log.info(f"  {img.name} ({img.stat().st_size // 1024}KB)")


# ─── Stage 1: Background Removal ──────────────────────────────────────────────

banner("Stage 1: Background Removal (BRIA RMBG-2.0)")

try:
    from stages.background_removal import batch_remove_backgrounds

    nobg_images = batch_remove_backgrounds(
        input_dir=SOURCE_DIR,
        output_dir=NOBG_DIR,
        white_background=True,  # White BG for Zero123++ compatibility
    )
    log.info(f"Background removed: {len(nobg_images)} images")
except Exception as e:
    log.warning(f"Background removal failed: {e}. Using source images as-is.")
    # Fallback: copy source images directly
    nobg_images = []
    for img in source_images:
        dest = NOBG_DIR / img.name
        shutil.copy2(str(img), str(dest))
        nobg_images.append(dest)

if not nobg_images:
    fail("No images after background removal")


# ─── Stage 2: Multi-View Generation ───────────────────────────────────────────

if not SKIP_MULTIVIEW:
    banner("Stage 2: Multi-View Generation (Zero123++)")

    try:
        from stages.multiview_generation import batch_generate_multiview, load_zero123plus

        pipeline = load_zero123plus()
        multiview_images = batch_generate_multiview(
            input_dir=NOBG_DIR,
            output_dir=MULTIVIEW_DIR,
            pipeline=pipeline,
            max_source_images=MAX_SOURCE,
        )

        # Free GPU memory after multiview
        del pipeline
        import torch
        torch.cuda.empty_cache()

        log.info(f"Multi-view generated: {len(multiview_images)} images")

    except Exception as e:
        log.warning(f"Multi-view generation failed: {e}. Using original images.")
        multiview_images = []
        for img in nobg_images:
            dest = MULTIVIEW_DIR / img.name
            shutil.copy2(str(img), str(dest))
            multiview_images.append(dest)
else:
    log.info("Skipping multi-view generation (SKIP_MULTIVIEW=true)")
    multiview_images = []
    for img in nobg_images:
        dest = MULTIVIEW_DIR / img.name
        shutil.copy2(str(img), str(dest))
        multiview_images.append(dest)

if not multiview_images:
    fail("No images after multi-view stage")

log.info(f"Multi-view stage output: {len(multiview_images)} images")


# ─── Stage 3: Relighting ──────────────────────────────────────────────────────

if not SKIP_RELIGHT:
    banner("Stage 3: Relighting (IC-Light v2)")

    try:
        from stages.relighting import batch_relight

        relit_images = batch_relight(
            input_dir=MULTIVIEW_DIR,
            output_dir=RELIT_DIR,
            max_images=len(multiview_images),
        )

        import torch
        torch.cuda.empty_cache()

        log.info(f"Relit images: {len(relit_images)}")

    except Exception as e:
        log.warning(f"Relighting failed: {e}. Using multiview images directly.")
        relit_images = []
        for img in multiview_images:
            dest = RELIT_DIR / img.name
            shutil.copy2(str(img), str(dest))
            relit_images.append(dest)
else:
    log.info("Skipping relighting (SKIP_RELIGHT=true)")
    relit_images = []
    for img in multiview_images:
        dest = RELIT_DIR / img.name
        shutil.copy2(str(img), str(dest))
        relit_images.append(dest)

log.info(f"Relight stage output: {len(relit_images)} images")


# ─── Stage 4: Quality Filtering ───────────────────────────────────────────────

banner("Stage 4: Quality Filtering (CLIP)")

try:
    from stages.quality_filter import filter_images, load_clip

    clip_model, clip_preprocess, _, device = load_clip()

    selected_images, quality_report = filter_images(
        candidate_paths=relit_images,
        source_paths=source_images,
        clip_model=clip_model,
        clip_preprocess=clip_preprocess,
        device=device,
        target_count=TARGET_IMAGES,
        min_count=8,
    )

    del clip_model
    import torch
    torch.cuda.empty_cache()

    log.info(f"Quality filter: {quality_report['selected']}/{quality_report['candidates']} selected")

except Exception as e:
    log.warning(f"Quality filtering failed: {e}. Using all relit images.")
    selected_images = relit_images[:TARGET_IMAGES]
    quality_report = {"candidates": len(relit_images), "selected": len(selected_images)}


# ─── Stage 5: AI Captioning (Gemini Vision) ───────────────────────────────────

banner("Stage 5: AI Captioning (Google Gemini Vision)")

from stages.captioning import caption_all_images

captioned_images = caption_all_images(
    image_paths=selected_images,
    trigger_word=TRIGGER_WORD,
    brand_name=BRAND_NAME,
    product_type=PRODUCT_TYPE,
    gemini_api_key=GEMINI_API_KEY if GEMINI_API_KEY else None,
    output_dir=FINAL_DIR,
)

log.info(f"Captioned: {len(captioned_images)} images")


# ─── Stage 6: Package as ZIP ──────────────────────────────────────────────────

banner("Stage 6: Package Training Data")

final_images = get_image_files(FINAL_DIR)
final_captions = list(FINAL_DIR.glob("*.txt"))

log.info(f"Final training data: {len(final_images)} images + {len(final_captions)} captions")

if len(final_images) < 3:
    fail(f"Too few final images: {len(final_images)} (need ≥3)")

with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as zf:
    for img_path in final_images:
        zf.write(img_path, img_path.name)
    for cap_path in final_captions:
        zf.write(cap_path, cap_path.name)

zip_size = OUTPUT_ZIP.stat().st_size
log.info(f"ZIP created: {OUTPUT_ZIP} ({zip_size // 1024}KB, {len(final_images)} images)")


# ─── Stage 7: Upload to Supabase Storage ──────────────────────────────────────

banner("Stage 7: Upload to Supabase Storage")

zip_storage_path = f"synth-training-data/{SLUG}_synth.zip"
zip_upload_url = f"{SUPABASE_URL}/storage/v1/object/report-images/{zip_storage_path}"
zip_public_url = f"{SUPABASE_URL}/storage/v1/object/public/report-images/{zip_storage_path}"

log.info(f"Uploading to: {zip_storage_path}")

with open(OUTPUT_ZIP, "rb") as f:
    upload_resp = requests.post(
        zip_upload_url,
        data=f,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/zip",
            "x-upsert": "true",
        },
        timeout=120,
    )

if upload_resp.status_code not in (200, 201):
    fail(f"Upload failed: HTTP {upload_resp.status_code} — {upload_resp.text}")

log.info(f"ZIP uploaded: {zip_public_url}")


# ─── Stage 8: Trigger LoRA Training ───────────────────────────────────────────

banner("Stage 8: Trigger LoRA Training")

elapsed = time.time() - start_time

success_payload = {
    "success": True,
    "slug": SLUG,
    "trigger_word": TRIGGER_WORD,
    "brand_name": BRAND_NAME,
    "synth_zip_url": zip_public_url,
    "images_generated": len(final_images),
    "quality_report": quality_report,
    "pipeline_duration_seconds": int(elapsed),
    "source_images": len(source_images),
    "pipeline": "geovera-synth-data-gen",
}

log.info(f"Sending success webhook to train-lora...")
send_webhook(success_payload)

banner("SUCCESS")
log.info(f"  Slug:          {SLUG}")
log.info(f"  Trigger word:  {TRIGGER_WORD}")
log.info(f"  Synth ZIP URL: {zip_public_url}")
log.info(f"  Images:        {len(final_images)}")
log.info(f"  Duration:      {elapsed:.0f}s")
log.info("=" * 60)

sys.exit(0)
