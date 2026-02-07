# App Store Screenshots - Version 1.1 Update Guide

**Status:** NEEDS UPDATE - Screenshots from v1.0 are outdated  
**Last Captured:** December 18, 2025 (v1.0)  
**Current Version:** 1.1.0 (Build 34)  
**Action Required:** Recapture screenshots to reflect v1.1 features

---

## Why New Screenshots Are Needed

Version 1.1 introduces significant new features that are **not shown** in the current v1.0 screenshots:

### Critical Issues with Current Screenshots

| # | Current Screenshot | Issue |
|---|---|---|
| 1 | 01-shop-home.png | Missing: hamburger menu, skeleton loading |
| 2 | 02-product-detail.png | Missing: image gallery, pagination dots, video player, documentation links |
| 3 | 03-bag-cart.png | Minor UI updates only |
| 4 | **04-checkout.png** | **Shows Apple Pay which has been REMOVED** |
| 5 | 05-profile.png | Missing: AI Skin Analysis, AI Chatbot menu items |
| 6 | 06-order-detail.png | Missing: updated discount breakdown |

**Screenshot #4 is the most critical** - it shows Apple Pay which no longer exists. Apple's review team will flag this inconsistency.

---

## Recommended New Screenshot Set for v1.1

### Priority Order (first 3 shown on App Store installation sheets)

| # | Screen | Filename | What to Show | Why It Matters |
|---|---|---|---|---|
| **1** | Shop Home | 01-shop-home.png | Product catalog with hamburger menu visible, discount badges | Lead screenshot - shows main value proposition |
| **2** | Product Detail with Gallery | 02-product-detail-gallery.png | Multi-image gallery with pagination dots, visible video section | Showcases new v1.1 gallery/video features |
| **3** | AI Skin Analysis | 03-ai-skin-analysis.png | Skin type quiz or camera analysis results with product recommendations | Highlights headline AI feature |
| 4 | AI Chatbot | 04-ai-chatbot.png | Chatbot conversation with product recommendation | Shows intelligent assistant |
| 5 | Checkout (Updated) | 05-checkout.png | Checkout page with COD and Card options (NO Apple Pay) | Accurate payment flow |
| 6 | Order Detail | 06-order-detail.png | Order with discount breakdown, item images | Post-purchase experience |

### Alternative Screenshot Set (Marketing-Focused)

| # | Screen | Filename | What to Show |
|---|---|---|---|
| **1** | Shop Home | 01-shop-home.png | Full catalog with discounts, hamburger menu |
| **2** | Product Detail | 02-product-detail.png | Image gallery + video player + documentation links |
| **3** | Shopping Cart | 03-cart.png | Cart with multiple items and discount applied |
| 4 | AI Skin Analysis Results | 04-ai-results.png | Personalized product recommendations |
| 5 | AI Chatbot | 05-ai-chatbot.png | Chatbot conversation about skincare |
| 6 | Profile / Orders | 06-profile.png | User profile with order history |

---

## Technical Specifications

### App Store Requirements

