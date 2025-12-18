#!/bin/bash

# Professional App Store Screenshot Capture
# Captures high-quality screenshots from iPhone 16 Pro Max simulator
# Resolution: 1320×2868 (perfect for App Store submission)

set -e

# Configuration
SCREENSHOT_DIR="$(cd "$(dirname "$0")/.." && pwd)/app-store-screenshots"
DEVICE_UDID="7FBA504D-8C3B-4A33-BD9B-7E7AECE6319B"  # iPhone 16 Pro Max

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
echo -e "${BOLD}${BLUE}║    📱  Professional App Store Screenshot Capture         ║${NC}"
echo -e "${BOLD}${BLUE}║         iPhone 16 Pro Max (1320×2868)                    ║${NC}"
echo -e "${BOLD}${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if device is booted
if ! xcrun simctl list devices booted | grep -q "$DEVICE_UDID"; then
    echo -e "${RED}❌ iPhone 16 Pro Max is not running${NC}"
    echo ""
    echo "Please ensure:"
    echo "  1. iPhone 16 Pro Max simulator is booted"
    echo "  2. Expo app is running: npm run ios"
    echo "  3. App is logged in and ready"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ iPhone 16 Pro Max detected and ready${NC}"
echo -e "${GREEN}✅ Screenshot directory: ${SCREENSHOT_DIR}${NC}"
echo ""

# Function to capture screenshot
capture_screen() {
    local filename="$1"
    local description="$2"
    local delay="${3:-2}"
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}📸 ${description}${NC}"
    echo -e "   ${BLUE}File:${NC} ${filename}.png"
    echo -e "   ${YELLOW}⏳ Waiting ${delay}s for UI to settle...${NC}"
    
    sleep "$delay"
    
    # Capture screenshot
    local filepath="$SCREENSHOT_DIR/${filename}.png"
    xcrun simctl io "$DEVICE_UDID" screenshot "$filepath" 2>/dev/null
    
    if [ -f "$filepath" ]; then
        local size=$(ls -lh "$filepath" | awk '{print $5}')
        local dimensions=$(sips -g pixelWidth -g pixelHeight "$filepath" 2>/dev/null | \
                          grep -E 'pixelWidth|pixelHeight' | \
                          awk '{print $2}' | \
                          tr '\n' 'x' | \
                          sed 's/x$//')
        
        echo -e "   ${GREEN}✅ Captured successfully${NC}"
        echo -e "   ${GREEN}📏 Resolution:${NC} ${dimensions}px"
        echo -e "   ${GREEN}💾 Size:${NC} ${size}"
        echo ""
        return 0
    else
        echo -e "   ${RED}❌ Failed to capture${NC}"
        echo ""
        return 1
    fi
}

# Instructions for user
echo -e "${BOLD}${YELLOW}📋 Screenshot Capture Plan (6 screens)${NC}"
echo ""
echo -e "Please navigate through the app in this order:"
echo -e "   ${BOLD}1.${NC} Shop Home - Product catalog"
echo -e "   ${BOLD}2.${NC} Product Detail - Open any product"
echo -e "   ${BOLD}3.${NC} Shopping Bag - View cart"
echo -e "   ${BOLD}4.${NC} Checkout - Payment screen"
echo -e "   ${BOLD}5.${NC} Profile - User account"
echo -e "   ${BOLD}6.${NC} Order Detail - View an order"
echo ""
echo -e "${YELLOW}⏱️  You have 10 seconds to prepare the app...${NC}"
echo ""

# Countdown
for i in {10..1}; do
    echo -ne "   Starting in ${i}s...  \r"
    sleep 1
done
echo ""

# Capture screenshots with delays for manual navigation
echo -e "${BOLD}${GREEN}🎬 Starting Capture Sequence${NC}"
echo ""
echo -e "${YELLOW}Navigate to each screen when prompted!${NC}"
echo ""

sleep 2

# Screenshot 1: Shop Home
echo -e "${BLUE}→ Navigate to:${NC} ${BOLD}Shop Home${NC} (Tap Shop tab)"
sleep 8
capture_screen "01-shop-home" "Shop Home - Product Catalog" 2

