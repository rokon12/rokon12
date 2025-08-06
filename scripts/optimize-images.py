#!/usr/bin/env python3
"""
Image optimization script for Jekyll site
Requires: Pillow (pip install Pillow)

Usage: python scripts/optimize-images.py

This script will:
1. Find all images in the /images directory
2. Create optimized versions at different sizes
3. Convert to WebP format for better compression
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow is required. Install with: pip install Pillow")
    sys.exit(1)

# Configuration
IMAGE_DIR = Path("images")
SIZES = {
    "small": 400,
    "medium": 800,
    "large": 1200
}
QUALITY = 85
WEBP_QUALITY = 80

def optimize_image(image_path):
    """Optimize a single image"""
    try:
        with Image.open(image_path) as img:
            # Skip if already optimized (has size suffix)
            if any(f"-{size}" in image_path.stem for size in SIZES.keys()):
                return
            
            # Skip SVG files
            if image_path.suffix.lower() == '.svg':
                return
                
            print(f"Optimizing: {image_path}")
            
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Create optimized versions
            for size_name, max_width in SIZES.items():
                # Calculate new dimensions maintaining aspect ratio
                ratio = min(max_width / img.width, 1.0)
                if ratio < 1.0:
                    new_width = int(img.width * ratio)
                    new_height = int(img.height * ratio)
                    
                    # Resize image
                    resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Save as JPEG
                    output_path = image_path.parent / f"{image_path.stem}-{size_name}{image_path.suffix}"
                    resized.save(output_path, quality=QUALITY, optimize=True)
                    
                    # Save as WebP
                    webp_path = image_path.parent / f"{image_path.stem}-{size_name}.webp"
                    resized.save(webp_path, format="WebP", quality=WEBP_QUALITY, optimize=True)
                    
                    print(f"  Created: {output_path.name} ({new_width}x{new_height})")
                    print(f"  Created: {webp_path.name} ({new_width}x{new_height})")
            
            # Create WebP version of original
            webp_original = image_path.parent / f"{image_path.stem}.webp"
            img.save(webp_original, format="WebP", quality=WEBP_QUALITY, optimize=True)
            print(f"  Created: {webp_original.name} (original size)")
            
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

def main():
    """Main function"""
    if not IMAGE_DIR.exists():
        print(f"Image directory '{IMAGE_DIR}' not found")
        return
    
    # Find all images
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
    images = []
    
    for ext in image_extensions:
        images.extend(IMAGE_DIR.glob(f"*{ext}"))
        images.extend(IMAGE_DIR.glob(f"*{ext.upper()}"))
    
    if not images:
        print("No images found to optimize")
        return
    
    print(f"Found {len(images)} images to optimize")
    print("-" * 50)
    
    # Process each image
    for image_path in images:
        optimize_image(image_path)
    
    print("-" * 50)
    print("Optimization complete!")
    print("\nTo use optimized images in your posts, update image tags to use:")
    print("- picture elements with WebP and fallback")
    print("- srcset with different sizes")
    print("\nExample:")
    print("""
<picture>
  <source type="image/webp" srcset="/images/example-small.webp 400w,
                                     /images/example-medium.webp 800w,
                                     /images/example-large.webp 1200w">
  <img src="/images/example.jpg" 
       srcset="/images/example-small.jpg 400w,
               /images/example-medium.jpg 800w,
               /images/example-large.jpg 1200w"
       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 800px"
       alt="Description">
</picture>
""")

if __name__ == "__main__":
    main()