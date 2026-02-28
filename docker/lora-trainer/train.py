#!/usr/bin/env python3
"""
GeoVera LoRA Trainer — runs inside Vast.ai GPU instance

Environment variables (set by Vast.ai when spinning up instance):
  ZIP_URL          — public URL to training images zip in Supabase Storage
  TRIGGER_WORD     — e.g. "AQUVIVA_PRODUCT"
  SLUG             — e.g. "aquviva"
  SUPABASE_URL     — e.g. "https://vozjwptzutolvkvfpknk.supabase.co"
  SUPABASE_KEY     — Supabase service role key (for storage upload)
  WEBHOOK_URL      — optional: edge fn URL to call when training completes
  HF_TOKEN         — HuggingFace token (for FLUX.1-dev download)
  STEPS            — training steps override (default: from config_override.json or 1500)

Dataset ZIP structure (created by generate-synthetic-data):
  real_01.jpg / real_01.txt      ← real product images + AI captions
  synth_01.png / synth_01.txt    ← synthetic images + prompts as captions
  dataset_metadata.json          ← metadata about dataset
  config_override.json           ← AI-optimized LoRA config (rank, steps, lr, etc.)

On success:
  - Uploads LoRA weights to: report-images/lora-models/{SLUG}/pytorch_lora_weights.safetensors
  - Uploads metadata to:     report-images/lora-models/{SLUG}/metadata.json
  - POSTs to WEBHOOK_URL with result JSON
  - Exits 0

On failure:
  - POSTs to WEBHOOK_URL with error JSON
  - Exits 1
"""

import os
import sys
import json
import time
import shutil
import zipfile
import requests
import subprocess
import re
from pathlib import Path

# ─── Config from env ──────────────────────────────────────────────────────────

ZIP_URL       = os.environ.get("ZIP_URL", "")
TRIGGER_WORD  = os.environ.get("TRIGGER_WORD", "")
SLUG          = os.environ.get("SLUG", "")
SUPABASE_URL  = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY  = os.environ.get("SUPABASE_KEY", "")
WEBHOOK_URL   = os.environ.get("WEBHOOK_URL", "")
HF_TOKEN      = os.environ.get("HF_TOKEN", "")
STEPS_OVERRIDE = int(os.environ.get("STEPS", "0"))  # 0 = use config_override.json value

# Paths
WORK_DIR      = Path("/tmp/training")
IMAGES_DIR    = WORK_DIR / "images"
OUTPUT_DIR    = WORK_DIR / "output"
CONFIG_PATH   = WORK_DIR / "config.yaml"

def log(msg):
    print(f"[GeoVera Trainer] {msg}", flush=True)

def send_webhook(payload: dict):
    if not WEBHOOK_URL:
        return
    try:
        r = requests.post(WEBHOOK_URL, json=payload, timeout=30)
        log(f"Webhook sent: {r.status_code}")
    except Exception as e:
        log(f"Webhook failed: {e}")

def fail(msg: str):
    log(f"FAILED: {msg}")
    send_webhook({"success": False, "error": msg, "slug": SLUG, "trigger_word": TRIGGER_WORD})
    sys.exit(1)

# ─── Validate inputs ──────────────────────────────────────────────────────────

if not all([ZIP_URL, TRIGGER_WORD, SLUG, SUPABASE_URL, SUPABASE_KEY]):
    fail("Missing required env vars: ZIP_URL, TRIGGER_WORD, SLUG, SUPABASE_URL, SUPABASE_KEY")

log(f"Starting training: slug={SLUG}, trigger={TRIGGER_WORD}")

# ─── Setup workspace ──────────────────────────────────────────────────────────

WORK_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ─── Download & extract training images ───────────────────────────────────────

log(f"Downloading training images from: {ZIP_URL}")
zip_path = WORK_DIR / "training.zip"

r = requests.get(ZIP_URL, stream=True, timeout=120)
if r.status_code != 200:
    fail(f"Failed to download zip: HTTP {r.status_code}")

with open(zip_path, "wb") as f:
    for chunk in r.iter_content(chunk_size=8192):
        f.write(chunk)

log(f"Zip downloaded: {zip_path.stat().st_size} bytes")

# ─── Extract ZIP contents ─────────────────────────────────────────────────────

with zipfile.ZipFile(zip_path, "r") as zf:
    zf.extractall(WORK_DIR / "zip_extracted")

zip_extracted = WORK_DIR / "zip_extracted"

# ─── Read config_override.json (AI-optimized training config) ─────────────────

config_override = {}
config_override_path = zip_extracted / "config_override.json"

