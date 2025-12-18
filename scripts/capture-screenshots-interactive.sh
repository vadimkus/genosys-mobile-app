#!/bin/bash

# App Store Screenshot Capture - Interactive Guide
# This script helps you manually capture professional screenshots for App Store submission

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCREENSHOT_DIR="$(cd "$(dirname "$0")/.." && pwd)/app-store-screenshots"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      App Store Screenshot Capture Guide               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ensure directory exists
mkdir -p "$SCREENSHOT_DIR"
echo -e "${GREEN}✅ Screenshot directory ready:${NC} $SCREENSHOT_DIR"
echo ""

# Check for booted simulator
DEVICE=$(xcrun simctl list devices | grep "Booted" | head -1 || true)

if [ -z "$DEVICE" ]; then
    echo -e "${RED}❌ No simulator is currently running.${NC}"
    echo ""
    echo "Please start the iOS simulator first:"
    echo "  1. Open Expo: npm run ios"
    echo "  2. Or manually: open -a Simulator"
    echo "  3. Then run this script again"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Found running simulator${NC}"
echo "$DEVICE"
echo ""

# Get device UDID
UDID=$(echo "$DEVICE" | grep -o '([A-F0-9-]\{36\})' | tr -d '()')

echo -e "${YELLOW}📋 Screenshot Plan (6 screens):${NC}"
echo ""
echo "   1. Shop Home - Product catalog with discounts"
echo "   2. Product Detail - Product info with Add to Bag button"
echo "   3. Shopping Bag - Cart with items and totals"
echo "   4. Checkout - Apple Pay and delivery options"
echo "   5. Profile - User account screen"
echo "   6. Order Detail - Order history with discount breakdown"
echo ""

# Screenshots to capture
declare -a SCREENSHOTS=(
    "01-shop-home:Navigate to Shop tab → Show product grid"
    "02-product-detail:Open a product → Show product details"
    "03-bag-cart:Go to Bag tab → Show cart with items"
    "04-checkout:Tap Checkout → Show payment options"
    "05-profile:Go to Profile tab → Show user info"
    "06-order-detail:Tap an order → Show order details"
)

echo -e "${BLUE}🎬 Starting Interactive Capture${NC}"
echo ""
echo "Press ENTER after navigating to each screen..."
echo ""

for i in "${!SCREENSHOTS[@]}"; do
    IFS=':' read -r filename instruction <<< "${SCREENSHOTS[$i]}"
    
    NUM=$((i + 1))
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Screenshot ${NUM}/6:${NC} ${filename}.png"
    echo -e "${GREEN}📝 Instructions:${NC} $instruction"
    echo ""
    echo -n "Press ENTER when ready to capture... "
    read
    
    # Capture screenshot
    FILEPATH="$SCREENSHOT_DIR/${filename}.png"
    xcrun simctl io "$UDID" screenshot "$FILEPATH" 2>/dev/null
    
    if [ -f "$FILEPATH" ]; then
        SIZE=$(ls -lh "$FILEPATH" | awk '{print $5}')
        DIMENSIONS=$(sips -g pixelWidth -g pixelHeight "$FILEPATH" 2>/dev/null | grep -E 'pixelWidth|pixelHeight' | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
        echo -e "${GREEN}   ✅ Captured:${NC} $FILEPATH"
        echo -e "${GREEN}   📏 Size:${NC} ${DIMENSIONS} (${SIZE})"
    else
        echo -e "${RED}   ❌ Failed to capture screenshot${NC}"
    fi
    echo ""
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║             Screenshot Capture Complete!              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📁 Location:${NC} $SCREENSHOT_DIR"
echo ""

# Count captured screenshots
COUNT=$(ls -1 "$SCREENSHOT_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}📊 Total Screenshots:${NC} $COUNT"
echo ""

if [ "$COUNT" -gt 0 ]; then
    echo -e "${BLUE}📸 Captured Files:${NC}"
    ls -1 "$SCREENSHOT_DIR"/*.png | while read -r file; do
        BASENAME=$(basename "$file")
        DIMS=$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null | grep -E 'pixelWidth|pixelHeight' | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
        echo "   • $BASENAME ($DIMS)"
    done
    echo ""
fi

echo -e "${YELLOW}📱 Next Steps:${NC}"
echo "   1. Review screenshots in: app-store-screenshots/"
echo "   2. Open folder: open $SCREENSHOT_DIR"
echo "   3. Verify quality and content"
echo "   4. Upload to App Store Connect"
echo ""
echo -e "${BLUE}💡 App Store Requirements:${NC}"
echo "   • Accepted sizes: 1242×2688, 1284×2778, 2778×1284"
echo "   • Up to 10 screenshots per localization"
echo "   • First 3 screenshots shown on installation sheets"
echo "   • PNG or JPG format"
echo ""
echo -e "${GREEN}✨ All done! Screenshots are ready for submission.${NC}"
echo ""
