#!/bin/bash

# Install ffmpeg if not already installed
# sudo apt-get install ffmpeg

# Create optimized version of the video
echo "Creating optimized version of bluediamond.mp4..."

# Option 1: Highly compressed MP4 (recommended for background videos)
ffmpeg -i public/bluediamond.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -vf "scale=1280:720" \
  -movflags +faststart \
  -an \
  public/bluediamond-optimized.mp4

# Option 2: WebM format (better compression, good browser support)
ffmpeg -i public/bluediamond.mp4 \
  -c:v libvpx-vp9 \
  -crf 40 \
  -b:v 0 \
  -vf "scale=1280:720" \
  -an \
  public/bluediamond-optimized.webm

# Option 3: Create a poster image for faster initial load
ffmpeg -i public/bluediamond.mp4 \
  -vframes 1 \
  -f image2 \
  public/bluediamond-poster.jpg

echo "Optimization complete!"
echo "Original size: $(du -h public/bluediamond.mp4 | cut -f1)"
echo "Optimized MP4: $(du -h public/bluediamond-optimized.mp4 | cut -f1)"
echo "WebM version: $(du -h public/bluediamond-optimized.webm | cut -f1)"
