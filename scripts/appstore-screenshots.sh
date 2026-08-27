#!/bin/bash
#
# Turn raw iPhone screenshots into App Store Connect uploads.
#
# App Store Connect rejects anything that is not exactly one of its accepted
# pixel sizes, and it will not resize for you. This does, using sips, which
# ships with macOS - no Homebrew, no ImageMagick.
#
#   ~/Desktop/GENOSYS App Store Screenshots/
#     raw/          drop screenshots straight off the phone here
#     6.5-inch/     1242 x 2688   iPhone 11 Pro Max, XS Max
#     6.9-inch/     1290 x 2796   iPhone 16 Pro Max, 15 Pro Max
#
# Every accepted iPhone size is within 0.2% of the same aspect ratio, so a
# straight resize is safe: nothing is stretched enough to see, and nothing is
# cropped. Screenshots taken on any modern iPhone will convert cleanly.
#
#   bash scripts/appstore-screenshots.sh

set -e

BASE="$HOME/Desktop/GENOSYS App Store Screenshots"
RAW="$BASE/raw"

shopt -s nullglob
FILES=("$RAW"/*.png "$RAW"/*.PNG "$RAW"/*.jpg "$RAW"/*.jpeg "$RAW"/*.JPG)

if [ ${#FILES[@]} -eq 0 ]; then
  echo "No screenshots in:"
  echo "  $RAW"
  echo
  echo "Drop them there and run this again."
  exit 0
fi

echo "Found ${#FILES[@]} screenshot(s)."
echo

convert_set() {
  local label="$1" width="$2" height="$3"
  local out="$BASE/$label"
  mkdir -p "$out"
  rm -f "$out"/*.png 2>/dev/null || true

  echo "$label  ->  ${width} x ${height}"
  local n=1
  for f in "${FILES[@]}"; do
    # Numbered so the upload order matches the order they were captured in.
    local name
    name=$(printf "%02d-%s" "$n" "$(basename "${f%.*}" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')")
    cp "$f" "$out/$name.png"
    sips -s format png -z "$height" "$width" "$out/$name.png" >/dev/null 2>&1
    local got
    got=$(sips -g pixelWidth -g pixelHeight "$out/$name.png" | awk '/pixel/ {printf "%s ", $2}')
    echo "   $name.png  ($got)"
    n=$((n + 1))
  done
  echo
}

convert_set "6.5-inch" 1242 2688
convert_set "6.9-inch" 1290 2796

echo "Done. Upload the folder that matches the slot in App Store Connect."
