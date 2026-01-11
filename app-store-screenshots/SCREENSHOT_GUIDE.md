# Genosys iOS App Store Screenshots Guide

## 📱 Requirements

Apple requires screenshots for the **largest device size** in each device family:

### iPhone 6.7" Display (REQUIRED - Primary)
- **Devices:** iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max
- **Resolution:** 1290 × 2796 pixels (or 2796 × 1290 for landscape)
- **Folder:** `app-store-screenshots/6.7-inch/`

### iPhone 6.5" Display (Fallback)
- **Devices:** iPhone 11 Pro Max, XS Max
- **Resolution:** 1242 × 2688 pixels (or 2688 × 1242 for landscape)
- **Folder:** `app-store-screenshots/6.5-inch/`

---

## 📸 Required Screenshots (10 Total)

### Screenshot Order & Content:

1. **01-splash-or-home.png** - Splash screen or home page with hero section
2. **02-shop-products.png** - Shop page showing product grid
3. **03-product-detail.png** - Product detail page with "Add to Bag" button
4. **04-bag-cart.png** - Shopping bag with items and totals
5. **05-checkout.png** - Checkout form with delivery information
6. **06-payment-methods.png** - Payment method selection (COD, Card, Apple Pay)
7. **07-orders-list.png** - Orders page showing order history
8. **08-order-detail.png** - Order detail page with tracking
9. **09-profile.png** - Profile page with user information
10. **10-about-or-help.png** - About page or Help/FAQ section

---

## 🎬 App Previews (3 Total - Optional but Recommended)

Apple allows up to 3 video previews (15-30 seconds each):

### Preview Ideas:

1. **01-shopping-flow.mp4** (30 sec)
   - Browse products → Select product → Add to bag → Checkout → Success

2. **02-apple-pay-checkout.mp4** (15 sec)
   - Show Apple Pay payment in action (key feature!)

3. **03-order-tracking.mp4** (15 sec)
   - View orders → Order detail → Track delivery

**Video Requirements:**
- **Resolution:** 1290 × 2796 pixels (portrait) or 2796 × 1290 (landscape)
- **Format:** .mov or .mp4
- **Duration:** 15-30 seconds
- **File size:** Max 500 MB
- **Frame rate:** 25-30 FPS

---

## 🎨 Screenshot Best Practices

### Content Guidelines:

1. **Use Real Data**
   - Real product images
   - Actual prices in AED
   - Your company branding

2. **Show Key Features**
   - Apple Pay integration ✨
   - Multi-language support (EN/AR/RU)
   - Beautiful product images
   - Easy checkout process

3. **Avoid:**
   - ❌ Personal/test data
   - ❌ Lorem ipsum text
   - ❌ Placeholder images
   - ❌ Debug/developer info
   - ❌ Notification badges
   - ❌ Low battery indicators

4. **Include:**
   - ✅ Status bar (time 9:41 AM)
   - ✅ Clean UI
   - ✅ High-quality images
   - ✅ Brand colors
   - ✅ Real content

### Design Tips:

1. **Show Value Propositions:**
   - Free shipping over 1000 AED
   - UAE VAT included
   - Cash on Delivery available
   - Secure Apple Pay checkout

2. **Highlight Trust Signals:**
   - Stripe secure payments
   - Professional product photos
   - Clear pricing
   - Easy returns (7 days)

3. **Demonstrate UX:**
   - Smooth navigation
   - Clear CTAs
   - Intuitive checkout
   - Order tracking

---

## 📝 How to Take Screenshots

### Method 1: Physical Device (Recommended)

**On iPhone 15 Pro Max or 14 Pro Max:**

1. Build and install your app via TestFlight
2. Navigate to each screen
3. Take screenshot:
   - **iPhone with Face ID:** Press Side Button + Volume Up
   - Screenshots save to Photos app
4. AirDrop or email screenshots to your Mac
5. Rename files according to list above

### Method 2: iOS Simulator (Alternative)

```bash
# Start simulator with largest device
xcrun simctl boot "iPhone 15 Pro Max"

# Open simulator
open -a Simulator

# Install and run your app
# Navigate to each screen

# Take screenshot (⌘S in Simulator)
# Or use: xcrun simctl io booted screenshot screenshot.png

# Screenshots save to Desktop
```

### Method 3: Screenshot Tool (Professional)

Use tools like:
- **Screenshots.pro** - Automated screenshot generation
- **Fastlane Snapshot** - Automated UI testing + screenshots
- **AppLaunchpad** - Screenshot design tool

---

## 🎯 Screenshot Checklist

Before submitting:

