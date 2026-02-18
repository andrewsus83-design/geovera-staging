FROM nvidia/cuda:12.1.0-devel-ubuntu22.04

# Prevent interactive prompts during install
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y \
    python3.10 python3.10-dev python3-pip \
    git wget curl unzip \
    libgl1-mesa-glx libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Make python3.10 the default
RUN ln -sf /usr/bin/python3.10 /usr/bin/python3 && \
    ln -sf /usr/bin/python3.10 /usr/bin/python && \
    python3 -m pip install --upgrade pip

WORKDIR /app

# Install ai-toolkit (ostris)
RUN git clone https://github.com/ostris/ai-toolkit.git /app/ai-toolkit && \
    cd /app/ai-toolkit && \
    pip install torch==2.1.2 torchvision==0.16.2 --index-url https://download.pytorch.org/whl/cu121 && \
    pip install -r requirements.txt

# Install our training wrapper deps
RUN pip install requests boto3

# Copy our training script
COPY train.py /app/train.py
COPY config_template.yaml /app/config_template.yaml

# Default: run training script
CMD ["python3", "/app/train.py"]
