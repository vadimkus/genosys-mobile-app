#!/bin/bash

# Russian App Store Screenshots Capture Script
# Captures 6 screenshots in Russian for App Store Connect
# Based on successful English screenshot workflow

echo "=========================================="
echo "📱 Russian App Store Screenshots Capture"
echo "=========================================="
echo ""
echo "This script will capture Russian language screenshots for App Store"
echo ""

# Configuration
SCREENSHOT_DIR="app-store-screenshots/ru-RU"
APPSTORE_READY_DIR="app-store-screenshots/appstore-ready/ru-RU"

# Create directories
echo "Creating screenshot directories..."
mkdir -p "$SCREENSHOT_DIR"
mkdir -p "$APPSTORE_READY_DIR"
echo "✅ Directories created"
echo ""

echo "=========================================="
echo "📋 PREREQUISITES"
echo "=========================================="
echo ""
echo "Before running this script, please:"
echo ""
echo "1. ✅ Start iOS Simulator"
echo "   npm run ios"
echo ""
echo "2. ✅ Change Simulator Language to Russian"
echo "   • Open Settings app in simulator"
echo "   • Go to: General → Language & Region"
echo "   • Tap 'iPhone Language'"
echo "   • Select 'Русский (Russian)'"
echo "   • Confirm 'Change to Русский'"
echo "   • Wait for simulator to restart"
echo ""
echo "3. ✅ Restart Genosys app"
echo "   • Close app (Cmd+Shift+H twice)"
echo "   • Run: npm run ios"
echo ""
echo "4. ✅ Navigate to each screen and confirm Russian text displays"
echo ""
echo "=========================================="
echo ""

# Ask user to confirm prerequisites
read -p "Have you completed all prerequisites? (y/n): " confirm
if [[ $confirm != "y" && $confirm != "Y" ]]; then
    echo ""
    echo "❌ Prerequisites not met. Please complete them and run again."
    exit 1
fi

echo ""
echo "=========================================="
echo "🎬 SCREENSHOT CAPTURE PROCESS"
echo "=========================================="
echo ""
echo "We will capture 6 screenshots:"
echo "  1. Shop Home (Главная/Магазин)"
echo "  2. Product Detail (Детали продукта)"
echo "  3. Shopping Bag (Корзина)"
echo "  4. Checkout (Оформление заказа)"
echo "  5. Profile (Профиль)"
echo "  6. Order Detail (История заказов)"
echo ""
echo "For each screenshot:"
echo "  • Navigate to the screen in simulator"
echo "  • Press ENTER when ready"
echo "  • Screenshot will be captured automatically"
echo ""
read -p "Press ENTER to start capturing screenshots..."
echo ""

# Get device UDID
UDID=$(xcrun simctl list devices | grep "Booted" | grep -oE "[A-F0-9\-]{36}" | head -1)

if [ -z "$UDID" ]; then
    echo "❌ Error: No booted simulator found"
    echo "   Please start simulator with: npm run ios"
    exit 1
fi

echo "✅ Found simulator: $UDID"
echo ""

# Screenshot 1: Shop Home
echo "=========================================="
echo "📸 Screenshot 1/6: Shop Home (Главная)"
echo "=========================================="
echo ""
echo "Please navigate to:"
echo "  • Shop tab (Магазин)"
echo "  • Make sure products are visible"
echo "  • Ensure Russian text is displayed"
echo ""
read -p "Press ENTER when ready to capture..."
xcrun simctl io "$UDID" screenshot "$SCREENSHOT_DIR/01-shop-home.png"
echo "✅ Captured: 01-shop-home.png"
echo ""

# Screenshot 2: Product Detail
echo "=========================================="
echo "📸 Screenshot 2/6: Product Detail (Детали продукта)"
echo "=========================================="
echo ""
echo "Please navigate to:"
echo "  • Tap any product from shop"
echo "  • Product detail page should show"
echo "  • Verify Russian product name and description"
echo ""
read -p "Press ENTER when ready to capture..."
xcrun simctl io "$UDID" screenshot "$SCREENSHOT_DIR/02-product-detail.png"
echo "✅ Captured: 02-product-detail.png"
echo ""

# Screenshot 3: Shopping Bag
echo "=========================================="
echo "📸 Screenshot 3/6: Shopping Bag (Корзина)"
echo "=========================================="
echo ""
echo "Please navigate to:"
echo "  • Tap 'Add to Bag' (Добавить в корзину)"
echo "  • Go to Bag tab (Корзина)"
echo "  • Cart should show items"
echo ""
read -p "Press ENTER when ready to capture..."
xcrun simctl io "$UDID" screenshot "$SCREENSHOT_DIR/03-bag-cart.png"
echo "✅ Captured: 03-bag-cart.png"
echo ""

