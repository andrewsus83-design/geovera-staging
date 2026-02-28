"""
Stage 5: AI-Powered Captioning using Google Gemini Vision
- Analyzes each synthetic image and generates detailed, accurate captions
- Uses Gemini 1.5 Flash (cheap, fast, multimodal)
- Captions are LoRA-training optimized: trigger_word + descriptive tags
- Falls back to template captions if Gemini unavailable
"""

import base64
import json
import logging
import time
from pathlib import Path
from typing import Union, List, Optional

import requests

log = logging.getLogger(__name__)

# Caption format for LoRA training
# Must start with trigger word, then descriptive tags
CAPTION_SYSTEM_PROMPT = """You are a professional product photographer writing training captions for AI image generation.

Given a product image, write a training caption that:
1. Starts with the TRIGGER_WORD placeholder (will be replaced)
2. Describes the product's specific visual characteristics (color, material, style, shape)
3. Describes the lighting and photography style
4. Describes the viewing angle precisely
5. Uses comma-separated tags, NOT sentences
6. Is 20-40 words total
7. Is factual and specific, NOT generic

Example for a black digital watch:
"TRIGGER_WORD, matte black resin case, digital display with countdown timer, red accent buttons, front view, white studio background, soft box lighting, commercial product photography"

Now write a caption for this image. Replace TRIGGER_WORD with the placeholder text exactly."""

ANGLE_DESCRIPTIONS = {
    "v00": "front view",
    "v01": "front-right angle",
    "v02": "right side view",
    "v03": "back-right angle",
    "v04": "back view",
    "v05": "top-down overhead view",
    "front": "front view",
    "back": "back view",
    "left": "left side view",
    "right": "right side view",
    "top": "top-down view",
    "studio_white": "white studio background, professional lighting",
    "studio_dramatic": "dramatic side lighting, moody studio",
    "window_light": "natural window light",
    "overhead_flat": "flat overhead lighting",
}


def _encode_image_base64(image_path: Path) -> str:
    """Encode image to base64 for Gemini API."""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def _extract_angle_hint(image_path: Path) -> str:
    """Extract angle hint from filename."""
    name = image_path.stem.lower()
    for key, desc in ANGLE_DESCRIPTIONS.items():
        if key in name:
            return desc
    return "product view"


def generate_caption_gemini(
    image_path: Path,
    trigger_word: str,
    brand_name: str,
    product_type: str,
    gemini_api_key: str,
    retries: int = 3,
) -> str:
    """
    Generate caption for one image using Gemini Vision.

    Args:
        image_path: Path to image file
        trigger_word: LoRA trigger word (e.g. "GSHOCK_DW5900_WATCH")
        brand_name: Human readable brand/product name
        product_type: "watch", "bag", "shoe", etc.
        gemini_api_key: Google AI API key
        retries: Number of retry attempts

    Returns:
        Caption string starting with trigger_word
    """
    angle_hint = _extract_angle_hint(image_path)
    img_b64 = _encode_image_base64(image_path)

    # Gemini 1.5 Flash API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"

    user_prompt = (
        f"Product: {brand_name} {product_type}\n"
        f"Trigger word to use: {trigger_word}\n"
        f"This image appears to be a {angle_hint}.\n\n"
        f"Write a LoRA training caption following the format in your instructions."
    )

    payload = {
        "contents": [{
            "parts": [
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": img_b64,
                    }
                },
                {"text": user_prompt}
            ]
        }],
        "systemInstruction": {
            "parts": [{"text": CAPTION_SYSTEM_PROMPT}]
        },
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 200,
        }
    }

    for attempt in range(retries):
        try:
            resp = requests.post(url, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                caption_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Ensure it starts with trigger word
                if not caption_text.startswith(trigger_word):
                    caption_text = f"{trigger_word}, {caption_text}"
                log.debug(f"  Gemini caption: {caption_text[:80]}...")
                return caption_text
            elif resp.status_code == 429:
                # Rate limit — wait and retry
                wait = 2 ** attempt
                log.warning(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
            else:
                log.error(f"  Gemini API error {resp.status_code}: {resp.text[:200]}")
                break
        except Exception as e:
            log.error(f"  Gemini request failed (attempt {attempt+1}): {e}")
            if attempt < retries - 1:
                time.sleep(2)

    # Fallback caption
    angle_hint = _extract_angle_hint(image_path)
    return _generate_template_caption(trigger_word, brand_name, product_type, angle_hint)


def _generate_template_caption(
    trigger_word: str,
    brand_name: str,
    product_type: str,
    angle: str = "product view",
) -> str:
    """Template-based fallback caption."""
    return (
        f"{trigger_word}, {brand_name} {product_type}, {angle}, "
        f"studio lighting, white background, high quality product photo, commercial photography"
    )


def caption_all_images(
    image_paths: List[Path],
    trigger_word: str,
    brand_name: str,
    product_type: str = "watch",
    gemini_api_key: Optional[str] = None,
    output_dir: Optional[Path] = None,
) -> List[Path]:
    """
    Generate captions for all images and save as .txt sidecar files.

    Args:
        image_paths: List of image paths to caption
        trigger_word: LoRA trigger word
        brand_name: Human-readable brand/product name
        product_type: Product type string
        gemini_api_key: Google AI API key (falls back to templates if None)
        output_dir: Where to copy images + captions (if None, saves alongside images)

    Returns:
        List of image paths (may be in output_dir if specified)
    """
    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

    output_image_paths = []
    use_gemini = bool(gemini_api_key)

    if not use_gemini:
        log.warning("No GEMINI_API_KEY — using template captions")

    for i, img_path in enumerate(image_paths):
        img_path = Path(img_path)

        # Determine output location
        if output_dir:
            out_img = output_dir / img_path.name
            # Copy image to output dir
            import shutil
            shutil.copy2(str(img_path), str(out_img))
        else:
            out_img = img_path

        caption_path = out_img.with_suffix(".txt")

        log.info(f"  Caption [{i+1}/{len(image_paths)}]: {img_path.name}")

        if use_gemini:
            caption = generate_caption_gemini(
                img_path,
                trigger_word=trigger_word,
                brand_name=brand_name,
                product_type=product_type,
                gemini_api_key=gemini_api_key,
            )
        else:
            angle = _extract_angle_hint(img_path)
            caption = _generate_template_caption(trigger_word, brand_name, product_type, angle)

        caption_path.write_text(caption, encoding="utf-8")
        log.debug(f"    → {caption[:80]}...")

        output_image_paths.append(out_img)

        # Small delay to avoid rate limiting
        if use_gemini and i < len(image_paths) - 1:
            time.sleep(0.5)

    log.info(f"Captioning complete: {len(output_image_paths)} images captioned")
    return output_image_paths
