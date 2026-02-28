"""
Stage 2: Multi-View Generation using Zero123++
- Generates 6 novel views from a single product photo
- Views: front, back, left, right, top-front, bottom-front
- Apache 2.0 license (Zero123Plus by SUDO AI)
- ~5.7GB VRAM
- Input: PNG with white/transparent background
- Output: 6 PNG images at consistent lighting
"""

import torch
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Union
import logging
import requests
import sys

log = logging.getLogger(__name__)

# View angle descriptions for captioning later
VIEW_DESCRIPTIONS = [
    "front view",       # Position 0: front
    "front-right view", # Position 1: front-right
    "right side view",  # Position 2: right
    "back-right view",  # Position 3: back-right
    "back view",        # Position 4: back
    "top-down view",    # Position 5: top
]


def load_zero123plus(model_cache_dir: str = "/models/zero123plus"):
    """Load Zero123++ pipeline."""
    from diffusers import DiffusionPipeline, EulerAncestralDiscreteScheduler

    log.info("Loading Zero123++ model (may download ~5.7GB first time)...")

    pipeline = DiffusionPipeline.from_pretrained(
        "sudo-ai/zero123plus-v1.2",
        custom_pipeline="/app/zero123plus",
        torch_dtype=torch.float16,
        cache_dir=model_cache_dir,
    )
    pipeline.scheduler = EulerAncestralDiscreteScheduler.from_config(
        pipeline.scheduler.config, timestep_spacing="trailing"
    )

    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipeline = pipeline.to(device)

    log.info(f"Zero123++ loaded on {device}")
    return pipeline


def generate_multiview(
    image_path: Union[str, Path],
    output_dir: Union[str, Path],
    pipeline=None,
    num_inference_steps: int = 75,
    guidance_scale: float = 4.0,
    prefix: str = "view",
) -> list:
    """
    Generate 6 novel views from a single product image.

    Args:
        image_path: Path to input image (white/transparent BG recommended)
        output_dir: Directory to save 6 output views
        pipeline: Pre-loaded Zero123++ pipeline
        num_inference_steps: Diffusion steps (75 = good quality)
        guidance_scale: CFG scale (4.0 = default for Zero123++)
        prefix: Filename prefix for output views

    Returns:
        List of output image paths
    """
    if pipeline is None:
        pipeline = load_zero123plus()

    image_path = Path(image_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load and prepare input image
    img = Image.open(image_path).convert("RGBA")

    # White background composite for Zero123++ (needs RGB)
    background = Image.new("RGBA", img.size, (255, 255, 255, 255))
    background.paste(img, mask=img.split()[3] if img.mode == "RGBA" else None)
    img_rgb = background.convert("RGB")

    # Resize to 320x320 (Zero123++ v1.2 input size)
    img_rgb = img_rgb.resize((320, 320), Image.LANCZOS)

    log.info(f"Generating 6 views for {image_path.name}...")

    # Run Zero123++ — outputs 6 views in a 2×3 grid
    with torch.no_grad():
        result = pipeline(
            img_rgb,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
        ).images[0]

    # result is a single image: 640×960 (2 cols × 3 rows, each 320×320)
    result_np = np.array(result)

    output_paths = []
    for idx in range(6):
        row = idx // 2  # 0, 0, 1, 1, 2, 2
        col = idx % 2   # 0, 1, 0, 1, 0, 1

        # Extract this view from the grid
        view_np = result_np[
            row * 320:(row + 1) * 320,
            col * 320:(col + 1) * 320,
        ]
        view_img = Image.fromarray(view_np)

        out_path = output_dir / f"{prefix}_v{idx:02d}_{VIEW_DESCRIPTIONS[idx].replace(' ', '_')}.png"
        view_img.save(str(out_path))
        output_paths.append(out_path)
        log.info(f"  Saved view {idx}: {VIEW_DESCRIPTIONS[idx]} → {out_path.name}")

    return output_paths


def batch_generate_multiview(
    input_dir: Path,
    output_dir: Path,
    pipeline=None,
    max_source_images: int = 3,  # Use top N source images for multiview
) -> list:
    """
    Generate multi-view images for all input images.
    Typically called with already background-removed images.

    Args:
        input_dir: Directory with source images
        output_dir: Directory to save generated views
        pipeline: Pre-loaded pipeline
        max_source_images: Limit number of source images (to control output count)

    Returns:
        List of all generated view paths
    """
    if pipeline is None:
        pipeline = load_zero123plus()

    output_dir.mkdir(parents=True, exist_ok=True)

    image_files = sorted(
        list(input_dir.glob("*.png")) +
        list(input_dir.glob("*.jpg")) +
        list(input_dir.glob("*.jpeg"))
    )[:max_source_images]

    if not image_files:
        log.warning(f"No images found in {input_dir}")
        return []

    all_outputs = []
    for i, img_path in enumerate(image_files):
        log.info(f"Multi-view [{i+1}/{len(image_files)}]: {img_path.name}")
        try:
            views = generate_multiview(
                img_path,
                output_dir / f"src_{i:02d}",
                pipeline=pipeline,
                prefix=f"src{i:02d}",
            )
            all_outputs.extend(views)
        except Exception as e:
            log.error(f"Failed multiview for {img_path}: {e}")

    log.info(f"Multi-view complete: {len(all_outputs)} views from {len(image_files)} sources")
    return all_outputs
