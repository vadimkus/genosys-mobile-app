# Genosys UAE - App Review Documentation

**App Name:** Genosys UAE  
**Bundle ID:** ae.genosys.app  
**Version:** 1.8.0  
**Build:** 74  
**Platform:** iOS  
**Last OTA Update:** March 29, 2026  

---

## App Overview

Genosys UAE is an e-commerce mobile application for purchasing professional Korean dermacosmetics and beauty products in the United Arab Emirates. The app provides a comprehensive shopping experience with AI-powered skin analysis, an intelligent chatbot, product video demonstrations, downloadable product guides, multiple payment options, order tracking, and multilingual support (English, Arabic, Russian).

---

## What's New in Version 1.8.0

### In-Bag Size & Color Selection
- **Size Chips** — Products with multiple sizes (e.g. 0.25mm / 0.5mm, or 50g / 210g) display compact tappable chips directly in the bag. Price updates automatically when the customer changes size.
- **Color Chips** — Products with color variants (e.g. #01 Bright / #02 Natural, or Beige / Ivory / Camel) display tappable chips in the bag. Selected variant is highlighted.

### Checkout Variant Validation
- **Required Selection Gate** — Orders cannot be placed without selecting required product variants. If a product requires a size or color choice, the customer is prompted with specific product names before proceeding.

### Over-the-Air Update Support
- **Silent Background Updates** — The app checks for JavaScript bundle updates on every cold start and downloads them silently. Updates apply on the next app launch. No user-facing UI.
- **Force Update Screen** — When a critical update is released, users on very old versions see a blocking screen directing them to the App Store.
- **Soft Update Banner** — When a newer version is available but not required, a dismissible banner slides in from the top suggesting the user update.

### Navigation Cleanup
- **Streamlined Side Menu** — Removed redundant "Products", "Orders", "Favorites", and "Profile" links from the hamburger menu. These destinations are always accessible via the bottom tab bar.

### Performance & Stability (OTA — March 29, 2026)
- **Virtualized Product Grid** — Shop page now uses FlatList instead of ScrollView for smooth scrolling with 50+ products
- **Memoized Cart Context** — Cart provider value and getter functions are memoized to prevent unnecessary re-renders
- **Type-Safe Price Comparisons** — All price comparisons use explicit Number() coercion to prevent string/number mismatches
- **Race Condition Fixes** — Favorites context uses ref-based state reads to prevent stale closures in async operations
- **Unified Discount Logic** — Server-confirmed discount detection consolidated into a single helper function
- **Shared Badge Utility** — Product badge computation extracted into a reusable utility module

### RTL & Localization Improvements (OTA — March 29, 2026)
- **Favorites Grid RTL** — Full right-to-left support for favorites page (heart icon, badges, card layout, text alignment)
- **Bag Price RTL** — Bundle, beauty box, and VIP discount price containers now mirror correctly in Arabic
- **Profile Switch Items RTL** — Biometric and notification toggle rows correctly mirror in Arabic
- **Logical Layout Properties** — Replaced hardcoded left/right with start/end throughout for proper RTL support

### Error Handling & Security (OTA — March 29, 2026)
- **Safe API Error Parsing** — response.json() and response.text() calls wrapped with fallbacks to prevent crashes
- **Authenticated Uploads** — Profile picture uploads now use authenticated requests
- **URL Encoding** — Dynamic URL path segments properly encoded to prevent injection
- **PII Redaction** — Order response logs no longer contain customer data
- **Empty Order Guard** — Order submission blocked at client level if items array is empty
- **Enhanced Order IDs** — Order numbers now include additional entropy to prevent collisions
- **Secure Token Cleanup** — Legacy plaintext auth tokens removed after migration to SecureStore

### Bug Fixes
- Fixed per-item discount percentage display on bundle badges
- Fixed per-item bundle discount in order detail screen
- Fixed pricing for products excluded from user discounts
- Fixed cart quantity coercion (prevents string concatenation from AsyncStorage)
- Fixed case-sensitive emirate name lookup in shipping cost calculation
- Fixed checkout singular/plural item count label
- Fixed checkout function declaration order issue
- Fixed session validation returning undefined on API failures
- Fixed Linking.openURL unhandled promise rejections
- Removed ~15 dead style definitions and unused variables from bag screen

---

## What's New in Previous Versions

### Version 1.7.0 (Build 71)
- Remote splash screen: video is now API-driven, updatable without app rebuild
- Removed bundled video from binary (5.6MB savings)
- Soft update banner: dismissible "new version available" notification on launch

### Version 1.6.0 (Build 68)
- Ramadan video splash screen with remote configuration
- Force update version gating (server-controlled)
- Sticky bar UX improvements (per-item remove, clear all, green discounts)
- Pricing fixes (VIP on concern pages, cart price doubling)
- Payment simplification (removed "Generate Link", renamed to "Card Payment")
- Full 3-language support for all new features

### Version 1.5.0 (Build 65)

#### Skin Concern Pages — Fully Native
- **8 Skin Concern Categories** — Browse curated product collections for Sun Protection, Acne, Pigmentation, Scars, Hair Loss, Anti-Aging, Hydration, and Sensitivity — all rendered natively with fast, smooth scrolling.
- **Complete Concern Detail Pages** — Each concern page features a hero section, expert "Why" highlights, step-by-step skincare routines with product recommendations, a product grid, FAQ accordion, downloadable professional protocol PDFs, and related concern cross-links.
- **Tap-to-Add Routine Products** — Single tap on any product in the routine steps instantly adds it to your shopping bag with haptic feedback and an animated toast confirmation. Tap again to remove. Long press to view full product details.

#### 100% Native Experience
- **Zero WebView Screens** — The entire app is now fully native.

#### Haptic Feedback
- **App-Wide Haptics** — Consistent tactile feedback across all interactive elements.

### Version 1.4.0 (Build 58)

#### Pricing & Discount Logic Overhaul
- **Mutually Exclusive Discounts** — Bundle discounts and VIP discounts no longer stack. Bundle items receive only the bundle discount on retail price; regular items receive only the VIP discount on retail price.
- **Consistent Cross-Platform Pricing** — All pricing calculations are now fully aligned between the website and native app across cart, checkout, order details, and email confirmations.
- **Corrected Order History** — Order detail screens now display accurate per-item discounts (bundle items show only "Bundle Discount", VIP items show only their VIP percentage).

#### Checkout Improvements
- **Auto-Populate Delivery Address** — Saved addresses are now automatically populated in the checkout form, eliminating the need to re-enter delivery details for returning customers.
- **Checkout Footer Summary** — The checkout screen now displays a total summary in the footer, including item count, total price, and shipping information (e.g., "Free shipping" or "Incl. shipping 45 AED").

#### Localization & Translation
- **Fully Translated UI** — 26+ previously hardcoded English strings in the AI Skin Analysis camera and WebView screens are now translated into Arabic and Russian.
- **New Translation Keys** — Added missing keys for checkout footer, shipping info, skin camera UI, and error messages.
- **Complete 3-Language Coverage** — All 1,355+ translation keys verified across English, Arabic, and Russian with zero missing keys.

#### Bug Fixes
- **Bundle Item Pricing in Cart** — Fixed an issue where adding items from "Build Your Set" could show inflated retail prices due to variant size auto-selection.
- **Product Price Refresh on Login** — The shop page now re-fetches products when a user logs in, ensuring VIP discounts appear immediately without requiring a manual refresh.
- **Keyboard Behavior on Android** — Fixed `KeyboardAvoidingView` behavior for chat, address form, and blog comment screens on Android.
- **Card Shadows on Android** — Added proper elevation values for cards that were missing shadows on Android.

#### Stability & Performance
- **Safe Import for Apple Authentication** — Apple Sign-In module now uses safe loading to prevent potential issues.
- **Notification Badge Clearing** — App badge count now clears automatically when the app is opened or brought to foreground.

---

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
- Open app → Tap "Sign In"
- Enter email: `appreview@genosys.ae`
- Enter password: `GenosysReview2026!`
- Tap "Sign In"

#### 2. Size Selection in Bag (New in 1.8.0)
- Shop tab → Find "Microneedle Roller" (has 5 size variants)
- Tap "Add to Bag" from the product card or detail page
- Go to Bag tab
- **Verify:** Compact size chips appear (0.25mm, 0.1mm, 0.5mm, 0.15mm, 0.2mm) with the selected size highlighted in blue
- Tap a different size chip
- **Verify:** The price updates immediately and the chip highlight moves

#### 3. Color Selection in Bag (New in 1.8.0)
- Shop tab → Find "Skin Caring Blemish Balm Cushion" (BB Cushion)
- Add to bag
- Go to Bag tab
- **Verify:** Color chips appear (Beige / Ivory / Camel) all on one row, selected chip highlighted in red
- Tap a different color chip
- **Verify:** Selection updates

#### 4. Checkout Validation (New in 1.8.0)
- Add the BB Cushion to the bag WITHOUT selecting a color (quick-add from shop grid)
- Tap "Proceed to Checkout" → fill details → tap "Place Order"
- **Verify:** An alert appears saying color selection is required
- Tap "Go to Bag" → select a color → proceed to checkout again
- **Verify:** Checkout proceeds normally

#### 5. Navigation Menu (Updated in 1.8.0)
- Tap the hamburger menu (top-left)
- **Verify:** Menu no longer shows "Products", "Orders", "Favorites", or "Profile" links
- These are accessible via the bottom tab bar

#### 6. RTL Layout (Improved in 1.8.0 OTA)
- Profile tab > Language > Arabic
- Navigate to Shop, Bag, Favorites, Profile
- **Verify:** All text is right-aligned, layouts mirror correctly, variant chips reverse order
- Switch back to English

#### 6. Verify VIP Pricing
- Browse the Shop tab
- Products should display discounted prices with the VIP discount applied
- Discount badges should appear on product cards (e.g., "-50%")

#### 7. Build Your Set
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
| 1.8.0 | 74 | In-bag size/color chip selectors, checkout validation, OTA updates, nav cleanup, pricing fixes, 50-issue audit (perf, RTL, security, error handling), compact variant chips |
| 1.7.0 | 71 | Remote splash screen, soft update banner, 5.6MB binary reduction |
| 1.6.0 | 68 | Ramadan video splash, force update gating, sticky bar UX, pricing fixes, payment simplification |
| 1.5.0 | 65 | 8 Skin Concern pages, 100% native, app-wide haptics, routine tap-to-add |
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

### v1.8.0 Features
- [ ] Compact size chips appear in bag for multi-size products (e.g. Microneedle Roller)
- [ ] Changing size chip updates the price immediately
- [ ] Compact color chips appear in bag for multi-color products (e.g. BB Cushion)
- [ ] All color chips fit on one row (Beige/Ivory/Camel, or #01 Bright/#02 Natural)
- [ ] Checkout blocks submission when required variant is missing
- [ ] Alert shows specific product names and "Go to Bag" action
- [ ] After selecting variants, checkout proceeds normally
- [ ] Hamburger menu no longer shows Products/Orders/Favorites/Profile
- [ ] Bottom tab bar provides access to all main sections
- [ ] App launches normally (OTA check is invisible)

### v1.8.0 OTA Improvements (March 29, 2026)
- [ ] Shop page scrolls smoothly with 50+ products (FlatList virtualization)
- [ ] Favorites page supports RTL layout (Arabic)
- [ ] Bag price containers support RTL layout (Arabic)
- [ ] Profile switch items support RTL layout (Arabic)
- [ ] Discount badges display correctly on product cards
- [ ] Price strikethrough works on favorites page
- [ ] No crashes on API error responses

### v1.7.0 Features
- [x] Remote splash video plays on app launch (tap to skip)
- [x] Soft update banner appears when newer version exists

### v1.6.0 Features
- [x] Force update screen blocks old versions with localized message
- [x] Sticky bar shows per-item remove buttons
- [x] Sticky bar shows "Clear all" link for multiple items
- [x] Sticky bar discount amounts display in green
- [x] Concern page products show correct VIP pricing
- [x] Cart displays correct original prices (no doubling)
- [x] Only "Cash on Delivery" and "Card Payment" at checkout
- [x] "Card Payment" label replaces "Stripe Checkout"

### v1.5.0 Features
- [x] 8 Skin Concern pages accessible from Shop category
- [x] Concern detail pages with routines, products, FAQ
- [x] Tap-to-add routine products with haptic feedback
- [x] 100% native — zero WebView screens

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
