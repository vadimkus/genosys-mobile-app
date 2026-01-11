#!/bin/bash

# iPad Pro 13-inch Screenshot Capture Script
# Captures screenshots for App Store Connect (2048 × 2732 pixels)

set -e

# Configuration
SCREENSHOT_DIR="$(cd "$(dirname "$0")/.." && pwd)/app-store-assets/screenshots/ipad-12.9"
DEVICE_NAME="iPad Pro 13-inch"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Ensure directory exists
mkdir -p "$SCREENSHOT_DIR"

echo ""
echo -e "${BOLD}${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║    📱  iPad Pro 13-inch Screenshot Capture              ║${NC}"
echo -e "${BOLD}${BLUE}║         Resolution: 2048 × 2732 pixels                  ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if iPad simulator is booted
if ! xcrun simctl list devices booted | grep -qi "iPad Pro 13-inch"; then
    echo -e "${RED}❌ iPad Pro 13-inch simulator is not running${NC}"
    echo ""
    echo "Please ensure:"
    echo "  1. iPad Pro 13-inch simulator is booted"
    echo "  2. Expo app is running: npm start"
    echo "  3. Press 'i' in Expo CLI to open app on iPad"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ iPad Pro 13-inch detected${NC}"
echo -e "${GREEN}✅ Screenshot directory: ${SCREENSHOT_DIR}${NC}"
echo ""

# Function to capture screenshot
capture_screen() {
    local filename="$1"
    local description="$2"
    local output_file="${SCREENSHOT_DIR}/${filename}.png"
    
    echo -e "${YELLOW}📸 Ready to capture: ${description}${NC}"
    echo -e "${BLUE}   → File: ${filename}.png${NC}"
    echo ""
    echo "Please:"
    echo "  1. Navigate to the screen in your app"
    echo "  2. Wait for the screen to fully load"
    echo "  3. Press ENTER to capture..."
    read -r
    
    xcrun simctl io booted screenshot "$output_file"
    
    # Verify dimensions
    if command -v sips >/dev/null 2>&1; then
        local width=$(sips -g pixelWidth "$output_file" | tail -1 | awk '{print $2}')
        local height=$(sips -g pixelHeight "$output_file" | tail -1 | awk '{print $2}')
        echo -e "${GREEN}✅ Captured: ${width} × ${height} pixels${NC}"
        
        if [ "$width" = "2048" ] && [ "$height" = "2732" ]; then
            echo -e "${GREEN}✅ Perfect dimensions for App Store!${NC}"
        else
            echo -e "${YELLOW}⚠️  Expected 2048 × 2732, got ${width} × ${height}${NC}"
        fi
    fi
    
    echo ""
    sleep 1
}

# Screenshot plan
echo -e "${BOLD}We'll capture the following screenshots:${NC}"
echo ""
echo "  1. Shop Home - Product catalog"
echo "  2. Product Detail - Product page"
echo "  3. Shopping Bag - Cart with items"
echo "  4. Checkout - Checkout screen"
echo "  5. Profile - User account"
echo ""
echo -e "${YELLOW}Press ENTER to start capturing screenshots...${NC}"
read -r

# Capture screenshots
capture_screen "01-home" "Shop Home - Product catalog with categories"
capture_screen "02-product" "Product Detail - Product information page"
capture_screen "03-bag" "Shopping Bag - Cart with items and totals"
capture_screen "04-checkout" "Checkout - Payment and delivery options"
capture_screen "05-profile" "Profile - User account and settings"

echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║    ✅  Screenshot Capture Complete!                     ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Screenshots saved to: ${SCREENSHOT_DIR}${NC}"
echo ""
echo "Next steps:"
echo "  1. Review screenshots in: ${SCREENSHOT_DIR}"
echo "  2. Upload to App Store Connect → iPad Pro (12.9-inch)"
echo "  3. Minimum 1 screenshot required, 3-10 recommended"
echo ""


