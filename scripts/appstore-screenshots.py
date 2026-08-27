#!/usr/bin/env python3
"""
Build App Store Connect screenshot sets from the shots in `raw/`.

App Store Connect keeps a separate set per localisation and rejects anything
that is not exactly one of its accepted pixel sizes. This sorts the raw shots
into an English and a Russian set, orders each so the strongest lands first,
and writes both accepted iPhone sizes.

## About the upscale

These particular shots arrived over WhatsApp, which resampled them to 589x1280
and compressed them to about 60KB. The smallest size the App Store accepts is
1242x2688, so they have to be enlarged 2.1x. That is a real quality loss and no
resampler recovers detail that is no longer in the file.

What this does instead of a plain resize:

  - Lanczos rather than the bilinear default, which holds edges together
    noticeably better at this ratio.
  - A restrained unsharp mask afterwards. Upscaling softens edges; a little
    sharpening puts back the *appearance* of an edge. Too much turns JPEG
    blocking into visible crunch, so the radius is small and the threshold is
    high enough to leave flat areas alone.
  - PNG out, so nothing is compressed a second time.

The result is the best available from this source. It is not the same as
screenshots taken off the device, and it is worth replacing when originals can
be AirDropped.

  python3 scripts/appstore-screenshots.py
"""

import os
import sys

from PIL import Image, ImageFilter

BASE = os.path.expanduser("~/Desktop/GENOSYS App Store Screenshots")
RAW = os.path.join(BASE, "raw")

SIZES = [("6.5-inch", 1242, 2688), ("6.9-inch", 1290, 2796)]

# Ordered deliberately. App Store Connect shows the first two or three at the
# top of the product page, so those carry the pitch: what the shop looks like,
# what buying looks like, and the one thing no competitor has.
SETS = {
    "en": [
        ("17.46.53", "01-home"),
        ("17.47.09", "02-product"),
        ("18.03.17", "03-lock-screen-order-card"),
        ("17.47.43", "04-bag"),
        ("17.48.03", "05-checkout"),
        ("17.50.09", "06-skin-concern"),
        ("17.47.20", "07-account"),
    ],
    "ru": [
        ("19.23.03", "01-home"),
        ("17.49.51", "02-product"),
        ("19.23.44", "03-orders"),
        ("19.23.10", "04-bag"),
    ],
}


def find(stamp):
    for name in sorted(os.listdir(RAW)):
        if stamp in name and not name.startswith("."):
            return os.path.join(RAW, name)
    return None


def convert(src, dest, width, height):
    with Image.open(src) as img:
        img = img.convert("RGB")
        scale = max(width / img.width, height / img.height)
        big = img.resize(
            (round(img.width * scale), round(img.height * scale)), Image.LANCZOS
        )
        # Centre-crop the sliver the aspect difference leaves over. Every
        # accepted iPhone size is within 0.2% of the same ratio, so this trims
        # a pixel or two rather than any content.
        left = (big.width - width) // 2
        top = (big.height - height) // 2
        out = big.crop((left, top, left + width, top + height))
        out = out.filter(ImageFilter.UnsharpMask(radius=1.4, percent=95, threshold=4))
        out.save(dest, "PNG", optimize=True)


def main():
    if not os.path.isdir(RAW):
        sys.exit(f"No raw folder at {RAW}")

    for locale, shots in SETS.items():
        for label, width, height in SIZES:
            out_dir = os.path.join(BASE, label, locale)
            os.makedirs(out_dir, exist_ok=True)
            for old in os.listdir(out_dir):
                if old.endswith(".png"):
                    os.remove(os.path.join(out_dir, old))

        print(f"{locale}:")
        for stamp, name in shots:
            src = find(stamp)
            if not src:
                print(f"   missing  {stamp}  {name}")
                continue
            with Image.open(src) as probe:
                source_dims = f"{probe.width}x{probe.height}"
            for label, width, height in SIZES:
                dest = os.path.join(BASE, label, locale, f"{name}.png")
                convert(src, dest, width, height)
            print(f"   {name:<28} from {source_dims}")
        print()

    print("Upload each locale folder to its matching localisation in App Store Connect.")


if __name__ == "__main__":
    main()
