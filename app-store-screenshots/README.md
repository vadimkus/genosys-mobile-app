# App Store Screenshots

**App:** Genosys UAE  
**Current Version:** 1.1.0 (Build 34)  
**Screenshot Status:** v1.0 screenshots present - v1.1 RECAPTURE NEEDED

---

## Quick Start

```bash
# 1. Start iOS simulator
npm run ios

# 2. Log in with test account
#    Email: appreview@genosys.ae
#    Password: GenosysReview2026!

# 3. Capture screenshots (automated)
npm run screenshots

# 4. Convert to App Store format
bash scripts/convert-screenshots-appstore.sh

# 5. Open folder for upload
open app-store-screenshots/appstore-ready/
```

---

## v1.1 Screenshot Plan

### Screenshots to Capture (6 total)

**First 3 are most important** - shown on App Store search results and installation sheets.

| # | Screen | Navigate To | What Must Be Visible |
|---|---|---|---|
| **1** | Shop Home | Shop tab (main) | Hamburger menu icon, product grid with discount badges, search bar |
| **2** | Product Detail | Shop > "EGF Repair Oxymask" (#26) | Image gallery with pagination dots, price, Add to Bag button |
| **3** | AI Skin Analysis | Hamburger menu > AI Skin Analysis > Complete quiz | Results page with personalized product recommendations |
| 4 | AI Chatbot | Hamburger menu > AI Chatbot | Chat with question "What's good for dry skin?" and bot response |
| 5 | Checkout | Add items > Bag > Checkout | Delivery form, COD + Card payment options (NO Apple Pay) |
| 6 | Order Detail | Profile > Orders > Tap order | Order items with images, price breakdown, discount fields |

### Products with Special Features

| Product | ID | Gallery Images | Video | Documentation |
|---|---|---|---|---|
| EGF Repair Oxymask | 26 | 2 images | Yes | No |
| SNOW O2 Cleanser | 10 | 2 images | Yes | No |
| AWS Serum | 9 | 3 images | No | No |
| MTS Roller 0.25mm | 1 | 1 image | No | Yes (PDF) |

Use **Product #26** or **#10** for the product detail screenshot - they show gallery + video.

---

## Technical Specifications

| Spec | Value |
|---|---|
| Resolution | 1284 x 2778 px |
| Format | PNG |
| Device Target | iPhone 14 Pro Max (6.7" display) |
| Max Per Localization | 10 screenshots |
| Max File Size | 5 MB per image |
| Color Profile | sRGB |

---

## Folder Structure

```
app-store-screenshots/
├── README.md                    <- This file
├── appstore-ready/              <- UPLOAD THESE to App Store Connect
│   ├── 01-shop-home.png         (1284 x 2778)
│   ├── 02-product-detail.png    (1284 x 2778)
│   ├── 03-bag-cart.png          (1284 x 2778)
│   ├── 04-checkout.png          (1284 x 2778)
│   ├── 05-profile.png           (1284 x 2778)
│   └── 06-order-detail.png      (1284 x 2778)
│
├── 01-shop-home.png             <- Original captures (higher res)
├── 02-product-detail.png
├── 03-bag-cart.png
├── 04-checkout.png
├── 05-profile.png
└── 06-order-detail.png
```

After recapture, rename files to match the new screenshot plan:
```
appstore-ready/
├── 01-shop-home.png
├── 02-product-detail-gallery.png
├── 03-ai-skin-analysis.png
├── 04-ai-chatbot.png
├── 05-checkout.png
└── 06-order-detail.png
```

---

## Upload to App Store Connect

1. Go to https://appstoreconnect.apple.com
2. My Apps > Genosys UAE > App Store > Version 1.1.0
3. Scroll to "App Previews and Screenshots"
4. Select **6.7" Display** tab
5. Remove old v1.0 screenshots
6. Click "+" and drag in all 6 new files from `appstore-ready/`
7. Verify order (files are numbered correctly)
8. Click "Save"

---

## Localization (Optional)

Screenshots can be localized for Arabic and Russian:

| Language | How to Capture |
|---|---|
| English | Default - capture normally |
| Arabic | Profile > Language > Arabic (RTL layout mirrors automatically) |
| Russian | Profile > Language > Russian |

Upload localized screenshots to the respective language tabs in App Store Connect.

---

## Capture Scripts

| Command | What It Does |
|---|---|
| `npm run screenshots` | Automated capture from running simulator |
| `npm run screenshots:interactive` | Interactive guided capture |
| `bash scripts/convert-screenshots-appstore.sh` | Convert to 1284x2778 App Store format |
| `bash scripts/capture-russian-screenshots.sh` | Capture Russian locale screenshots |

---

## Quality Checklist

Before uploading, verify each screenshot:

- [ ] 1284 x 2778 px resolution
- [ ] PNG format
- [ ] Under 5MB file size
- [ ] No Apple Pay visible anywhere
- [ ] All images fully loaded (no spinners/skeletons)
- [ ] No debug overlays or developer tools
- [ ] No personal/sensitive information
- [ ] Clean status bar (time, signal, battery)
- [ ] Matches current v1.1 app functionality
- [ ] v1.1 features visible where relevant

---

## Version History

| Version | Date | Notes |
|---|---|---|
| v1.0 | Dec 18, 2025 | Original 6 screenshots. Included Apple Pay. |
| v1.1 | Feb 2026 | PENDING - Must recapture for AI features, gallery, no Apple Pay. |
