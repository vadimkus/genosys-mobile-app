#!/usr/bin/env bash
set -euo pipefail

# Capture an iOS Simulator screenshot into app-store-assets/screenshots/<device-set>/<name>.png
#
# Usage:
#   ./scripts/appstore/capture-ios-screenshot.sh iphone-6.7 01-home
#
# Notes:
# - Captures the currently booted simulator (`xcrun simctl io booted screenshot ...`)
# - You must manually navigate the app to the desired screen first.

DEVICE_SET="${1:-}"
NAME="${2:-}"

if [[ -z "$DEVICE_SET" || -z "$NAME" ]]; then
  echo "Usage: $0 <device-set> <name-without-extension>"
  echo "Example: $0 iphone-6.7 01-home"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="${ROOT_DIR}/app-store-assets/screenshots/${DEVICE_SET}"
OUT_FILE="${OUT_DIR}/${NAME}.png"

mkdir -p "$OUT_DIR"

if ! xcrun simctl list devices booted | grep -q "Booted"; then
  echo "No booted iOS Simulator found."
  echo "Open Simulator and boot a device first."
  exit 1
fi

echo "Capturing screenshot to: ${OUT_FILE}"
xcrun simctl io booted screenshot "$OUT_FILE"
echo "Done."







