# App Store Screenshot Upload Guide - v1.1

**Version:** 1.1.0  
**Build:** 34  
**Status:** AWAITING RECAPTURE

---

## Pre-Upload Checklist

Before uploading, ensure screenshots have been recaptured for v1.1:

- [ ] Screenshots recaptured with v1.1 features
- [ ] AI Skin Analysis screenshot included
- [ ] AI Chatbot screenshot included
- [ ] Product gallery with pagination dots visible
- [ ] No Apple Pay in any screenshot
- [ ] All files in `appstore-ready/` at 1284x2778 PNG

---

## Upload Steps

### 1. Open Screenshots Folder

```bash
open app-store-screenshots/appstore-ready/
```

### 2. Go to App Store Connect

- URL: https://appstoreconnect.apple.com
- Sign in with Apple Developer account
- My Apps > **Genosys UAE**
- Click **App Store** tab
- Select version **1.1.0**

### 3. Navigate to Screenshots Section

- Scroll down to **"App Previews and Screenshots"**
- Select the **"6.7" Display"** tab

### 4. Remove Old Screenshots

- If v1.0 screenshots are already uploaded, remove them
- Click the "X" on each old screenshot

### 5. Upload New Screenshots

- Click the **"+"** button
- Select all 6 files from `appstore-ready/` folder
- Files are numbered in correct display order:
  1. `01-shop-home.png` - Product catalog
  2. `02-product-detail-gallery.png` - Image gallery + video
  3. `03-ai-skin-analysis.png` - AI skin analysis results
  4. `04-ai-chatbot.png` - AI chatbot conversation
  5. `05-checkout.png` - Checkout (COD + Card, no Apple Pay)
  6. `06-order-detail.png` - Order breakdown

### 6. Verify and Save

- Preview screenshots on different device sizes
- Confirm first 3 screenshots represent key features
- Click **"Save"** (top right)

---

## What Reviewers See

### In Search Results / Installation Sheet (First 3 Only)
1. **Shop Home** - "Professional cosmetics e-commerce with discounts"
2. **Product Detail** - "Rich product experience with gallery and video"
3. **AI Skin Analysis** - "Personalized AI-powered recommendations"

### On Full App Page (All 6)
- Complete app experience from browsing to AI to checkout to order tracking

---

## Important Notes

- Screenshots must accurately represent current app functionality
- Apple will compare screenshots to actual app behavior during review
- First 3 screenshots have the most marketing impact
- Apple Pay must NOT appear (it has been removed from the app)
- All payment references should show COD and Card options only