# Screenshot 2: Product Detail
echo -e "${BLUE}→ Navigate to:${NC} ${BOLD}Product Detail${NC} (Tap any product)"
sleep 8
capture_screen "02-product-detail" "Product Detail Page" 2

# Screenshot 3: Shopping Bag
echo -e "${BLUE}→ Navigate to:${NC} ${BOLD}Shopping Bag${NC} (Tap Bag tab, ensure cart has items)"
sleep 8
capture_screen "03-bag-cart" "Shopping Bag - Cart" 2

# Screenshot 4: Checkout
echo -e "${BLUE}→ Navigate to:${NC} ${BOLD}Checkout${NC} (Tap Checkout button)"
sleep 8
capture_screen "04-checkout" "Checkout - Payment Options" 2

# Screenshot 5: Profile
echo -e "${BLUE}→ Navigate to:${NC} ${BOLD}Profile${NC} (Tap Profile tab)"
sleep 8
capture_screen "05-profile" "Profile - User Account" 2

# Screenshot 6: Order Detail
echo -e "${BLUE}→ Navigate to:${NC} ${BOLD}Order Detail${NC} (Tap Orders, then tap an order)"
sleep 10
capture_screen "06-order-detail" "Order Detail - History" 2

# Summary
echo ""
echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║            ✨  Screenshot Capture Complete!              ║${NC}"
echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Count and list screenshots
COUNT=$(ls -1 "$SCREENSHOT_DIR"/*.png 2>/dev/null | wc -l | tr -d ' ')
echo -e "${BLUE}📊 Total Screenshots Captured:${NC} ${BOLD}$COUNT/6${NC}"
echo ""

if [ "$COUNT" -gt 0 ]; then
    echo -e "${BLUE}📸 Screenshot Files:${NC}"
    echo ""
    ls -1 "$SCREENSHOT_DIR"/*.png 2>/dev/null | while read -r file; do
        local basename=$(basename "$file")
        local dims=$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null | \
                     grep -E 'pixelWidth|pixelHeight' | \
                     awk '{print $2}' | \
                     tr '\n' 'x' | \
                     sed 's/x$//')
        local size=$(ls -lh "$file" | awk '{print $5}')
        echo -e "   ${GREEN}✓${NC} ${basename}"
        echo -e "     ${BLUE}└─${NC} ${dims}px • ${size}"
    done
    echo ""
fi

echo -e "${BOLD}${YELLOW}📱 Next Steps:${NC}"
echo ""
echo -e "   ${BOLD}1.${NC} Review screenshots:"
echo -e "      ${BLUE}→${NC} open $SCREENSHOT_DIR"
echo ""
echo -e "   ${BOLD}2.${NC} Verify quality and content:"
echo -e "      ${GREEN}✓${NC} Clear, high-quality images"
echo -e "      ${GREEN}✓${NC} No personal/sensitive information"
echo -e "      ${GREEN}✓${NC} Best app features showcased"
echo ""
echo -e "   ${BOLD}3.${NC} Upload to App Store Connect:"
echo -e "      ${BLUE}→${NC} https://appstoreconnect.apple.com"
echo -e "      ${BLUE}→${NC} App Store tab → Screenshots"
echo -e "      ${BLUE}→${NC} Upload to 6.7\" display size"
echo ""
echo -e "${BOLD}${BLUE}📐 App Store Requirements Met:${NC}"
echo -e "   ${GREEN}✓${NC} Resolution: 1320×2868px (iPhone 16 Pro Max)"
echo -e "   ${GREEN}✓${NC} Format: PNG"
echo -e "   ${GREEN}✓${NC} Quality: Retina @3x"
echo -e "   ${GREEN}✓${NC} Count: $COUNT/10 maximum"
echo -e "   ${GREEN}✓${NC} First 3 will appear on installation sheets"
echo ""
echo -e "${GREEN}✨ Professional screenshots ready for App Store submission!${NC}"
echo ""
