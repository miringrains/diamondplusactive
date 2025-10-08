#!/bin/bash

# Script to prepare email-friendly logo from SVG
# Creates PNG versions optimized for email

echo "🎨 Preparing email logo for Diamond Plus..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Installing..."
    apt-get update && apt-get install -y imagemagick
fi

# Create email-templates directory if it doesn't exist
mkdir -p public/email-assets

# Convert SVG to PNG (2x size for retina)
echo "Converting logo to PNG..."

# Standard size (200x50)
convert -density 300 -background transparent public/Diamondpluslogodark.svg -resize 200x50 public/email-assets/logo-standard.png

# 2x size for retina (400x100)
convert -density 600 -background transparent public/Diamondpluslogodark.svg -resize 400x100 public/email-assets/logo-2x.png

# Create a white version for dark backgrounds
echo "Creating white version for dark mode..."
convert -density 600 -background transparent public/Diamondpluslogodark.svg -resize 400x100 -negate -channel RGB -negate public/email-assets/logo-white-2x.png

echo "✅ Email logos created!"
echo ""
echo "Files created:"
echo "- /public/email-assets/logo-standard.png (200x50)"
echo "- /public/email-assets/logo-2x.png (400x100)"
echo "- /public/email-assets/logo-white-2x.png (400x100 - white version)"
echo ""
echo "Next steps:"
echo "1. Upload these files to your server"
echo "2. Update email templates with the hosted URLs"
echo "3. Use logo-2x.png as the primary logo (better for retina displays)"
