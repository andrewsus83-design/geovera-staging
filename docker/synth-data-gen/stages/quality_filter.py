"""
Stage 4: Quality Filtering using CLIP
- Filters out blurry, corrupted, or off-topic synthetic images
- Uses CLIP cosine similarity vs source image (>0.70 threshold)
- Detects blur via Laplacian variance
- Detects clipping/overexposure
- Selects diverse set (avoids near-duplicate views)
- ~0.5GB VRAM (ViT-B/32 model)
"""

import torch
import numpy as np
from PIL import Image
from pathlib import Path
from typing import Union, List, Tuple
import logging

log = logging.getLogger(__name__)

# Quality thresholds
CLIP_SIMILARITY_THRESHOLD = 0.65    # Minimum CLIP similarity to source image
BLUR_THRESHOLD = 80.0               # Laplacian variance (below = blurry)
BRIGHTNESS_MIN = 30                 # Too dark
BRIGHTNESS_MAX = 230                # Too bright/overexposed
DIVERSITY_THRESHOLD = 0.97          # Max similarity between selected images (avoid near-dupes)


def load_clip():
    """Load CLIP ViT-B/32 for quality filtering."""
    import open_clip

    log.info("Loading CLIP ViT-B/32...")
    model, _, preprocess = open_clip.create_model_and_transforms(
        "ViT-B-32",
        pretrained="openai"
    )
    model.eval()
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)

    tokenizer = open_clip.get_tokenizer("ViT-B-32")
    log.info(f"CLIP loaded on {device}")
    return model, preprocess, tokenizer, device


def get_image_embedding(image_path: Union[str, Path], model, preprocess, device: str) -> torch.Tensor:
    """Get CLIP image embedding (normalized)."""
    img = Image.open(image_path).convert("RGB")
    img_tensor = preprocess(img).unsqueeze(0).to(device)
    with torch.no_grad():
        embedding = model.encode_image(img_tensor)
        embedding = embedding / embedding.norm(dim=-1, keepdim=True)
    return embedding.cpu()


def compute_blur_score(image_path: Union[str, Path]) -> float:
    """
    Compute Laplacian variance as blur metric.
    Higher = sharper. Lower = blurrier.
    """
    import cv2
    img = cv2.imread(str(image_path))
    if img is None:
        return 0.0
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    return float(laplacian.var())


def compute_brightness(image_path: Union[str, Path]) -> float:
    """Average brightness of image (0-255)."""
    img = Image.open(image_path).convert("L")
    return float(np.array(img).mean())


def filter_images(
    candidate_paths: List[Path],
    source_paths: List[Path],
    clip_model=None,
    clip_preprocess=None,
    device: str = "cuda",
    target_count: int = 15,
    min_count: int = 8,
) -> Tuple[List[Path], dict]:
    """
    Filter synthetic images for quality and relevance.

    Args:
        candidate_paths: All generated synthetic images
        source_paths: Original source product images (for CLIP similarity)
        clip_model: Pre-loaded CLIP model
        clip_preprocess: Pre-loaded CLIP preprocessor
        device: cuda or cpu
        target_count: Desired number of output images
        min_count: Minimum acceptable output count

    Returns:
        (filtered_paths, quality_report_dict)
    """
    if clip_model is None:
        clip_model, clip_preprocess, _, device = load_clip()

    log.info(f"Quality filtering {len(candidate_paths)} candidates (target: {target_count})")

    # Get source embeddings (average them for robust reference)
    source_embeddings = []
    for src in source_paths[:3]:  # Use up to 3 source images
        try:
            emb = get_image_embedding(src, clip_model, clip_preprocess, device)
            source_embeddings.append(emb)
        except Exception as e:
            log.warning(f"  Failed to embed source {src}: {e}")

    if not source_embeddings:
        log.warning("No source embeddings — skipping CLIP similarity filter")
        # Still apply blur/brightness filters
        source_avg_emb = None
    else:
        source_avg_emb = torch.stack(source_embeddings).mean(dim=0)
        source_avg_emb = source_avg_emb / source_avg_emb.norm(dim=-1, keepdim=True)

    # Score each candidate
    scored = []
    rejected = {"blur": 0, "brightness": 0, "clip": 0, "error": 0}

    for img_path in candidate_paths:
        try:
            # Check 1: Blur
            blur = compute_blur_score(img_path)
            if blur < BLUR_THRESHOLD:
                rejected["blur"] += 1
                log.debug(f"  REJECT (blur={blur:.0f}): {img_path.name}")
                continue

            # Check 2: Brightness
            brightness = compute_brightness(img_path)
            if brightness < BRIGHTNESS_MIN or brightness > BRIGHTNESS_MAX:
                rejected["brightness"] += 1
                log.debug(f"  REJECT (brightness={brightness:.0f}): {img_path.name}")
                continue

            # Check 3: CLIP similarity to source product
            clip_sim = 1.0  # Default pass if no source
            if source_avg_emb is not None:
                emb = get_image_embedding(img_path, clip_model, clip_preprocess, device)
                clip_sim = float(torch.cosine_similarity(emb, source_avg_emb, dim=-1))
                if clip_sim < CLIP_SIMILARITY_THRESHOLD:
                    rejected["clip"] += 1
                    log.debug(f"  REJECT (clip_sim={clip_sim:.3f}): {img_path.name}")
                    continue

            # Passed all filters — score by CLIP similarity
            scored.append((img_path, clip_sim, blur))
            log.debug(f"  PASS (clip={clip_sim:.3f}, blur={blur:.0f}): {img_path.name}")

        except Exception as e:
            rejected["error"] += 1
            log.warning(f"  Error processing {img_path}: {e}")

    log.info(f"  Passed filters: {len(scored)}/{len(candidate_paths)}")
    log.info(f"  Rejected: blur={rejected['blur']}, brightness={rejected['brightness']}, "
             f"clip={rejected['clip']}, error={rejected['error']}")

    # Sort by CLIP similarity (best first)
    scored.sort(key=lambda x: x[1], reverse=True)

    # Diversity filter: remove near-duplicates
    selected = []
    selected_embeddings = []

    for img_path, clip_sim, blur in scored:
        if len(selected) >= target_count:
            break

        # Check diversity vs already selected
        if selected_embeddings and source_avg_emb is not None:
            emb = get_image_embedding(img_path, clip_model, clip_preprocess, device)
            max_sim_to_selected = max(
                float(torch.cosine_similarity(emb, sel_emb, dim=-1))
                for sel_emb in selected_embeddings
            )
            if max_sim_to_selected > DIVERSITY_THRESHOLD:
                log.debug(f"  SKIP (near-duplicate, sim={max_sim_to_selected:.3f}): {img_path.name}")
                continue
            selected_embeddings.append(emb)

        selected.append(img_path)
        log.info(f"  SELECT [{len(selected)}/{target_count}]: {img_path.name} (clip={clip_sim:.3f})")

    if len(selected) < min_count:
        log.warning(f"Only {len(selected)} images passed quality filter (min={min_count})")
        # Relax criteria: add best rejects from blur/clip failures
        if len(scored) > len(selected):
            extras = [p for p, _, _ in scored if p not in selected]
            needed = min_count - len(selected)
            selected.extend(extras[:needed])
            log.info(f"  Added {min(needed, len(extras))} extras to reach minimum")

    quality_report = {
        "candidates": len(candidate_paths),
        "passed_filters": len(scored),
        "selected": len(selected),
        "rejected": rejected,
    }

    log.info(f"Quality filter complete: {len(selected)} images selected")
    return selected, quality_report
