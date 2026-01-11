#!/bin/bash

# Recapture Profile and Order Detail screenshots
# For App Store Connect submission

set -e

SCREENSHOT_DIR="$(cd "$(dirname "$0")/.." && pwd)/app-store-screenshots"
APPSTORE_DIR="$SCREENSHOT_DIR/appstore-ready"
DEVICE_UDID="7FBA504D-8C3B-4A33-BD9B-7E7AECE6319B"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║    📸 Recapture Profile & Order Detail                   ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check device
if ! xcrun simctl list devices booted | grep -q "$DEVICE_UDID"; then
    echo -e "${RED}❌ iPhone 16 Pro Max is not running${NC}"
    echo ""
    echo "Please start the simulator:"
    echo "  npm run ios"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ iPhone 16 Pro Max ready${NC}"
echo -e "${GREEN}✅ Screenshots: Profile & Order Detail${NC}"
echo ""

# ============================================================
# Screenshot 5: Profile
# ============================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}Screenshot 5: Profile - User Account${NC}"
echo ""
echo -e "${YELLOW}📱 Instructions:${NC}"
echo "   1. Navigate to Profile tab (bottom navigation)"
echo "   2. Make sure profile is fully loaded"
echo "   3. Scroll to top of page"
echo "   4. Ensure clean, professional appearance"
echo ""
echo -e "${YELLOW}⏱️  You have 15 seconds to prepare...${NC}"
echo ""

# Countdown
for i in {15..1}; do
    echo -ne "   Capturing in ${i}s...  \r"
    sleep 1
done
echo ""

# Capture
echo -e "${BLUE}📸 Capturing Profile screenshot...${NC}"
sleep 2
xcrun simctl io "$DEVICE_UDID" screenshot "$SCREENSHOT_DIR/05-profile.png" 2>/dev/null

if [ -f "$SCREENSHOT_DIR/05-profile.png" ]; then
    dims=$(sips -g pixelWidth -g pixelHeight "$SCREENSHOT_DIR/05-profile.png" 2>/dev/null | \
           grep -E 'pixelWidth|pixelHeight' | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
    size=$(ls -lh "$SCREENSHOT_DIR/05-profile.png" | awk '{print $5}')
    echo -e "   ${GREEN}✅ Captured: ${dims}px (${size})${NC}"
else
    echo -e "   ${RED}❌ Failed to capture${NC}"
fi
echo ""

# ============================================================
# Screenshot 6: Order Detail
# ============================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}Screenshot 6: Order Detail - History${NC}"
echo ""
echo -e "${YELLOW}📱 Instructions:${NC}"
echo "   1. From Profile, tap 'Orders'"
echo "   2. Tap on any order to view details"
echo "   3. Scroll to show:"
echo "      • Order status and payment method"
echo "      • Product items with images"
echo "      • Discount breakdown (if applicable)"
echo "      • Order totals"
echo "   4. Ensure all information is clearly visible"
echo ""
echo -e "${YELLOW}⏱️  You have 15 seconds to prepare...${NC}"
echo ""

# Countdown
for i in {15..1}; do
    echo -ne "   Capturing in ${i}s...  \r"
    sleep 1
done
echo ""

# Capture
echo -e "${BLUE}📸 Capturing Order Detail screenshot...${NC}"
sleep 2
xcrun simctl io "$DEVICE_UDID" screenshot "$SCREENSHOT_DIR/06-order-detail.png" 2>/dev/null

if [ -f "$SCREENSHOT_DIR/06-order-detail.png" ]; then
    dims=$(sips -g pixelWidth -g pixelHeight "$SCREENSHOT_DIR/06-order-detail.png" 2>/dev/null | \
           grep -E 'pixelWidth|pixelHeight' | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
    size=$(ls -lh "$SCREENSHOT_DIR/06-order-detail.png" | awk '{print $5}')
    echo -e "   ${GREEN}✅ Captured: ${dims}px (${size})${NC}"
else
    echo -e "   ${RED}❌ Failed to capture${NC}"
fi
echo ""

# ============================================================
# Convert to App Store Format
# ============================================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}Converting to App Store Format (1284×2778px)${NC}"
echo ""

CONVERTED=0

# Convert profile
if [ -f "$SCREENSHOT_DIR/05-profile.png" ]; then
    echo -e "${BLUE}Converting:${NC} 05-profile.png → 1284×2778px"
    sips -z 2778 1284 "$SCREENSHOT_DIR/05-profile.png" --out "$APPSTORE_DIR/05-profile.png" >/dev/null 2>&1
    
    if [ -f "$APPSTORE_DIR/05-profile.png" ]; then
        size=$(ls -lh "$APPSTORE_DIR/05-profile.png" | awk '{print $5}')
        echo -e "   ${GREEN}✅ Converted successfully (${size})${NC}"
        ((CONVERTED++))
    else
        echo -e "   ${RED}❌ Conversion failed${NC}"
    fi
fi

# Convert order detail
if [ -f "$SCREENSHOT_DIR/06-order-detail.png" ]; then
    echo -e "${BLUE}Converting:${NC} 06-order-detail.png → 1284×2778px"
    sips -z 2778 1284 "$SCREENSHOT_DIR/06-order-detail.png" --out "$APPSTORE_DIR/06-order-detail.png" >/dev/null 2>&1
    
    if [ -f "$APPSTORE_DIR/06-order-detail.png" ]; then
        size=$(ls -lh "$APPSTORE_DIR/06-order-detail.png" | awk '{print $5}')
        echo -e "   ${GREEN}✅ Converted successfully (${size})${NC}"
        ((CONVERTED++))
    else
        echo -e "   ${RED}❌ Conversion failed${NC}"
    fi
fi

echo ""

# ============================================================
# Summary
# ============================================================

echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║            ✨ Recapture Complete!                        ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 Summary:${NC}"
echo "   • Screenshots recaptured: 2/2"
echo "   • Converted to App Store format: $CONVERTED/2"
echo ""

echo -e "${BLUE}📂 Updated Files (Original):${NC}"
echo "   • $SCREENSHOT_DIR/05-profile.png"
echo "   • $SCREENSHOT_DIR/06-order-detail.png"
echo ""

echo -e "${BOLD}${BLUE}📁 App Store Ready (Upload These):${NC}"
echo "   • $APPSTORE_DIR/05-profile.png"
echo "   • $APPSTORE_DIR/06-order-detail.png"
echo ""

if [ "$CONVERTED" -eq 2 ]; then
    echo -e "${GREEN}✅ Both screenshots ready for App Store Connect!${NC}"
    echo ""
    echo -e "${YELLOW}📱 Next Steps:${NC}"
    echo "   1. Review screenshots: open $APPSTORE_DIR"
    echo "   2. Upload to App Store Connect (replace existing)"
    echo "   3. Verify order and appearance"
    echo ""
else
    echo -e "${YELLOW}⚠️  Some conversions failed. Please check the files.${NC}"
    echo ""
fi


