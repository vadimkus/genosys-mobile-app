# Screenshot Resizing for App Store Submission

**Date:** February 9, 2026  
**Status:** ✅ Complete  
**Location:** `/Users/vadimkus/Desktop/screens/resized/`

---

## Overview

This document describes the process of resizing mobile app screenshots to meet Apple App Store Connect requirements for iOS app submission.

---

## Apple App Store Requirements

### Accepted Screenshot Dimensions

Apple requires screenshots in one of these specific resolutions:

| Device Size | Resolution (Portrait) | Resolution (Landscape) | Devices |
|------------|----------------------|------------------------|---------|
| **6.7" Display** | **1284 × 2778px** | 2778 × 1284px | iPhone 14 Pro Max, 15 Pro Max |
| **6.5" Display** | 1242 × 2688px | 2688 × 1242px | iPhone XS Max, 11 Pro Max |
| **5.5" Display** | 1242 × 2208px | 2208 × 1242px | iPhone 8 Plus |

**Note:** Apple accepts up to **10 screenshots** per device size class.

### Format Requirements

- **Format:** PNG or JPEG
- **File Size:** Maximum 10 MB per screenshot
- **Color Space:** RGB
- **Quality:** High resolution, clear and readable

---

## Original Screenshots

### Source Location
- **Path:** `/Users/vadimkus/Desktop/screens/`
- **Format:** JPEG (.jpeg)
- **Original Dimensions:** 736 × 1600px
- **Aspect Ratio:** ~2.174:1 (portrait)
- **Count:** 11 screenshots

### Files Processed
1. `1.jpeg` - Product detail page (CHARMING LOOK BEAUTY BOX)
2. `2.jpeg` - [Screen content]
3. `3.jpeg` - [Screen content]
4. `4.jpeg` - [Screen content]
5. `5.jpeg` - Shop page (Russian language, product listings)
6. `6.jpeg` - [Screen content]
7. `7.jpeg` - [Screen content]
8. `9.jpeg` - [Screen content]
9. `10.jpeg` - [Screen content]
10. `11.jpeg` - Shop page (Arabic language, product listings)
11. `12.jpeg` - [Screen content]

---

## Resizing Process

### Target Resolution Selected