- [ ] All 10 screenshots taken
- [ ] Correct resolution (1290 × 2796 or 1242 × 2688)
- [ ] PNG or JPG format
- [ ] File size < 10 MB each
- [ ] No personal data visible
- [ ] Status bar shows 9:41 AM
- [ ] Full battery indicator
- [ ] Full signal strength
- [ ] No carrier name (or "Carrier")
- [ ] Clean, professional look
- [ ] Represents actual app functionality
- [ ] Shows key features (Apple Pay!)
- [ ] Brand consistent

---

## 📂 File Organization

```
app-store-screenshots/
├── 6.7-inch/                    # iPhone 15 Pro Max (PRIMARY)
│   ├── 01-splash-or-home.png
│   ├── 02-shop-products.png
│   ├── 03-product-detail.png
│   ├── 04-bag-cart.png
│   ├── 05-checkout.png
│   ├── 06-payment-methods.png
│   ├── 07-orders-list.png
│   ├── 08-order-detail.png
│   ├── 09-profile.png
│   └── 10-about-or-help.png
│
├── 6.5-inch/                    # iPhone 11 Pro Max (FALLBACK)
│   └── [same 10 screenshots]
│
├── previews/                    # Optional video previews
│   ├── 01-shopping-flow.mp4
│   ├── 02-apple-pay-checkout.mp4
│   └── 03-order-tracking.mp4
│
└── SCREENSHOT_GUIDE.md          # This file
```

---

## 🌍 Localization (Optional)

If you want to provide localized screenshots for Arabic or Russian:

```
app-store-screenshots/
├── en-US/
│   └── 6.7-inch/
│       └── [10 screenshots in English]
├── ar-AE/
│   └── 6.7-inch/
│       └── [10 screenshots in Arabic]
└── ru-RU/
    └── 6.7-inch/
        └── [10 screenshots in Russian]
```

**Note:** Apple will use the default (English) screenshots for all languages if localized versions aren't provided.

---

## 🚀 Quick Start

1. **Install app on iPhone 15 Pro Max via TestFlight**
2. **Open app and navigate to each screen**
3. **Take 10 screenshots** (Side Button + Volume Up)
4. **AirDrop screenshots to Mac**
5. **Rename and organize** in `app-store-screenshots/6.7-inch/`
6. **Review checklist** above
7. **Upload to App Store Connect**

---

## 💡 Pro Tips

### Screenshot Enhancement:

1. **Add Status Bar:**
   - Use tools like "Status Magic" to perfect status bar
   - Set time to 9:41 AM (Apple's standard)
   - Full battery, full signal, no carrier

2. **Frame Screenshots:**
   - Use "Screenshot Studio" to add device frames
   - Makes screenshots look more professional
   - Optional for App Store submission

3. **Add Captions:**
   - App Store Connect allows text overlays
   - Highlight key features in each screenshot
   - Examples:
     - "Shop Premium Skincare"
     - "Pay with Apple Pay"
     - "Track Your Orders"

### Testing Before Submission:

1. View screenshots on iPhone to ensure clarity
2. Check that key features are visible
3. Verify no sensitive data is shown
4. Confirm brand consistency
5. Test on multiple screen sizes

---

## 📞 Need Help?

If you encounter issues:

1. **Wrong Resolution?**
   - Use iOS Simulator for exact dimensions
   - Or use screenshot editing tools to resize

2. **Can't Access Device?**
   - Use iOS Simulator as fallback
   - Or ask team member with device

3. **App Not Ready?**
   - Use mock data for screenshots
   - Fill cart with sample products
   - Create test orders

---

## 🎬 Recording App Previews

### Using QuickTime (Mac):

1. Connect iPhone via cable
2. Open QuickTime Player
3. File → New Movie Recording
4. Select iPhone as camera source
5. Click record
6. Navigate through app (15-30 seconds)
7. Click stop
8. Export as .mov file
9. Edit to exact requirements

### Using Simulator:

```bash
# Start recording
xcrun simctl io booted recordVideo preview.mp4

# Stop recording (Ctrl+C)

# Trim to 15-30 seconds using video editor
```

---

## ✅ Final Checklist Before Upload

- [ ] 10 screenshots for 6.7" display
- [ ] All images are PNG or JPG
- [ ] Correct dimensions (1290 × 2796)
- [ ] File sizes < 10 MB
- [ ] No personal/sensitive data
- [ ] Professional appearance
- [ ] Shows key features
- [ ] Brand consistent
- [ ] Status bar clean (9:41 AM)
- [ ] Ready for App Store Connect upload

---

**Good luck with your App Store submission! 🚀**