| Requirement | Value |
|---|---|
| **Resolution** | 1284 x 2778 px (iPhone 14 Pro Max / 6.7" standard) |
| **Format** | PNG (Apple's preferred format) |
| **Maximum Count** | 10 per localization (minimum 1, recommended 6) |
| **First 3 Rule** | First 3 screenshots shown in search results and installation sheets |
| **File Size** | Keep under 5MB per image (current avg: ~600KB, well within limit) |

### Supported Device Sizes

Screenshots captured at 6.7" display (1284x2778) are automatically scaled for:
- iPhone 16 Pro Max (6.9")
- iPhone 15 Pro Max (6.7")
- iPhone 14 Pro Max (6.7")
- iPhone 13 Pro Max (6.7")
- iPhone SE and smaller displays

---

## Capture Instructions

### Method 1: Automated (Recommended)

```bash
# 1. Start the iOS simulator
npm run ios

# 2. Wait for app to load, then log in with test account:
#    Email: appreview@genosys.ae
#    Password: GenosysReview2026!

# 3. Navigate to each screen and run automated capture
npm run screenshots

# 4. Convert to App Store format (1284x2778)
bash scripts/convert-screenshots-appstore.sh

# 5. Verify output
open app-store-screenshots/appstore-ready/
```

### Method 2: Manual from Simulator

```bash
# 1. Start iOS simulator
npm run ios

# 2. Log in with test account

# 3. Navigate to desired screen

# 4. Take screenshot:
#    - Press Cmd+S in Simulator
#    - Or use Simulator menu: File > Screenshot

# 5. Screenshots save to Desktop by default

# 6. Resize to 1284x2778 using sips:
sips -z 2778 1284 ~/Desktop/screenshot.png --out app-store-screenshots/appstore-ready/01-shop-home.png
```

### Method 3: Manual from Physical Device

```bash
# 1. Take screenshots on device (Side Button + Volume Up)

# 2. AirDrop or transfer to Mac

# 3. Resize if needed:
sips -z 2778 1284 input.png --out app-store-screenshots/appstore-ready/01-shop-home.png
```

---

## Screen-by-Screen Capture Guide

### Screenshot 1: Shop Home
**Navigate to:** Shop tab (main screen)
**What to show:**
- Hamburger menu icon visible (top-left)
- Product grid with discount badges (e.g., "50% OFF")
- Product images loaded (not skeleton placeholders)
- Search bar visible
- Professional product cards with prices

**Capture tips:**
- Scroll so 4-6 products are visible
- Ensure discount badges are prominent
- Wait for all images to fully load

---

### Screenshot 2: Product Detail with Gallery
**Navigate to:** Shop > Tap "EGF Repair Oxymask" (Product #26) or "SNOW O2 Cleanser" (Product #10)
**What to show:**
- Multi-image gallery with pagination dots at bottom
- Product name and price clearly visible
- "Add to Bag" button visible
- Scroll down slightly to show video section if possible

**Capture tips:**
- Product #26 (EGF Repair Oxymask) has both gallery images AND a video
- Swipe to second image first, then swipe back to show dots are interactive
- Capture when on first image with dots visible

---

### Screenshot 3: AI Skin Analysis
**Navigate to:** Hamburger menu > AI Skin Analysis
**What to show:**
- Option A: Quiz in progress (one of the 4 questions with options visible)
- Option B: Results page with personalized product recommendations
- Clear AI branding/heading

**Capture tips:**
- Results page is more visually impressive (shows product cards)
- Complete the quiz first, then capture the results
- Ensure product recommendation cards are visible

---

### Screenshot 4: AI Chatbot
**Navigate to:** Hamburger menu > AI Chatbot
**What to show:**
- Chat conversation with at least 2-3 messages
- User question like "What's good for dry skin?"
- Bot response with product recommendation
- Clean chat interface

**Capture tips:**
- Start a fresh conversation
- Ask a clear question and wait for full response
- Ensure the response includes a product mention

---

### Screenshot 5: Checkout
**Navigate to:** Add items to cart > Bag tab > Proceed to Checkout
**What to show:**
- Delivery form (partially filled)
- Payment method options: COD and Card Payment
- NO Apple Pay (this has been removed)
- Order summary with total

**Capture tips:**
- Pre-fill the form with:
  - Name: Sarah Ahmed
  - Phone: +971 50 123 4567
  - Emirate: Dubai
- Show the payment method selection area

---

### Screenshot 6: Order Detail
**Navigate to:** Profile > Orders > Tap an order
**What to show:**
- Order number and status
- Product images in order items
- Price breakdown (subtotal, shipping, VAT, discount, total)
- Delivery information

**Capture tips:**
- Place a test order first using COD
- Tap into the order detail for the full breakdown view

---

## Localized Screenshots (Optional)

If submitting localized screenshots for Arabic and Russian:

### Arabic (RTL)
```bash
# 1. In app: Profile > Language > Arabic
# 2. All UI mirrors to RTL automatically
# 3. Take screenshots of same 6 screens
# 4. Upload to Arabic localization in App Store Connect
```

### Russian
```bash
# 1. In app: Profile > Language > Russian
# 2. Take screenshots of same 6 screens
# 3. Upload to Russian localization in App Store Connect
```

---

## File Locations

```
app-store-screenshots/
├── appstore-ready/              <- UPLOAD THESE TO APP STORE CONNECT
│   ├── 01-shop-home.png         <- NEEDS RECAPTURE (v1.1 features)
│   ├── 02-product-detail.png    <- NEEDS RECAPTURE (gallery/video)
│   ├── 03-bag-cart.png          <- REPLACE with AI Skin Analysis
│   ├── 04-checkout.png          <- NEEDS RECAPTURE (remove Apple Pay)
│   ├── 05-profile.png           <- REPLACE with AI Chatbot
│   └── 06-order-detail.png      <- NEEDS RECAPTURE (discount breakdown)
│
├── 01-shop-home.png             <- Original quality captures (v1.0)
├── 02-product-detail.png
├── 03-bag-cart.png
├── 04-checkout.png
├── 05-profile.png
└── 06-order-detail.png
```

---

## Upload to App Store Connect

### Step-by-Step Upload

1. **Open App Store Connect**
   - URL: https://appstoreconnect.apple.com
   - Sign in with your Apple Developer account

2. **Navigate to Your App**
   - My Apps > Genosys UAE > App Store tab
   - Select the version (1.1.0)

3. **Upload Screenshots**
   - Scroll to "App Previews and Screenshots"
   - Select **6.7" Display** tab
   - Delete old v1.0 screenshots (if already uploaded)
   - Click "+" and select all 6 new files from `appstore-ready/`
   - Drag to reorder if needed (files are numbered in correct order)

4. **Verify**
   - Preview on different device sizes
   - Ensure first 3 screenshots represent key features
   - Check that NO screenshot shows Apple Pay

5. **Save**
   - Click "Save" (top right)

### Quick Upload Command
```bash
# Open the screenshots folder in Finder
open app-store-screenshots/appstore-ready/
```

---

## Automation Scripts

### Available Scripts

| Script | Purpose | Command |
|---|---|---|
| `scripts/capture-appstore-screenshots.sh` | Automated capture from simulator | `npm run screenshots` |
| `scripts/capture-screenshots-interactive.sh` | Interactive guided capture | `npm run screenshots:interactive` |
| `scripts/capture-appstore-screenshots.js` | Node.js automated capture | `node scripts/capture-appstore-screenshots.js` |
| `scripts/convert-screenshots-appstore.sh` | Convert to 1284x2778 format | `bash scripts/convert-screenshots-appstore.sh` |
| `scripts/capture-russian-screenshots.sh` | Capture Russian locale screenshots | `bash scripts/capture-russian-screenshots.sh` |

---

## Quality Checklist

Before uploading, verify each screenshot:

- [ ] Resolution is exactly 1284 x 2778 px
- [ ] Format is PNG
- [ ] File size is under 5MB
- [ ] No Apple Pay visible in any screenshot
- [ ] All product images are fully loaded (no placeholders/spinners)
- [ ] No debug overlays or developer tools visible
- [ ] No personal information visible
- [ ] No error messages or alerts visible
- [ ] Status bar shows clean (time, signal, battery)
- [ ] Screenshots accurately represent current app functionality
- [ ] v1.1 features visible: gallery dots, video, AI, hamburger menu

---

## Version History

| Version | Date | Screenshots | Notes |
|---|---|---|---|
| v1.0 | Dec 18, 2025 | 6 screenshots | Original submission. Included Apple Pay. |
| v1.1 | Feb 2026 | **PENDING** | Needs recapture. New features: AI, gallery, video, docs. Apple Pay removed. |

---

**Last Updated:** February 7, 2026  
**Status:** AWAITING NEW SCREENSHOT CAPTURE FOR v1.1
