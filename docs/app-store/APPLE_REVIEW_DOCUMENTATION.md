# Genosys UAE - App Review Documentation

**App Name:** Genosys UAE  
**Bundle ID:** ae.genosys.app  
**Version:** 1.4.0  
**Build:** 58  
**Platform:** iOS  

---

## App Overview

Genosys UAE is an e-commerce mobile application for purchasing professional Korean dermacosmetics and beauty products in the United Arab Emirates. The app provides a comprehensive shopping experience with AI-powered skin analysis, an intelligent chatbot, product video demonstrations, downloadable product guides, multiple payment options, order tracking, and multilingual support (English, Arabic, Russian).

---

## What's New in Version 1.4.0

### Pricing & Discount Logic Overhaul
- **Mutually Exclusive Discounts** — Bundle discounts and VIP discounts no longer stack. Bundle items receive only the bundle discount on retail price; regular items receive only the VIP discount on retail price.
- **Consistent Cross-Platform Pricing** — All pricing calculations are now fully aligned between the website and native app across cart, checkout, order details, and email confirmations.
- **Corrected Order History** — Order detail screens now display accurate per-item discounts (bundle items show only "Bundle Discount", VIP items show only their VIP percentage).

### Checkout Improvements
- **Auto-Populate Delivery Address** — Saved addresses are now automatically populated in the checkout form, eliminating the need to re-enter delivery details for returning customers.
- **Checkout Footer Summary** — The checkout screen now displays a total summary in the footer, including item count, total price, and shipping information (e.g., "Free shipping" or "Incl. shipping 45 AED").

### Localization & Translation
- **Fully Translated UI** — 26+ previously hardcoded English strings in the AI Skin Analysis camera and WebView screens are now translated into Arabic and Russian.
- **New Translation Keys** — Added missing keys for checkout footer, shipping info, skin camera UI, and error messages.
- **Complete 3-Language Coverage** — All 1,355+ translation keys verified across English, Arabic, and Russian with zero missing keys.

### Bug Fixes
- **Bundle Item Pricing in Cart** — Fixed an issue where adding items from "Build Your Set" could show inflated retail prices due to variant size auto-selection.
- **Product Price Refresh on Login** — The shop page now re-fetches products when a user logs in, ensuring VIP discounts appear immediately without requiring a manual refresh.
- **Keyboard Behavior on Android** — Fixed `KeyboardAvoidingView` behavior for chat, address form, and blog comment screens on Android.
- **Card Shadows on Android** — Added proper elevation values for cards that were missing shadows on Android.

### Stability & Performance
- **Safe Import for Apple Authentication** — Apple Sign-In module now uses safe loading to prevent potential issues.
- **Notification Badge Clearing** — App badge count now clears automatically when the app is opened or brought to foreground.

---

## What's New in Previous Versions

### Version 1.3.0 (Build 53)

#### AI Skin Analysis
- **AI Expert Analysis** — Take a selfie and receive instant AI-powered skin assessment using GPT-4 Vision
- **Health Score** — Get a 1-10 skin health rating with visual indicator
- **Personalized Routine** — Receive custom AM/PM skincare routines based on your analysis
- **Product Recommendations** — AI suggests specific products with personalized reasons
- **Tips** — Get customized skincare tips for your skin type and concerns
- **Quiz Mode** — 4-step questionnaire with API-driven product recommendations

#### Build Your Set
- **Native Bundle Builder** — Create your perfect skincare routine in-app
- **8-Step Process** — Select products across Cleanse, Tone, Serum, Eye Care, Cream, Mask, Sun Care, Special Care
- **Tiered Discounts** — 5% off 2 items, 10% off 3, 15% off 4, up to 20% off 5+ items
- **Visual Summary** — See your bundle with product images, sizes, and total savings

#### Native Blog
- **In-App Reading** — Read skincare articles directly in the app
- **Comments** — Leave comments on articles (requires login)
- **Localized Content** — Articles available in English, Arabic, and Russian

#### Push Notifications
- **Order Updates** — Receive notifications when order status changes
- **Beautiful Alerts** — In-app notification banners with order details

---

## Test Account Credentials

| Field | Value |
|-------|-------|
| **Email** | appreview@genosys.ae |
| **Password** | GenosysReview2026! |

This account is pre-created and ready to use. No email verification required.

**Note:** This test account has a 50% VIP discount applied, which will be visible on regular (non-bundle) product prices. Bundle items will show only their tiered bundle discount.

---

## Testing Instructions

### Quick Test Flow (10-12 minutes)

#### 1. Login
- Open app > Tap "Sign In"
- Enter email: `appreview@genosys.ae`
- Enter password: `GenosysReview2026!`
- Tap "Sign In"

#### 2. Verify VIP Pricing (New in 1.4.0)
- After login, browse the Shop tab
- Products should display discounted prices with the VIP discount applied
- Discount badges should appear on product cards (e.g., "-50%")

