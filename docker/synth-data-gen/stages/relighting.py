"""
Stage 3: Relighting using IC-Light v2
- Adds realistic lighting variations to product images
- Creates multiple lighting scenarios: studio, dramatic, window light, etc.
- Apache 2.0 license (IC-Light by lllyasviel)
- ~10GB VRAM (uses FLUX + IC-Light conditioning)
- Simulates professional studio photography lighting setups
"""

import torch
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Union, List
import logging

log = logging.getLogger(__name__)

# Lighting conditions to simulate
LIGHTING_PRESETS = [
    {
        "name": "studio_white",
        "prompt": "product on white background, professional studio lighting, soft box lights, clean commercial photography",
        "bg_color": (255, 255, 255),
    },
    {
        "name": "studio_dramatic",
        "prompt": "product photography, dramatic side lighting, strong shadows, moody studio setup, luxury product shot",
        "bg_color": (240, 240, 240),
    },
    {
        "name": "window_light",
        "prompt": "product near window, natural daylight, soft diffused light from left, lifestyle photography",
        "bg_color": (245, 243, 238),
    },
    {
        "name": "overhead_flat",
        "prompt": "product photography, flat lay, overhead lighting, even illumination, minimal shadows, e-commerce style",
        "bg_color": (255, 255, 255),
    },
]


def load_iclight(model_cache_dir: str = "/models/iclight"):
    """
    Load IC-Light v2 pipeline.
    IC-Light conditions on foreground subject + lighting prompt.
    """
    from diffusers import StableDiffusionPipeline
    import sys
    sys.path.insert(0, "/app/ic-light")

    log.info("Loading IC-Light v2 model...")

    try:
        # IC-Light v2 uses FLUX as backbone
        from diffusers import FluxFillPipeline

        # Use IC-Light's background conditioned model (FC = Foreground Conditioned)
        pipeline = FluxFillPipeline.from_pretrained(
            "lllyasviel/iclight-v2-vary",
            torch_dtype=torch.bfloat16,
            cache_dir=model_cache_dir,
        )
        device = "cuda" if torch.cuda.is_available() else "cpu"
        pipeline = pipeline.to(device)
        model_type = "flux"

    except Exception as e:
        log.warning(f"IC-Light v2 FLUX load failed: {e}. Falling back to SD15 version.")
        # Fallback to IC-Light v1 (SD1.5-based, lighter weight)
        pipeline = load_iclight_v1(model_cache_dir)
        model_type = "sd15"

    log.info(f"IC-Light loaded ({model_type})")
    return pipeline, model_type


def load_iclight_v1(model_cache_dir: str = "/models/iclight-v1"):
    """Fallback: IC-Light v1 SD1.5-based (lighter, ~6GB VRAM)."""
    from diffusers import StableDiffusionPipeline, UNet2DConditionModel
    import torch

    # Load custom IC-Light UNet
    unet = UNet2DConditionModel.from_pretrained(
        "lllyasviel/ic-light",
        subfolder="iclight_sd15_fc",
        torch_dtype=torch.float16,
        cache_dir=model_cache_dir,
    )

    # Base SD1.5 pipeline
    pipeline = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        unet=unet,
        torch_dtype=torch.float16,
        safety_checker=None,
        cache_dir=model_cache_dir,
    )
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipeline = pipeline.to(device)
    return pipeline