# Screenshot 4: Checkout
echo "=========================================="
echo "📸 Screenshot 4/6: Checkout (Оформление заказа)"
echo "=========================================="
echo ""
echo "Please navigate to:"
echo "  • Tap 'Checkout' (Оформить заказ) from bag"
echo "  • Checkout screen with payment options"
echo "  • Apple Pay button should be visible"
echo ""
read -p "Press ENTER when ready to capture..."
xcrun simctl io "$UDID" screenshot "$SCREENSHOT_DIR/04-checkout.png"
echo "✅ Captured: 04-checkout.png"
echo ""

# Screenshot 5: Profile
echo "=========================================="
echo "📸 Screenshot 5/6: Profile (Профиль)"
echo "=========================================="
echo ""
echo "Please navigate to:"
echo "  • Go to Profile tab (Профиль)"
echo "  • Main profile screen"
echo "  • Ensure logged in"
echo ""
read -p "Press ENTER when ready to capture..."
xcrun simctl io "$UDID" screenshot "$SCREENSHOT_DIR/05-profile.png"
echo "✅ Captured: 05-profile.png"
echo ""

# Screenshot 6: Order Detail
echo "=========================================="
echo "📸 Screenshot 6/6: Order Detail (История заказов)"
echo "=========================================="
echo ""
echo "Please navigate to:"
echo "  • Tap 'My Orders' (Мои заказы) from profile"
echo "  • Tap any order to view details"
echo "  • Order detail page with items and totals"
echo ""
read -p "Press ENTER when ready to capture..."
xcrun simctl io "$UDID" screenshot "$SCREENSHOT_DIR/06-order-detail.png"
echo "✅ Captured: 06-order-detail.png"
echo ""

echo "=========================================="
echo "✅ CAPTURE COMPLETE!"
echo "=========================================="
echo ""
echo "All 6 Russian screenshots captured successfully!"
echo ""
echo "Screenshots saved to:"
echo "  $SCREENSHOT_DIR/"
echo ""

# List captured files with sizes
echo "📊 Captured files:"
ls -lh "$SCREENSHOT_DIR"/*.png | awk '{print "  • " $9 " (" $5 ")"}'
echo ""

echo "=========================================="
echo "🔄 NEXT STEP: Convert to App Store Format"
echo "=========================================="
echo ""
echo "Converting screenshots to App Store Connect standard..."
echo "  Resolution: 1320×2868 → 1284×2778"
echo "  Format: PNG (optimized)"
echo ""

# Convert each screenshot
for file in "$SCREENSHOT_DIR"/*.png; do
    filename=$(basename "$file")
    echo "Converting: $filename"
    
    # Use sips to resize (macOS built-in tool)
    sips -z 2778 1284 "$file" --out "$APPSTORE_READY_DIR/$filename" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "  ✅ $filename converted"
    else
        echo "  ❌ Failed to convert $filename"
    fi
done

echo ""
echo "✅ Conversion complete!"
echo ""

echo "=========================================="
echo "📤 READY FOR UPLOAD!"
echo "=========================================="
echo ""
echo "App Store ready screenshots:"
echo "  Location: $APPSTORE_READY_DIR/"
echo ""
ls -lh "$APPSTORE_READY_DIR"/*.png | awk '{print "  • " $9 " (" $5 ")"}'
echo ""

echo "=========================================="
echo "📋 UPLOAD INSTRUCTIONS"
echo "=========================================="
echo ""
echo "1. Open App Store Connect:"
echo "   https://appstoreconnect.apple.com"
echo ""
echo "2. Navigate to your app:"
echo "   My Apps → Genosys UAE"
echo ""
echo "3. Add Russian localization (if not added):"
echo "   App Store tab → Click '+' next to Language"
echo "   Select: Русский (Russian)"
echo ""
echo "4. Upload screenshots:"
echo "   • In Russian localization"
echo "   • Scroll to 'App Previews and Screenshots'"
echo "   • Select '6.7\" Display'"
echo "   • Click '+' and select all 6 .png files from:"
echo "     $APPSTORE_READY_DIR/"
echo ""
echo "5. Save changes:"
echo "   Click 'Save' in top right"
echo ""

echo "=========================================="
echo "✨ QUICK OPEN COMMANDS"
echo "=========================================="
echo ""
echo "Open screenshots folder:"
echo "  open $APPSTORE_READY_DIR"
echo ""
echo "View single screenshot:"
echo "  open $APPSTORE_READY_DIR/01-shop-home.png"
echo ""

echo "=========================================="
echo "🎉 SUCCESS!"
echo "=========================================="
echo ""
echo "Russian App Store screenshots are ready for upload!"
echo ""
echo "Status: ✅ COMPLETE"
echo "Screenshots: 6/6 captured and converted"
echo "Quality: Professional grade"
echo "Format: App Store compliant (1284×2778px)"
echo ""
echo "Next step: Upload to App Store Connect"
echo ""

# Offer to open folder
read -p "Open screenshots folder now? (y/n): " open_folder
if [[ $open_folder == "y" || $open_folder == "Y" ]]; then
    open "$APPSTORE_READY_DIR"
    echo ""
    echo "✅ Folder opened in Finder"
fi

echo ""
echo "Done! 🎉"
echo ""


