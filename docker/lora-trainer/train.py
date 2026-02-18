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
  STEPS            — training steps (default: 1000)

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
from pathlib import Path

# ─── Config from env ──────────────────────────────────────────────────────────

ZIP_URL       = os.environ.get("ZIP_URL", "")
TRIGGER_WORD  = os.environ.get("TRIGGER_WORD", "")
SLUG          = os.environ.get("SLUG", "")
SUPABASE_URL  = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY  = os.environ.get("SUPABASE_KEY", "")
WEBHOOK_URL   = os.environ.get("WEBHOOK_URL", "")
HF_TOKEN      = os.environ.get("HF_TOKEN", "")
STEPS         = int(os.environ.get("STEPS", "1000"))

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

log(f"Starting training: slug={SLUG}, trigger={TRIGGER_WORD}, steps={STEPS}")

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

with zipfile.ZipFile(zip_path, "r") as zf:
    zf.extractall(IMAGES_DIR)

# Find extracted images (handle nested folders)
image_files = list(IMAGES_DIR.rglob("*.jpg")) + \
              list(IMAGES_DIR.rglob("*.jpeg")) + \
              list(IMAGES_DIR.rglob("*.png")) + \
              list(IMAGES_DIR.rglob("*.webp"))

# Flatten: move all images to IMAGES_DIR root
for img in image_files:
    if img.parent != IMAGES_DIR:
        shutil.move(str(img), str(IMAGES_DIR / img.name))

image_files = list(IMAGES_DIR.glob("*.jpg")) + \
              list(IMAGES_DIR.glob("*.jpeg")) + \
              list(IMAGES_DIR.glob("*.png")) + \
              list(IMAGES_DIR.glob("*.webp"))

if len(image_files) < 3:
    fail(f"Not enough images after extraction: found {len(image_files)}, need at least 3")

log(f"Extracted {len(image_files)} training images")

# Generate captions for each image (trigger word as caption)
for img_path in image_files:
    caption_path = img_path.with_suffix(".txt")
    caption_path.write_text(f"{TRIGGER_WORD}, product photo, high quality")

log("Generated captions for all images")

# ─── Build ai-toolkit config ──────────────────────────────────────────────────

with open("/app/config_template.yaml", "r") as f:
    config_content = f.read()

config_content = config_content.replace("{TRIGGER_WORD}", TRIGGER_WORD)
config_content = config_content.replace("{OUTPUT_DIR}", str(OUTPUT_DIR))
config_content = config_content.replace("{IMAGES_DIR}", str(IMAGES_DIR))

# Override steps
import re
config_content = re.sub(r'steps:\s*\d+', f'steps: {STEPS}', config_content)

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

log(f"Starting ai-toolkit training with {STEPS} steps...")
training_start = time.time()

result = subprocess.run(
    ["python3", "/app/ai-toolkit/run.py", str(CONFIG_PATH)],
    cwd="/app/ai-toolkit",
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
    "steps": STEPS,
    "images_used": len(image_files),
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
    "status": "ready",
}

log(f"Training complete! Sending webhook...")
send_webhook(success_payload)

log("=" * 60)
log(f"SUCCESS: LoRA training complete for {SLUG}")
log(f"  Trigger word: {TRIGGER_WORD}")
log(f"  Weights URL:  {weights_public_url}")
log(f"  Duration:     {training_duration:.0f}s")
log(f"  Images used:  {len(image_files)}")
log("=" * 60)

sys.exit(0)