def relight_image(
    image_path: Union[str, Path],
    output_dir: Union[str, Path],
    pipeline=None,
    model_type: str = "flux",
    presets: list = None,
    num_inference_steps: int = 25,
) -> List[Path]:
    """
    Apply relighting to a product image using multiple lighting presets.

    Args:
        image_path: Path to foreground-only image (white BG or transparent)
        output_dir: Directory to save relit images
        pipeline: Pre-loaded IC-Light pipeline
        model_type: "flux" or "sd15"
        presets: List of lighting preset dicts (default: LIGHTING_PRESETS)
        num_inference_steps: Diffusion steps

    Returns:
        List of output image paths
    """
    if pipeline is None:
        pipeline, model_type = load_iclight()

    if presets is None:
        presets = LIGHTING_PRESETS[:2]  # Default: studio_white + studio_dramatic

    image_path = Path(image_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load image
    img = Image.open(image_path).convert("RGBA")

    output_paths = []

    for preset in presets:
        out_path = output_dir / f"{image_path.stem}_{preset['name']}.png"

        try:
            log.info(f"  Relighting: {preset['name']}")

            if model_type == "flux":
                relit = _relight_flux(img, pipeline, preset, num_inference_steps)
            else:
                relit = _relight_sd15(img, pipeline, preset, num_inference_steps)

            relit.save(str(out_path))
            output_paths.append(out_path)
            log.info(f"  Saved: {out_path.name}")

        except Exception as e:
            log.error(f"  Relight failed ({preset['name']}): {e}")
            # Fallback: composite on colored background without relight
            fallback = _simple_composite(img, preset["bg_color"])
            fallback.save(str(out_path))
            output_paths.append(out_path)
            log.warning(f"  Used simple composite fallback: {out_path.name}")

    return output_paths


def _relight_flux(img: Image.Image, pipeline, preset: dict, steps: int) -> Image.Image:
    """IC-Light v2 FLUX-based relighting."""
    # Prepare fg image (resize to 1024x1024)
    fg = img.resize((1024, 1024), Image.LANCZOS)
    fg_rgb = Image.new("RGB", fg.size, preset["bg_color"])
    if fg.mode == "RGBA":
        fg_rgb.paste(fg, mask=fg.split()[3])
    else:
        fg_rgb.paste(fg)

    # Convert to tensor for conditioning
    fg_tensor = torch.from_numpy(np.array(fg_rgb)).float() / 127.5 - 1
    fg_tensor = fg_tensor.permute(2, 0, 1).unsqueeze(0)

    # Run pipeline
    device = next(pipeline.parameters()).device
    result = pipeline(
        prompt=preset["prompt"],
        image=fg_tensor.to(device, dtype=torch.bfloat16),
        num_inference_steps=steps,
        guidance_scale=1.5,
    ).images[0]

    return result


def _relight_sd15(img: Image.Image, pipeline, preset: dict, steps: int) -> Image.Image:
    """IC-Light v1 SD1.5-based relighting."""
    # Resize to 512x512 for SD1.5
    fg = img.resize((512, 512), Image.LANCZOS)
    fg_np = np.array(fg)

    # Separate foreground from alpha
    if fg_np.shape[2] == 4:
        alpha = fg_np[:, :, 3:4] / 255.0
        fg_rgb = fg_np[:, :, :3] * alpha + 255 * (1 - alpha)
        fg_rgb = fg_rgb.astype(np.uint8)
    else:
        fg_rgb = fg_np[:, :, :3]

    fg_pil = Image.fromarray(fg_rgb)

    result = pipeline(
        prompt=preset["prompt"],
        image=fg_pil,
        num_inference_steps=steps,
        guidance_scale=7.5,
        strength=0.5,  # Keep product identity
    ).images[0]

    return result


def _simple_composite(img: Image.Image, bg_color: tuple) -> Image.Image:
    """Simple fallback: composite RGBA image on solid background."""
    bg = Image.new("RGB", img.size, bg_color)
    if img.mode == "RGBA":
        bg.paste(img, mask=img.split()[3])
    else:
        bg.paste(img)
    return bg


def batch_relight(
    input_dir: Path,
    output_dir: Path,
    pipeline=None,
    model_type: str = "flux",
    max_images: int = 20,
    lighting_presets: list = None,
) -> list:
    """
    Relight all images in directory.
    Returns list of all relit image paths.
    """
    if pipeline is None:
        try:
            pipeline, model_type = load_iclight()
        except Exception as e:
            log.error(f"IC-Light load failed: {e}. Skipping relighting stage.")
            # Return originals if IC-Light unavailable
            return list(input_dir.glob("*.png"))[:max_images]

    if lighting_presets is None:
        lighting_presets = LIGHTING_PRESETS[:2]  # studio_white + studio_dramatic

    image_files = sorted(input_dir.rglob("*.png"))[:max_images]
    output_dir.mkdir(parents=True, exist_ok=True)

    all_outputs = []
    for i, img_path in enumerate(image_files):
        log.info(f"Relight [{i+1}/{len(image_files)}]: {img_path.name}")
        outputs = relight_image(
            img_path,
            output_dir,
            pipeline=pipeline,
            model_type=model_type,
            presets=lighting_presets,
        )
        all_outputs.extend(outputs)

    log.info(f"Relighting complete: {len(all_outputs)} images from {len(image_files)} sources")
    return all_outputs