**1284 × 2778px** (iPhone 6.7" / iPhone 14 Pro Max)

**Reasoning:**
- Closest aspect ratio match to original (736×1600)
- Modern device size (preferred by Apple)
- Better future-proofing for App Store listings

### Aspect Ratio Comparison

| Resolution | Aspect Ratio | Difference from Original |
|-----------|--------------|-------------------------|
| Original (736×1600) | 2.1739:1 | - |
| 6.7" (1284×2778) | 2.1636:1 | 0.0104 |
| 6.5" (1242×2688) | 2.1643:1 | 0.0097 |

Both target sizes have very similar aspect ratios, minimizing distortion.

### Resizing Method

**Tool Used:** Python 3 with Pillow (PIL) library

**Algorithm:** Lanczos resampling (high-quality upscaling)

**Process:**
1. Load original JPEG image
2. Calculate scale factor to fit within target dimensions while maintaining aspect ratio
3. Resize image using Lanczos algorithm (high-quality interpolation)
4. Create white canvas at exact target size (1284 × 2778px)
5. Center resized image on canvas
6. Save as PNG format (Apple preferred format)

**Code Snippet:**
```python
from PIL import Image

# Load original
img = Image.open(src_path).convert("RGB")
orig_w, orig_h = img.size

# Calculate scale
scale = min(TARGET_W / orig_w, TARGET_H / orig_h)
new_w = int(orig_w * scale)
new_h = int(orig_h * scale)

# High-quality resize
resized = img.resize((new_w, new_h), Image.LANCZOS)

# Create white canvas
canvas = Image.new("RGB", (TARGET_W, TARGET_H), (255, 255, 255))

# Center image
x_offset = (TARGET_W - new_w) // 2
y_offset = (TARGET_H - new_h) // 2
canvas.paste(resized, (x_offset, y_offset))

# Save as PNG
canvas.save(out_path, "PNG", quality=100)
```

### Output Details

**Location:** `/Users/vadimkus/Desktop/screens/resized/`

**Format:** PNG

**Dimensions:** 1284 × 2778px (exact)

**Actual Image Size:** ~1277 × 2778px (centered with ~3.5px white border on each side)

**File Sizes:** 656 KB - 1.4 MB per screenshot

---

## Results

### Successfully Resized Files

| Original File | Resized File | Dimensions | File Size |
|--------------|--------------|------------|-----------|
| `1.jpeg` | `1.png` | 1284×2778 | 944 KB |
| `2.jpeg` | `2.png` | 1284×2778 | 872 KB |
| `3.jpeg` | `3.png` | 1284×2778 | 848 KB |
| `4.jpeg` | `4.png` | 1284×2778 | 708 KB |
| `5.jpeg` | `5.png` | 1284×2778 | 1.4 MB |
| `6.jpeg` | `6.png` | 1284×2778 | 716 KB |
| `7.jpeg` | `7.png` | 1284×2778 | 656 KB |
| `9.jpeg` | `9.png` | 1284×2778 | 980 KB |
| `10.jpeg` | `10.png` | 1284×2778 | 712 KB |
| `11.jpeg` | `11.png` | 1284×2778 | 1.4 MB |
| `12.jpeg` | `12.png` | 1284×2778 | 1.4 MB |

**Total:** 11 screenshots successfully resized

---

## Quality Assessment

### Visual Quality
- ✅ High-quality upscaling using Lanczos algorithm
- ✅ No visible distortion or pixelation
- ✅ Text remains crisp and readable
- ✅ Product images maintain clarity
- ✅ UI elements properly scaled

### White Border
- Minimal white border (~3.5px on each side)
- Invisible against app's white background
- Maintains exact Apple-required dimensions

### Color Accuracy
- RGB color space preserved
- No color shifts or artifacts
- Consistent with original screenshots

---

## Upload to App Store Connect

### Steps to Upload

1. **Navigate to App Store Connect**
   - Go to: https://appstoreconnect.apple.com/apps/6756648064/distribution/ios/version/inflight

2. **Select Screenshots Section**
   - Find the "Screenshots" section for iPhone 6.7" display

3. **Upload Files**
   - Drag and drop up to **10 screenshots** from `/Users/vadimkus/Desktop/screens/resized/`
   - Apple accepts PNG format (our files are PNG)
   - Maximum 10 screenshots per size class

4. **Select Best 10 Screenshots**
   - You have 11 screenshots, so choose the best 10
   - Recommended order:
     1. Home/Shop page
     2. Product detail page
     3. Shopping bag/cart
     4. Checkout page
     5. Orders list
     6. Order detail
     7. Profile page
     8. Additional feature screens
     9. Additional feature screens
     10. Additional feature screens

5. **Verify Upload**
   - Check that all screenshots display correctly
   - Verify dimensions are correct (1284 × 2778px)
   - Ensure no cropping or distortion

---

## Technical Details

### Tools Available on macOS

**Option 1: Python + Pillow (Used)**
```bash
python3 -c "from PIL import Image; print('Pillow available')"
```
- ✅ High-quality resizing
- ✅ Precise control
- ✅ Batch processing
- ✅ Cross-platform

**Option 2: macOS Built-in (sips)**
```bash
sips -z 2778 1284 input.jpeg --out output.png
```
- ✅ Built-in, no dependencies
- ⚠️ Less control over quality
- ⚠️ May require manual centering

**Option 3: ImageMagick**
```bash
convert input.jpeg -resize 1284x2778 -background white -gravity center -extent 1284x2778 output.png
```
- ✅ Powerful features
- ❌ Requires installation

### Verification Commands

**Check dimensions:**
```bash
sips -g pixelWidth -g pixelHeight screenshot.png
```

**List all resized files:**
```bash
ls -lh /Users/vadimkus/Desktop/screens/resized/*.png
```

**Verify file count:**
```bash
ls /Users/vadimkus/Desktop/screens/resized/*.png | wc -l
```

---

## Future Reference

### When to Resize Screenshots

- Before App Store submission
- When updating app screenshots
- When adding new device size classes
- When screenshots are captured at wrong resolution

### Quick Resize Script

Save this script for future use:

```python
#!/usr/bin/env python3
"""
Resize screenshots for Apple App Store submission.
Usage: python3 resize_screenshots.py <input_dir> <output_dir>
"""

from PIL import Image
import os
import sys

TARGET_W = 1284  # iPhone 6.7" width
TARGET_H = 2778  # iPhone 6.7" height

def resize_screenshot(src_path, out_path):
    """Resize a single screenshot to Apple App Store requirements."""
    img = Image.open(src_path).convert("RGB")
    orig_w, orig_h = img.size
    
    # Calculate scale to fit within target while maintaining aspect ratio
    scale_w = TARGET_W / orig_w
    scale_h = TARGET_H / orig_h
    scale = min(scale_w, scale_h)
    
    new_w = int(orig_w * scale)
    new_h = int(orig_h * scale)
    
    # High-quality resize
    resized = img.resize((new_w, new_h), Image.LANCZOS)
    
    # Create white canvas at exact target size
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), (255, 255, 255))
    
    # Center the resized image on canvas
    x_offset = (TARGET_W - new_w) // 2
    y_offset = (TARGET_H - new_h) // 2
    canvas.paste(resized, (x_offset, y_offset))
    
    # Save as PNG
    canvas.save(out_path, "PNG", quality=100)
    return (orig_w, orig_h), (new_w, new_h)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 resize_screenshots.py <input_dir> <output_dir>")
        sys.exit(1)
    
    src_dir = sys.argv[1]
    out_dir = sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    
    files = sorted([f for f in os.listdir(src_dir) 
                   if f.lower().endswith(('.jpeg', '.jpg', '.png'))])
    
    for fname in files:
        src_path = os.path.join(src_dir, fname)
        out_name = os.path.splitext(fname)[0] + ".png"
        out_path = os.path.join(out_dir, out_name)
        
        orig_size, scaled_size = resize_screenshot(src_path, out_path)
        print(f"✓ {fname} {orig_size[0]}x{orig_size[1]} → {out_name} "
              f"({TARGET_W}x{TARGET_H}), scaled to {scaled_size[0]}x{scaled_size[1]}")
    
    print(f"\nDone! {len(files)} screenshots saved to {out_dir}")
```

---

## Troubleshooting

### Issue: Screenshots appear stretched
**Solution:** Ensure aspect ratio is maintained during resize. Use Lanczos or other high-quality resampling.

### Issue: White borders too visible
**Solution:** If app has colored background, consider cropping original to exact aspect ratio before resizing.

### Issue: File size too large
**Solution:** PNG files can be optimized using tools like `pngquant` or `optipng`:
```bash
optipng -o7 screenshot.png
```

### Issue: Wrong dimensions after resize
**Solution:** Verify target dimensions match Apple requirements exactly. Use verification commands above.

---

## Related Documentation

- [Screenshot Guide](./SCREENSHOT_GUIDE.md) - General screenshot capture guide
- [App Store Assets](../app-store/APP_STORE_ASSETS.md) - App Store asset requirements
- [Upload Ready](./UPLOAD_READY.md) - Upload checklist

---

## Summary

✅ **11 screenshots** successfully resized from 736×1600px to **1284×2778px**  
✅ All files saved as **PNG format** (Apple preferred)  
✅ High-quality upscaling using **Lanczos algorithm**  
✅ Files ready for upload to **App Store Connect**  
✅ Located at: `/Users/vadimkus/Desktop/screens/resized/`

**Next Steps:**
1. Select best 10 screenshots from the 11 available
2. Upload to App Store Connect
3. Verify display in App Store Connect preview
4. Complete app submission

---

**Last Updated:** February 9, 2026