if config_override_path.exists():
    try:
        with open(config_override_path, "r") as f:
            config_override = json.load(f)
        log(f"Loaded config_override.json: {json.dumps(config_override)}")
    except Exception as e:
        log(f"WARNING: Failed to parse config_override.json: {e}. Using defaults.")
else:
    log("No config_override.json in ZIP — using default training config")

# ─── Read dataset_metadata.json ───────────────────────────────────────────────

dataset_meta = {}
dataset_meta_path = zip_extracted / "dataset_metadata.json"

if dataset_meta_path.exists():
    try:
        with open(dataset_meta_path, "r") as f:
            dataset_meta = json.load(f)
        log(f"Dataset metadata: {dataset_meta.get('total_images', '?')} images, "
            f"brand={dataset_meta.get('brand_name', SLUG)}")
    except Exception as e:
        log(f"WARNING: Failed to parse dataset_metadata.json: {e}")

# ─── Copy images and captions to IMAGES_DIR ───────────────────────────────────

# The ZIP contains: real_XX.jpg + real_XX.txt + synth_XX.png + synth_XX.txt
# All caption files (*.txt) were created by the AI pipeline — DO NOT overwrite them
# Just move all image files + their txt captions to IMAGES_DIR

image_extensions = {".jpg", ".jpeg", ".png", ".webp"}
images_copied = 0
captions_copied = 0
has_ai_captions = False

for file_path in zip_extracted.iterdir():
    if file_path.suffix.lower() in image_extensions:
        dest = IMAGES_DIR / file_path.name
        shutil.copy2(str(file_path), str(dest))
        images_copied += 1

        # Copy matching caption file if it exists
        caption_src = file_path.with_suffix(".txt")
        if caption_src.exists():
            caption_dest = IMAGES_DIR / caption_src.name
            shutil.copy2(str(caption_src), str(caption_dest))
            captions_copied += 1
            has_ai_captions = True

# Handle nested folder structure (just in case)
for file_path in zip_extracted.rglob("*"):
    if file_path.suffix.lower() in image_extensions and file_path.parent != zip_extracted:
        dest = IMAGES_DIR / file_path.name
        if not dest.exists():
            shutil.copy2(str(file_path), str(dest))
            images_copied += 1
            caption_src = file_path.with_suffix(".txt")
            if caption_src.exists():
                caption_dest = IMAGES_DIR / caption_src.name
                if not caption_dest.exists():
                    shutil.copy2(str(caption_src), str(caption_dest))
                    captions_copied += 1
                    has_ai_captions = True

log(f"Copied {images_copied} images, {captions_copied} AI captions to training dir")

image_files = list(IMAGES_DIR.glob("*.jpg")) + \
              list(IMAGES_DIR.glob("*.jpeg")) + \
              list(IMAGES_DIR.glob("*.png")) + \
              list(IMAGES_DIR.glob("*.webp"))

if len(image_files) < 3:
    fail(f"Not enough images after extraction: found {len(image_files)}, need at least 3")

log(f"Total training images: {len(image_files)}")

# ─── Generate fallback captions for images WITHOUT txt files ──────────────────
# This handles old-format ZIPs that don't have AI-generated captions

ANGLE_HINTS = [
    "front view, white background, studio lighting",
    "back view, white background, studio lighting",
    "side view, 45 degree angle, studio lighting",
    "close-up dial detail, macro photography",
    "close-up clasp and bracelet detail",
    "worn on wrist, lifestyle photography",
    "flat lay, overhead view, minimalist background",
    "three quarter view, product photography",
    "detail shot, texture close-up",
    "packaged in box, unboxing style",
    "side profile, clean background",
    "angled top view, dramatic lighting",
]
BRAND_NAME = dataset_meta.get("brand_name", SLUG.replace("-", " ").replace("_", " ").title())

fallback_captions_generated = 0
for idx, img_path in enumerate(image_files):
    caption_path = img_path.with_suffix(".txt")
    if not caption_path.exists():
        # No AI caption — generate fallback
        angle = ANGLE_HINTS[idx % len(ANGLE_HINTS)]
        caption = f"{TRIGGER_WORD}, {BRAND_NAME}, {angle}, high quality product photo, commercial photography"
        caption_path.write_text(caption)
        fallback_captions_generated += 1

if fallback_captions_generated > 0:
    log(f"Generated {fallback_captions_generated} fallback captions (no AI captions found for these images)")
else:
    log("All images have AI-generated captions ✓")

# ─── Determine training hyperparams from config_override.json ─────────────────