#### 3. Build Your Set (Updated in 1.4.0)
- Open hamburger menu (top-left) > Tap "Build Your Set"
- Select products for each skincare step (swipe through steps at top)
- **Note:** Products display at retail price (no VIP discount in bundle builder)
- Watch discount increase as you add items (5% → 10% → 15% → 20%)
- Tap center to view "Your Bundle" summary
- Swipe footer up to see pricing breakdown showing only bundle discount
- Tap "Add to Bag" to add entire set to cart
- **Verify in Bag:** Bundle items should show only the bundle discount (not VIP + bundle stacked)

#### 4. AI Skin Analysis
- Open hamburger menu > Tap "AI Skin Analysis"
- **Option A - AI Camera Analysis:**
  - Tap "AI Camera" button
  - Allow camera access
  - Position your face in the oval guide
  - Tap capture button
  - Wait for AI analysis (5-10 seconds)
  - View results: Health Score, Skin Type, Concerns, Product Recommendations with prices, AM/PM Routine, Tips
  - Tap "Add to Bag" on recommended products
  - **Note (1.4.0):** All camera UI labels are now translated when using Arabic or Russian
- **Option B - Quiz Mode:**
  - Tap "Start Quiz"
  - Answer 4 questions (Skin Type, Age Group, Concerns, Usage)
  - View personalized product recommendations

#### 5. Native Blog
- Open hamburger menu > Tap "Blog"
- Browse article list
- Tap any article to read full content
- Scroll down to leave a comment (logged-in users)

#### 6. Browse Products
- Shop tab > Scroll through product catalog
- Products display with images, prices, discount badges
- Use search bar or category filters to find products

#### 7. Product Detail Page
- Tap any product to view details
- **Swipe images** left/right to see gallery
- **Watch video** on products like SNOW O2 Cleanser (scroll down)
- **Download PDF guide** if available
- Select size variant if applicable
- Tap "Add to Bag"

#### 8. Checkout Process (Updated in 1.4.0)
- Go to Bag tab > Review items (including any bundle items)
- Tap "Proceed to Checkout"
- **Verify (1.4.0):** Delivery address form should auto-populate with saved address if available
- **Verify (1.4.0):** Footer shows total summary with item count and shipping info
- Fill in or verify delivery details:
  - Name: App Review
  - Phone: +971 50 123 4567
  - Address: Test Address, Dubai
  - Emirate: Dubai
- Select payment method:
  - **Cash on Delivery (COD):** Tap "Place Order" - no payment needed
  - **Card Payment:** Uses Stripe test card `4242 4242 4242 4242` (any future date, any CVC)
- Order confirmation displayed on success page

#### 9. Order History (Updated in 1.4.0)
- Profile tab > Orders
- View past orders with status
- Tap order for full details with item breakdown
- **Verify (1.4.0):** Bundle items show only "Bundle Discount (X%)" — not stacked with VIP
- **Verify (1.4.0):** Regular items show only VIP discount percentage

#### 10. Language Switching
- Profile tab > Language
- Switch between English, Arabic (RTL), Russian
- App UI updates immediately
- **Verify (1.4.0):** AI Skin Analysis camera screen is fully translated
- **Verify (1.4.0):** WebView screens show translated UI elements

---

## Permissions Usage

### Face ID / Touch ID
- **Purpose:** Secure authentication to access user account
- **Usage:** Optional biometric login after initial password login
- **Privacy:** Biometric data stored locally on device, never transmitted

### Camera
- **Purpose:** AI Skin Analysis camera mode and profile photo
- **Usage:** Used when user initiates camera-based skin analysis or profile photo
- **Privacy:** Photos processed by AI for skin analysis, not stored permanently

### Photo Library
- **Purpose:** Select existing photo for profile picture or skin analysis
- **Usage:** Only accessed when user explicitly chooses to select a photo
- **Privacy:** Only the selected photo is accessed

### Push Notifications
- **Purpose:** Order status updates (shipped, delivered, etc.)
- **Usage:** Notifications sent when order status changes
- **Privacy:** Only order-related notifications, no marketing without consent

### Speech Recognition
- **Purpose:** Voice search for products
- **Usage:** Optional feature activated by tapping microphone icon in search
- **Privacy:** Audio processed on-device for search query

---

## Payment Information

### Cash on Delivery (COD)
- No payment collected in-app
- Payment collected upon physical delivery in the UAE
- This is a standard payment method in the UAE market

### Stripe Card Payments
- Uses Stripe test environment for review
- Test card: `4242 4242 4242 4242` (any future expiry, any CVC)
- No real charges are made during testing

### Apple Pay - NOT Available
- Apple Pay has been intentionally removed from this app
- All payments are processed via COD or Stripe card payments
- No in-app purchase mechanism is used

---

## Important Notes for Reviewers

### 1. Internet Connection Required
- App requires an active internet connection
- All data is fetched from the live API: `https://genosys.ae/api/mobile/`
- Offline mode allows browsing previously cached products

### 2. Physical Products Only
- All purchases are physical cosmetic products shipped within the UAE
- No digital goods, subscriptions, or in-app purchases
- Standard e-commerce transaction flow

