# App Store Screenshots

This directory contains screenshots for App Store submission.

## Requirements

- **Dimensions:** 1242×2688px, 2688×1242px, 1284×2778px, or 2778×1284px
- **Format:** PNG or JPG
- **Max Count:** Up to 10 screenshots per localization
- **First 3:** Will be used on app installation sheets
- **iOS Only:** Screenshots are required only for iOS apps

## Screenshot Plan

1. **Shop Home** - Product catalog with categories and discounts
2. **Product Detail** - Product information with variants and Add to Bag
3. **Shopping Bag** - Cart with items, totals, and checkout button
4. **Checkout** - Payment options (Apple Pay, COD) and delivery details
5. **Profile** - User account with orders and settings
6. **Order Detail** - Order history with discount breakdown and tracking

## Capturing Screenshots

### Automated Capture (Recommended)

Run the automated screenshot script:

```bash
npm run screenshots
# or
node scripts/capture-appstore-screenshots.js
```

**Instructions:**
1. Start Expo and open the app on iOS simulator
2. Run the screenshot script
3. Navigate through the app as prompted (2s delay between captures)
4. Screenshots will be saved in `app-store-screenshots/`

### Manual Capture

1. Start iOS simulator with Expo
2. Navigate to each screen
3. Press `⌘ + S` (Cmd + S) in simulator to save screenshot
4. Rename files to match the naming convention

## File Naming Convention

- `01-shop-home.png` - Shop home with product grid
- `02-product-detail.png` - Product detail page
- `03-bag-cart.png` - Shopping bag/cart
- `04-checkout.png` - Checkout screen
- `05-profile.png` - Profile/account screen
- `06-order-detail.png` - Order detail screen

## Upload to App Store Connect

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to your app → App Store tab
3. Scroll to **App Previews and Screenshots**
4. Upload screenshots for each device size category
5. First 3 screenshots will appear on the installation sheet

## Tips

- ✅ Show the app's best features
- ✅ Use clean, uncluttered screens
- ✅ Include real content (not placeholders)
- ✅ Show user benefits clearly
- ✅ Maintain consistent branding
- ❌ Avoid showing bugs or errors
- ❌ Don't include status bar time/battery if sensitive

## Localization

If supporting multiple languages, capture screenshots for:
- English (en)
- Arabic (ar) - if available
- Russian (ru) - if available

Create subdirectories: `en/`, `ar/`, `ru/` for localized screenshots.
