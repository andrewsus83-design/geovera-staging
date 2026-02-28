"""
Stage 1: Background Removal using BRIA RMBG-2.0
- Best open-source background removal model (2024)
- Apache 2.0 license
- Produces clean RGBA transparent background
- ~2GB VRAM
"""

import torch
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Union
import logging

log = logging.getLogger(__name__)


def load_rmbg_model(model_path: str = "/models/rmbg-2.0"):
    """Load BRIA RMBG-2.0 model for background removal."""
    from transformers import AutoModelForImageSegmentation
    from torchvision import transforms

    log.info("Loading BRIA RMBG-2.0 model...")
    model = AutoModelForImageSegmentation.from_pretrained(
        model_path,
        trust_remote_code=True
    )
    model.eval()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)

    transform = transforms.Compose([
        transforms.Resize((1024, 1024)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    log.info(f"RMBG-2.0 loaded on {device}")
    return model, transform, device


def remove_background(
    image_path: Union[str, Path],
    output_path: Union[str, Path],
    model=None,
    transform=None,
    device: str = "cuda",
    white_background: bool = False
) -> Path:
    """
    Remove background from image using BRIA RMBG-2.0.

    Args:
        image_path: Input image path
        output_path: Output PNG path (with alpha channel)
        model: Pre-loaded model (will load if None)
        transform: Pre-loaded transform
        device: cuda or cpu
        white_background: If True, composite on white BG instead of transparent

    Returns:
        Path to output image
    """
    if model is None:
        model, transform, device = load_rmbg_model()

    image_path = Path(image_path)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Load image
    img = Image.open(image_path).convert("RGB")
    orig_size = img.size  # (width, height)

    # Transform for model
    img_tensor = transform(img).unsqueeze(0).to(device)

    # Inference
    with torch.no_grad():
        result = model(img_tensor)

    # Get mask — RMBG-2.0 returns list of predictions
    if isinstance(result, (list, tuple)):
        pred_mask = result[-1].sigmoid().cpu()
    else:
        pred_mask = result.sigmoid().cpu()

    pred_mask = pred_mask.squeeze()

    # Resize mask to original image size
    from torchvision import transforms as T
    mask_pil = T.ToPILImage()(pred_mask)
    mask_pil = mask_pil.resize(orig_size, Image.LANCZOS)
    mask_np = np.array(mask_pil)

    # Composite
    img_np = np.array(img)

    if white_background:
        # White background composite
        alpha = mask_np.astype(np.float32) / 255.0
        white = np.ones_like(img_np) * 255
        result_np = (img_np * alpha[:, :, np.newaxis] +
                     white * (1 - alpha[:, :, np.newaxis])).astype(np.uint8)
        result_img = Image.fromarray(result_np, "RGB")
    else:
        # Transparent background (RGBA)
        result_np = np.dstack([img_np, mask_np])
        result_img = Image.fromarray(result_np, "RGBA")

    result_img.save(str(output_path), format="PNG")
    log.info(f"Background removed: {output_path}")
    return output_path


def batch_remove_backgrounds(
    input_dir: Path,
    output_dir: Path,
    white_background: bool = True,
) -> list:
    """
    Remove backgrounds from all images in directory.
    Returns list of output paths.
    """
    model, transform, device = load_rmbg_model()
    output_dir.mkdir(parents=True, exist_ok=True)

    image_files = (
        list(input_dir.glob("*.jpg")) +
        list(input_dir.glob("*.jpeg")) +
        list(input_dir.glob("*.png")) +
        list(input_dir.glob("*.webp"))
    )

    if not image_files:
        log.warning(f"No images found in {input_dir}")
        return []

    outputs = []
    for i, img_path in enumerate(image_files):
        out_path = output_dir / f"{img_path.stem}_nobg.png"
        log.info(f"  [{i+1}/{len(image_files)}] Processing {img_path.name}")
        try:
            result = remove_background(
                img_path, out_path,
                model=model, transform=transform, device=device,
                white_background=white_background
            )
            outputs.append(result)
        except Exception as e:
            log.error(f"  Failed to remove background from {img_path}: {e}")

    log.info(f"Background removal complete: {len(outputs)}/{len(image_files)} images")
    return outputs
