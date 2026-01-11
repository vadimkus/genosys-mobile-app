#!/bin/bash

# Genosys Mobile App Screenshot Capture Script
# This script helps you take screenshots for App Store submission

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Genosys iOS Screenshot Capture Tool        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Configuration
DEVICE_NAME="iPhone 15 Pro Max"
SCREENSHOT_DIR="app-store-screenshots/6.7-inch"
DEVICE_ID=""

# Create screenshot directory if it doesn't exist
mkdir -p "$SCREENSHOT_DIR"

echo -e "${GREEN}✓${NC} Screenshot directory ready: $SCREENSHOT_DIR"
echo ""

# Function to find device
find_device() {
    echo -e "${BLUE}→${NC} Looking for $DEVICE_NAME simulator..."
    DEVICE_ID=$(xcrun simctl list devices available | grep "$DEVICE_NAME" | grep -v "unavailable" | head -1 | grep -E -o '\(([A-Z0-9-]+)\)' | tr -d '()')
    
    if [ -z "$DEVICE_ID" ]; then
        echo -e "${RED}✗${NC} $DEVICE_NAME simulator not found!"
        echo ""
        echo "Available iPhone simulators:"
        xcrun simctl list devices available | grep "iPhone" | grep -v "unavailable"
        echo ""
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} Found device: $DEVICE_NAME ($DEVICE_ID)"
}

# Function to boot device
boot_device() {
    echo -e "${BLUE}→${NC} Checking device status..."
    
    STATUS=$(xcrun simctl list devices | grep "$DEVICE_ID" | grep -o "(Booted)" || echo "")
    
    if [ -z "$STATUS" ]; then
        echo -e "${YELLOW}!${NC} Device not booted. Booting $DEVICE_NAME..."
        xcrun simctl boot "$DEVICE_ID"
        sleep 3
        echo -e "${GREEN}✓${NC} Device booted"
    else
        echo -e "${GREEN}✓${NC} Device already booted"
    fi
}

# Function to open simulator
open_simulator() {
    echo -e "${BLUE}→${NC} Opening Simulator app..."
    open -a Simulator
    sleep 2
    echo -e "${GREEN}✓${NC} Simulator opened"
}

# Function to take screenshot
take_screenshot() {
    local screen_name=$1
    local filename=$2
    
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Screenshot ${filename}${NC}"
    echo -e "${YELLOW}Screen: ${screen_name}${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Instructions:${NC}"
    echo "1. Navigate to: ${screen_name}"
    echo "2. When ready, press ENTER to capture screenshot"
    echo "3. Or type 's' to skip this screenshot"
    echo ""
    read -p "Ready? (Enter to capture, 's' to skip): " choice
    
    if [ "$choice" = "s" ] || [ "$choice" = "S" ]; then
        echo -e "${YELLOW}⊗${NC} Skipped: $filename"
        return
    fi
    
    # Take screenshot
    xcrun simctl io "$DEVICE_ID" screenshot "$SCREENSHOT_DIR/$filename"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Saved: $SCREENSHOT_DIR/$filename"
    else
        echo -e "${RED}✗${NC} Failed to capture screenshot"
    fi
}

# Main execution
echo -e "${BLUE}Step 1: Finding and booting simulator...${NC}"
echo ""
find_device
boot_device
open_simulator

echo ""
echo -e "${GREEN}✓${NC} Simulator ready!"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}   Now start your app in the simulator        ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo ""
echo "In a separate terminal, run:"
echo -e "${BLUE}  cd /Users/vadimkus/genosys-mobile-app${NC}"
echo -e "${BLUE}  npx expo start${NC}"
echo -e "${BLUE}  Press 'i' to open in iOS simulator${NC}"
echo ""
read -p "Press ENTER when the app is loaded and ready..."

echo ""
echo -e "${GREEN}✓${NC} Ready to capture screenshots!"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}   We'll capture 10 screenshots now           ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Capture all 10 screenshots
take_screenshot "Home/Splash Screen" "01-splash-or-home.png"
take_screenshot "Shop - Product Grid" "02-shop-products.png"
take_screenshot "Product Detail Page" "03-product-detail.png"
take_screenshot "Shopping Bag with Items" "04-bag-cart.png"
take_screenshot "Checkout Delivery Form" "05-checkout.png"
take_screenshot "Payment Method Selection (show Apple Pay!)" "06-payment-methods.png"
take_screenshot "Orders List" "07-orders-list.png"
take_screenshot "Order Detail Page" "08-order-detail.png"
take_screenshot "Profile Page" "09-profile.png"
take_screenshot "About or Help/FAQ Page" "10-about-or-help.png"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Screenshot Capture Complete!               ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo "Screenshots saved to: $SCREENSHOT_DIR"
echo ""
echo "Captured screenshots:"
ls -lh "$SCREENSHOT_DIR"/*.png 2>/dev/null | wc -l | xargs echo "Total:"
echo ""
echo "Next steps:"
echo "1. Review screenshots: open $SCREENSHOT_DIR"
echo "2. Retake any if needed (run this script again)"
echo "3. Upload to App Store Connect"
echo ""
echo -e "${BLUE}Check screenshot dimensions:${NC}"
for file in "$SCREENSHOT_DIR"/*.png; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        dimensions=$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null | grep "pixel" | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
        echo "  $filename: $dimensions"
    fi
done
echo ""
echo -e "${GREEN}✓ Done!${NC}"


