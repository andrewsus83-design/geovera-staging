FROM nvidia/cuda:12.1.0-cudnn8-devel-ubuntu22.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y \
    python3.10 python3-pip python3.10-venv \
    git git-lfs \
    wget curl \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Python alias
RUN ln -sf /usr/bin/python3.10 /usr/bin/python3 && \
    ln -sf /usr/bin/python3 /usr/bin/python

# Upgrade pip
RUN pip3 install --upgrade pip setuptools wheel

# PyTorch (CUDA 12.1)
RUN pip3 install torch==2.3.1 torchvision==0.18.1 torchaudio==2.3.1 \
    --index-url https://download.pytorch.org/whl/cu121

# Core scientific stack
RUN pip3 install \
    numpy==1.26.4 \
    Pillow==10.3.0 \
    opencv-python-headless==4.9.0.80 \
    scipy==1.13.1 \
    scikit-image==0.23.2

# HuggingFace ecosystem
RUN pip3 install \
    transformers==4.44.0 \
    diffusers==0.30.3 \
    accelerate==0.34.2 \
    huggingface_hub==0.24.6 \
    safetensors==0.4.4 \
    tokenizers==0.19.1

# CLIP for quality filtering
RUN pip3 install \
    open_clip_torch==2.26.1 \
    ftfy==6.2.0 \
    regex==2024.7.24

# Image processing utilities
RUN pip3 install \
    rembg==2.0.57 \
    onnxruntime-gpu==1.18.1 \
    einops==0.8.0 \
    kornia==0.7.3

# HTTP + utils
RUN pip3 install \
    requests==2.32.3 \
    google-generativeai==0.7.2 \
    tqdm==4.66.4 \
    PyYAML==6.0.1 \
    packaging==24.1

# Clone Zero123++ (multi-view generation)
RUN git clone https://github.com/SUDO-AI-3D/zero123plus.git /app/zero123plus && \
    cd /app/zero123plus && \
    pip3 install -e . --no-deps || true

# Clone IC-Light (relighting)
RUN git clone https://github.com/lllyasviel/IC-Light.git /app/ic-light

# Working dir
WORKDIR /app

# Copy our scripts
COPY synth_gen.py /app/synth_gen.py
COPY stages/ /app/stages/

# Pre-download BRIA RMBG-2.0 model (background removal)
# This is done at build time to cache the model in the image
RUN python3 -c "
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id='briaai/RMBG-2.0',
    local_dir='/models/rmbg-2.0',
    ignore_patterns=['*.git*', 'README*']
)
print('BRIA RMBG-2.0 downloaded')
" || echo "WARNING: RMBG download failed, will retry at runtime"

# Pre-download CLIP model for quality filtering
RUN python3 -c "
import open_clip
model, _, preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='openai')
print('CLIP ViT-B-32 downloaded')
" || echo "WARNING: CLIP download failed, will retry at runtime"

# Note: Zero123++ (5.7GB) and IC-Light models downloaded at RUNTIME
# to avoid Docker image bloat (would add 15GB+ to image)

CMD ["python3", "/app/synth_gen.py"]