# Priority: env STEPS override > config_override.json > default
FINAL_STEPS         = STEPS_OVERRIDE or config_override.get("steps", 1500)
FINAL_RANK          = config_override.get("rank", 32)
FINAL_ALPHA         = config_override.get("alpha", FINAL_RANK)  # alpha = rank by default
FINAL_LR            = config_override.get("lr", 0.0003)
FINAL_CAPTION_DROP  = config_override.get("caption_dropout", 0.05)
FINAL_BATCH_SIZE    = config_override.get("batch_size", 1)
FINAL_GRAD_ACCUM    = config_override.get("gradient_accumulation_steps", 1)

log(f"Training hyperparams:")
log(f"  steps:              {FINAL_STEPS}")
log(f"  rank (linear):      {FINAL_RANK}")
log(f"  alpha (linear_alpha): {FINAL_ALPHA}")
log(f"  lr:                 {FINAL_LR}")
log(f"  caption_dropout:    {FINAL_CAPTION_DROP}")
log(f"  batch_size:         {FINAL_BATCH_SIZE}")
log(f"  gradient_accum:     {FINAL_GRAD_ACCUM}")
log(f"  source: {'env override' if STEPS_OVERRIDE else ('config_override.json' if config_override else 'defaults')}")

# ─── Build ai-toolkit config ──────────────────────────────────────────────────

# Config template search order:
# 1. /tmp/config_template.yaml  — injected by onstart script
# 2. /app/config_template.yaml  — custom Docker image (geovera/lora-trainer)
# 3. Same directory as train.py

_config_locations = [
    "/tmp/config_template.yaml",
    "/app/config_template.yaml",
    str(Path(__file__).parent / "config_template.yaml"),
]
_config_path = next((p for p in _config_locations if Path(p).exists()), None)
if not _config_path:
    fail(f"config_template.yaml not found in any of: {_config_locations}")

log(f"Using config template: {_config_path}")
with open(_config_path, "r") as f:
    config_content = f.read()

# Replace template variables
config_content = config_content.replace("{TRIGGER_WORD}", TRIGGER_WORD)
config_content = config_content.replace("{OUTPUT_DIR}", str(OUTPUT_DIR))
config_content = config_content.replace("{IMAGES_DIR}", str(IMAGES_DIR))

# Apply config_override.json hyperparams
config_content = re.sub(r'steps:\s*\d+', f'steps: {FINAL_STEPS}', config_content)
config_content = re.sub(r'linear:\s*\d+', f'linear: {FINAL_RANK}', config_content)
config_content = re.sub(r'linear_alpha:\s*\d+', f'linear_alpha: {FINAL_ALPHA}', config_content)
config_content = re.sub(r'lr:\s*[\d.]+', f'lr: {FINAL_LR}', config_content)
config_content = re.sub(r'caption_dropout_rate:\s*[\d.]+', f'caption_dropout_rate: {FINAL_CAPTION_DROP}', config_content)
config_content = re.sub(r'batch_size:\s*\d+', f'batch_size: {FINAL_BATCH_SIZE}', config_content)
config_content = re.sub(r'gradient_accumulation_steps:\s*\d+', f'gradient_accumulation_steps: {FINAL_GRAD_ACCUM}', config_content)

with open(CONFIG_PATH, "w") as f:
    f.write(config_content)

log(f"Training config written to: {CONFIG_PATH}")

# ─── Set HuggingFace token ────────────────────────────────────────────────────

if HF_TOKEN:
    os.environ["HF_TOKEN"] = HF_TOKEN
    os.environ["HUGGINGFACE_HUB_TOKEN"] = HF_TOKEN
    log("HuggingFace token set")
else:
    log("WARNING: No HF_TOKEN set — FLUX.1-dev download may fail if not cached")

# ─── Run ai-toolkit training ──────────────────────────────────────────────────

log(f"Starting ai-toolkit training with {FINAL_STEPS} steps...")
training_start = time.time()

# Find ai-toolkit run.py (different paths for different Docker images)
_ai_toolkit_locations = [
    os.environ.get("AI_TOOLKIT_PATH", ""),   # Set by onstart script
    "/workspace/ai-toolkit",                  # ostris/aitoolkit image
    "/app/ai-toolkit",                        # geovera/lora-trainer custom image
    "/root/ai-toolkit",
    "/ai-toolkit",
]
_ai_toolkit_dir = next((p for p in _ai_toolkit_locations if p and Path(p, "run.py").exists()), None)
if not _ai_toolkit_dir:
    fail("ai-toolkit run.py not found. Check AI_TOOLKIT_PATH env var or image setup.")

log(f"Using ai-toolkit at: {_ai_toolkit_dir}")