### 3. UAE Delivery Only
- App requires a UAE delivery address
- Shipping available to all 7 emirates (Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain)
- Dubai: 45 AED, Other Emirates: 70 AED
- Free delivery for orders over 1,000 AED

### 4. Bundle Discounts
- Build Your Set feature offers tiered discounts:
  - 2 items: 5% off
  - 3 items: 10% off
  - 4 items: 15% off
  - 5+ items: 20% off
- Discounts applied automatically when bundle is added to cart
- **Bundle discounts and VIP discounts are mutually exclusive** — bundle items receive only the bundle discount on retail price

### 5. VIP Discounts
- The test account (`appreview@genosys.ae`) has a 50% VIP discount
- VIP discount is applied to regular (non-bundle) products only
- Discount badges and strikethrough pricing are shown on product cards and in cart

### 6. Real Product Data
- Products, prices, and availability are real
- Orders created during testing can be identified and cancelled by our team

### 7. AI Features
- AI Skin Analysis uses GPT-4 Vision for camera analysis
- Quiz mode uses our recommendation API with scoring algorithm
- AI Chatbot is powered by a language model trained on our product catalog
- AI features require internet connection

---

## Localization Testing

### Supported Languages
| Language | Direction | Coverage |
|----------|-----------|----------|
| English | LTR | Full (1,355+ keys) |
| Arabic | RTL | Full (including layout mirroring) |
| Russian | LTR | Full |

### How to Test
1. Profile tab > Language
2. Select language
3. Entire app UI updates immediately
4. Arabic mode mirrors all layouts to right-to-left
5. All screens including AI Skin Analysis camera, WebView, and checkout are fully translated

---

## Compliance Notes

- **Privacy Policy:** Available in-app (Profile > Privacy Policy) and at https://genosys.ae/privacy
- **Terms & Conditions:** Available in-app (Profile > Terms & Conditions)
- **Data Encryption:** All API communications use HTTPS/TLS
- **User Data:** Stored securely on AWS servers in UAE (me-central-1 region)
- **GDPR Compliant:** Users can request data deletion via support or in-app
- **No Prohibited Content:** Professional cosmetics and beauty products only
- **No In-App Purchases:** All transactions are for physical goods

---

## Technical Details

| Detail | Value |
|--------|-------|
| Framework | React Native (Expo SDK 54) |
| Min iOS Version | 15.1 |
| Bundle ID | ae.genosys.app |
| Backend API | https://genosys.ae/api/mobile/ |
| Authentication | JWT tokens with optional biometric |
| Image CDN | https://genosys.ae/images/ |
| AI Provider | OpenAI GPT-4 Vision |

---

## Version History

| Version | Build | Key Changes |
|---------|-------|-------------|
| 1.4.0 | 58 | Mutually exclusive discounts, auto-populate address, checkout footer, full translation coverage, bundle pricing fixes |
| 1.3.1 | 56 | Bundle discount alignment, Stripe/Apple Pay bundle processing |
| 1.3.0 | 53 | AI Skin Analysis, Build Your Set, Native Blog, Push Notifications |
| 1.2.0 | — | Blog reading, chatbot improvements |

---

## Review Checklist

### Core Functionality
- [x] App launches without crashes
- [x] Login with test account works
- [x] Products display correctly with images and VIP pricing
- [x] Image gallery swipe works
- [x] Product videos play
- [x] Product documentation downloads
- [x] Cart functionality works
- [x] Checkout process completes (COD)
- [x] Checkout process completes (Card)
- [x] User profile management works
- [x] Order history displays

### v1.4.0 Features
- [x] VIP discount shows on regular products after login
- [x] Bundle builder shows only bundle discount (no VIP)
- [x] Bundle items in cart show only bundle discount badge
- [x] Order details show correct per-item discount (bundle OR VIP)
- [x] Checkout auto-populates saved delivery address
- [x] Checkout footer shows total summary with shipping info
- [x] AI Skin Analysis camera screen fully translated (AR/RU)
- [x] WebView screens fully translated (AR/RU)
- [x] Product prices refresh when user logs in

### v1.3.0 Features
- [x] AI Camera Analysis completes with results
- [x] AI Skin Analysis quiz completes
- [x] Build Your Set bundle builder works
- [x] Bundle discounts apply correctly
- [x] Native blog articles display
- [x] Blog comments can be posted
- [x] Push notification permission requested

### General
- [x] Multilingual support works (EN/AR/RU)
- [x] RTL layout works (Arabic)
- [x] Hamburger menu navigation works
- [x] Permissions properly requested
- [x] Privacy policy accessible
- [x] Terms accessible
- [x] No broken links or errors
- [x] Haptic feedback on actions
- [x] Notification badge clears on app open

---

## Support Information

- **Website:** https://genosys.ae
- **Support Email:** sales@genosys.ae
- **Support Phone:** +971 58 548 76 65
- **WhatsApp:** +971 58 548 76 65

---

**Thank you for reviewing Genosys UAE!**

For any questions or issues during review, please contact: sales@genosys.ae