result = subprocess.run(
    ["python3", str(Path(_ai_toolkit_dir) / "run.py"), str(CONFIG_PATH)],
    cwd=_ai_toolkit_dir,
    capture_output=False,  # Stream output to terminal for visibility
    timeout=3600,           # 1 hour max
)

training_duration = time.time() - training_start
log(f"Training completed in {training_duration:.0f}s (exit code: {result.returncode})")

if result.returncode != 0:
    fail(f"ai-toolkit training failed with exit code {result.returncode}")

# ─── Find output weights ──────────────────────────────────────────────────────

# ai-toolkit saves to: {OUTPUT_DIR}/{name}/...
safetensors_files = list(OUTPUT_DIR.rglob("*.safetensors"))

if not safetensors_files:
    fail("No .safetensors output found after training")

# Pick the final/best weights (not intermediate checkpoints)
# ai-toolkit names the final output as {trigger_word}_lora.safetensors
final_weights = None
for f in safetensors_files:
    if "step" not in f.name.lower():
        final_weights = f
        break

if not final_weights:
    # Fallback: pick the last one
    final_weights = sorted(safetensors_files, key=lambda f: f.stat().st_mtime)[-1]

log(f"Found weights: {final_weights} ({final_weights.stat().st_size} bytes)")

# ─── Upload weights to Supabase Storage ───────────────────────────────────────

weights_storage_path = f"lora-models/{SLUG}/pytorch_lora_weights.safetensors"
weights_upload_url = f"{SUPABASE_URL}/storage/v1/object/report-images/{weights_storage_path}"
weights_public_url = f"{SUPABASE_URL}/storage/v1/object/public/report-images/{weights_storage_path}"

log(f"Uploading weights to Supabase: {weights_storage_path}")

with open(final_weights, "rb") as wf:
    upload_response = requests.post(
        weights_upload_url,
        data=wf,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/octet-stream",
            "x-upsert": "true",
        },
        timeout=300,
    )

if upload_response.status_code not in (200, 201):
    fail(f"Failed to upload weights: HTTP {upload_response.status_code} — {upload_response.text}")

log(f"Weights uploaded successfully: {weights_public_url}")

# ─── Upload metadata JSON ─────────────────────────────────────────────────────

metadata = {
    "slug": SLUG,
    "trigger_word": TRIGGER_WORD,
    "lora_weights_url": weights_public_url,
    "lora_config_url": None,
    "trained_at": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
    "model": "ostris/ai-toolkit (FLUX.1-dev)",
    "training_platform": "vast.ai",
    # Actual hyperparams used
    "steps": FINAL_STEPS,
    "rank": FINAL_RANK,
    "lr": FINAL_LR,
    "caption_dropout": FINAL_CAPTION_DROP,
    # Dataset info
    "images_used": len(image_files),
    "ai_captions_used": has_ai_captions,
    "real_images": dataset_meta.get("real_images", 0),
    "synthetic_images": dataset_meta.get("synthetic_images", 0),
    "config_override_applied": bool(config_override),
    # Timing
    "training_duration_seconds": int(training_duration),
    "status": "ready",
}

metadata_storage_path = f"lora-models/{SLUG}/metadata.json"
metadata_upload_url = f"{SUPABASE_URL}/storage/v1/object/report-images/{metadata_storage_path}"

meta_response = requests.post(
    metadata_upload_url,
    data=json.dumps(metadata).encode("utf-8"),
    headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "x-upsert": "true",
    },
    timeout=30,
)

if meta_response.status_code not in (200, 201):
    log(f"WARNING: Failed to upload metadata: {meta_response.status_code}")
else:
    log("Metadata uploaded successfully")

# ─── Send success webhook ─────────────────────────────────────────────────────

success_payload = {
    "success": True,
    "slug": SLUG,
    "trigger_word": TRIGGER_WORD,
    "lora_weights_url": weights_public_url,
    "images_used": len(image_files),
    "training_duration_seconds": int(training_duration),
    "steps": FINAL_STEPS,
    "rank": FINAL_RANK,
    "config_override_applied": bool(config_override),
    "status": "ready",
}

log(f"Training complete! Sending webhook...")
send_webhook(success_payload)

log("=" * 60)
log(f"SUCCESS: LoRA training complete for {SLUG}")
log(f"  Trigger word:     {TRIGGER_WORD}")
log(f"  Weights URL:      {weights_public_url}")
log(f"  Duration:         {training_duration:.0f}s")
log(f"  Images used:      {len(image_files)}")
log(f"  Steps:            {FINAL_STEPS}")
log(f"  Rank:             {FINAL_RANK}")
log(f"  Config override:  {'YES (AI-optimized)' if config_override else 'NO (defaults)'}")
log("=" * 60)

sys.exit(0)
