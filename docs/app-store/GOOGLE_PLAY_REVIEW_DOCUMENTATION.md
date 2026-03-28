# Genosys UAE - Google Play Review Documentation

**App Name:** Genosys UAE  
**Package Name:** ae.genosys.app  
**Version:** 1.7.0  
**Version Code:** 71  
**Platform:** Android  

---

## App Overview

Genosys UAE is an e-commerce mobile application for purchasing professional Korean dermacosmetics and beauty products in the United Arab Emirates. The app provides a comprehensive shopping experience with AI-powered skin analysis, an intelligent chatbot, product video demonstrations, downloadable product guides, multiple payment options, order tracking, and multilingual support (English, Arabic, Russian).

---

## What's New in Version 1.7.0

### Remote Splash Screen
- **API-Driven Splash Video** — Launch video is now delivered over-the-air, updatable without app rebuild. Seasonal splash videos (Ramadan, Eid, holidays) can be swapped instantly server-side.
- **5.6MB Binary Reduction** — Removed bundled video from app binary. App downloads faster and takes less storage.
- **Instant Cached Playback** — Splash config and video file are cached locally for instant display on repeat launches.

### Soft Update Banner
- **Non-Blocking Update Notification** — When a newer version is available, a dismissible dark banner slides in at the top with "A new version is available on Google Play" and an "Update" button.
- **Persistent Dismissal** — Dismissing the banner persists via AsyncStorage so the user isn't nagged again for the same version.

### Platform-Aware Update URLs
- **Correct Store Redirect** — Force update and soft update banners now direct Android users to Google Play and iOS users to the App Store.

### Under the Hood
- Splash screen configuration cached locally for instant display on repeat launches
- Improved cold start performance
- Android versionCode aligned with iOS buildNumber (71)

---

## What's New in Previous Versions

### Version 1.6.0 (Build 68) — February 26, 2026
- Ramadan video splash screen (bundled)
- Force update version gating (server-controlled)
- Sticky bar UX: per-item remove, clear all, green discount color
- Pricing fixes: concern page VIP pricing, cart price doubling fix
- Payment simplification: removed "Generate Link", renamed to "Card Payment"
- Bag back chevron fix

### Version 1.5.0 (Build 65) — February 17, 2026
- Native skin concern detail pages
- Tap-to-add from routine chips
- 100% native (zero WebView content screens)
- App-wide haptic feedback (38 files, ~190 touch points)

### Version 1.4.0 (Build 58) — February 14, 2026

#### Pricing & Discount Logic Overhaul
- **Mutually Exclusive Discounts** — Bundle discounts and VIP discounts no longer stack. Bundle items receive only the bundle discount on retail price; regular items receive only the VIP discount on retail price.
- **Consistent Cross-Platform Pricing** — All pricing calculations are now fully aligned between the website and native app across cart, checkout, order details, and email confirmations.
- **Corrected Order History** — Order detail screens now display accurate per-item discounts (bundle items show only "Bundle Discount", VIP items show only their VIP percentage).

#### Checkout Improvements
- **Auto-Populate Delivery Address** — Saved addresses are now automatically populated in the checkout form, eliminating the need to re-enter delivery details for returning customers.
- **Checkout Footer Summary** — The checkout screen now displays a total summary in the footer, including item count, total price, and shipping information.
- **Improved Keyboard Handling** — ScrollView now persists taps on Android, preventing accidental input dismissal.

#### Localization & Translation
- **Fully Translated UI** — 26+ previously hardcoded English strings in the AI Skin Analysis camera and WebView screens are now translated into Arabic and Russian.
- **Complete 3-Language Coverage** — All 1,390+ translation keys verified across English, Arabic, and Russian with zero missing keys.

#### Bug Fixes
- **Bundle Item Pricing in Cart** — Fixed issue where adding items from "Build Your Set" could show inflated retail prices.
- **Product Price Refresh on Login** — Shop page now re-fetches products when a user logs in.
- **Product Video Sound** — Videos now play with audio even when the iOS/Android silent mode is on.
- **Product Documentation** — PDF guides now load from API first (future-proof), with local fallback.
- **Stripe Payment Stability** — Prevented duplicate success alerts on payment completion; iOS-only presentation styles now properly guarded.

#### Android-Specific Fixes
- **Keyboard Behavior** — Fixed `KeyboardAvoidingView` behavior for chat, address form, and blog comment screens.
- **Card Shadows** — Added proper elevation values for cards that were missing shadows on Android.
- **Nested Scroll** — Gallery FlatList inside product detail now uses `nestedScrollEnabled` for smooth scrolling on Android.
- **Haptic Feedback** — All haptic feedback now works cross-platform (previously some were iOS-only).
- **Chrome Custom Tabs** — Stripe payment opens cleanly in Chrome Custom Tabs without iOS-only presentation styles.

#### Stability & Performance
- **Safe Import for Apple Authentication** — Apple Sign-In module uses safe loading to prevent crashes on Android.
- **Notification Badge Clearing** — App badge count clears automatically when the app is opened.
- **Error Recovery** — Added fallback for payment method preferences loading.

---

## What's New in Previous Versions

### Version 1.3.0 (Build 53)

#### AI Skin Analysis
- **AI Expert Analysis** - Take a selfie and receive instant AI-powered skin assessment using GPT-4 Vision
- **Health Score** - Get a 1-10 skin health rating with visual indicator
- **Personalized Routine** - Receive custom AM/PM skincare routines based on your analysis
- **Product Recommendations** - AI suggests specific products with personalized reasons
- **Tips** - Get customized skincare tips for your skin type and concerns
- **Quiz Mode** - 4-step questionnaire with API-driven product recommendations

#### Build Your Set
- **Native Bundle Builder** - Create your perfect skincare routine in-app
- **8-Step Process** - Select products across Cleanse, Tone, Serum, Eye Care, Cream, Mask, Sun Care, Special Care
- **Tiered Discounts** - 5% off 2 items, 10% off 3, 15% off 4, up to 20% off 5+ items
- **Visual Summary** - See your bundle with product images, sizes, and total savings

#### Native Blog
- **In-App Reading** - Read skincare articles directly in the app
- **Comments** - Leave comments on articles (requires login)
- **Localized Content** - Articles available in English, Arabic, and Russian

#### Push Notifications
- **Order Updates** - Receive notifications when order status changes
- **Beautiful Alerts** - In-app notification banners with order details
- **Android Notification Channels** - Dedicated "Order Updates" channel with high priority

#### Performance & Stability
- **Faster Startup** - Improved app initialization
- **Enhanced Stability** - Better error handling throughout
- **Smoother Navigation** - All native screens (no WebView wrappers)

---

## Test Account Credentials

| Field | Value |
|-------|-------|
| **Email** | appreview@genosys.ae |
| **Password** | GenosysReview2026! |

This account is pre-created and ready to use. No email verification required.

---

## Testing Instructions

### Quick Test Flow (8-10 minutes)

#### 1. Login
- Open app > Tap "Sign In"
- Enter email: `appreview@genosys.ae`
- Enter password: `GenosysReview2026!`
- Tap "Sign In"

#### 2. AI Skin Analysis (New Feature)
- Open hamburger menu (top-left) > Tap "AI Skin Analysis"
- **Option A - AI Camera Analysis:**
  - Tap "AI Camera" button
  - Allow camera access when prompted
  - Position your face in the oval guide
  - Tap capture button
  - Wait for AI analysis (5-10 seconds)
  - View results: Health Score, Skin Type, Concerns, Product Recommendations with prices, AM/PM Routine, Tips
  - Tap "Add to Bag" on recommended products
- **Option B - Quiz Mode:**
  - Tap "Start Quiz"
  - Answer 4 questions (Skin Type, Age Group, Concerns, Usage)
  - View personalized product recommendations

#### 3. Build Your Set (New Feature)
- Open hamburger menu > Tap "Build Your Set"
- Select products for each skincare step (swipe through steps at top)
- Watch discount increase as you add items (5% → 10% → 15% → 20%)
- Tap center to view "Your Bundle" summary
- Swipe footer up to see pricing breakdown
- Tap "Add to Bag" to add entire set to cart

#### 4. Native Blog (New Feature)
- Open hamburger menu > Tap "Blog"
- Browse article list
- Tap any article to read full content
- Scroll down to leave a comment (logged-in users)

#### 5. Browse Products
- Shop tab > Scroll through product catalog
- Products display with images, prices, discount badges
- Use search bar or category filters to find products

#### 6. Product Detail Page
- Tap any product to view details
- **Swipe images** left/right to see gallery
- **Watch video** on products like SNOW O2 Cleanser (scroll down)
- **Download PDF guide** if available
- Select size variant if applicable
- Tap "Add to Bag"

#### 7. Checkout Process
- Go to Bag tab > Review items (including any bundle items)
- Tap "Proceed to Checkout"
- Fill in delivery details:
  - Name: App Review
  - Phone: +971 50 123 4567
  - Address: Test Address, Dubai
  - Emirate: Dubai
- Select payment method:
  - **Cash on Delivery (COD):** Tap "Place Order" - no payment needed
  - **Card Payment:** Uses Stripe test card `4242 4242 4242 4242` (any future date, any CVC)
- Order confirmation displayed on success page

#### 8. Order History
- Profile tab > Orders
- View past orders with status
- Tap order for full details with item breakdown

#### 9. Language Switching
- Profile tab > Language
- Switch between English, Arabic (RTL), Russian
- App UI updates immediately

---

## Permissions Usage

### Camera
- **Purpose:** AI Skin Analysis camera mode and profile photo
- **Usage:** Used when user initiates camera-based skin analysis or profile photo
- **Privacy:** Photos processed by AI for skin analysis, not stored permanently

### Photo Library (READ_MEDIA_IMAGES)
- **Purpose:** Select existing photo for profile picture or skin analysis
- **Usage:** Only accessed when user explicitly chooses to select a photo
- **Privacy:** Only the selected photo is accessed

### Push Notifications (POST_NOTIFICATIONS)
- **Purpose:** Order status updates (shipped, delivered, etc.)
- **Usage:** Notifications sent when order status changes
- **Privacy:** Only order-related notifications, no marketing without consent
- **Android:** Uses dedicated notification channels ("Order Updates" with high priority)

### Microphone (RECORD_AUDIO)
- **Purpose:** Voice search for products
- **Usage:** Optional feature activated by tapping microphone icon in search
- **Privacy:** Audio processed on-device for search query

### Biometric Authentication (USE_BIOMETRIC / USE_FINGERPRINT)
- **Purpose:** Secure authentication to access user account
- **Usage:** Optional fingerprint/biometric login after initial password login
- **Privacy:** Biometric data stored locally on device, never transmitted

### Internet (INTERNET / ACCESS_NETWORK_STATE)
- **Purpose:** Required for API communication, product loading, payments
- **Usage:** All app features require internet connectivity

### Vibration (VIBRATE)
- **Purpose:** Haptic feedback on user actions and notification alerts
- **Usage:** Brief vibrations on button taps and notification receipt

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

### Google Pay - NOT Available
- Google Pay is not integrated in this version
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

### 4. Bundle Discounts (New)
- Build Your Set feature offers tiered discounts:
  - 2 items: 5% off
  - 3 items: 10% off
  - 4 items: 15% off
  - 5+ items: 20% off
- Discounts applied automatically when bundle is added to cart

### 5. Real Product Data
- Products, prices, and availability are real
- Orders created during testing can be identified and cancelled by our team

### 6. AI Features
- AI Skin Analysis uses GPT-4 Vision for camera analysis
- Quiz mode uses our recommendation API with scoring algorithm
- AI Chatbot is powered by a language model trained on our product catalog
- AI features require internet connection

### 7. Firebase / Google Services
- Push notifications use Firebase Cloud Messaging (FCM) via Expo
- `google-services.json` is configured for the production build
- In development/preview builds without Firebase, push token warnings are expected and suppressed

---

## Android-Specific Features

### Notification Channels
- **Order Updates** channel: High importance, custom vibration pattern, red LED light, sound enabled
- **Default** channel: Standard importance for general notifications

### Adaptive Icon
- Foreground layer: Genosys logo on transparent background
- Background layer: White solid background
- Proper safe zone respected for all Android launchers

### Deep Linking (Intent Filters)
- Handles `https://genosys.ae/*` URLs for all app sections
- Auto-verified domain association
- Supports: products, cart, orders, profile, favorites, skin-analysis, blog, bundle-builder, training, chat, checkout

### Biometric Authentication
- Fingerprint authentication via Android BiometricPrompt
- Secure credential storage via EncryptedSharedPreferences (expo-secure-store)
- Optional feature - users can enable/disable in profile settings

---

## Localization Testing

### Supported Languages
| Language | Direction | Coverage |
|----------|-----------|----------|
| English | LTR | Full |
| Arabic | RTL | Full (including layout mirroring) |
| Russian | LTR | Full |

### How to Test
1. Profile tab > Language
2. Select language
3. Entire app UI updates immediately
4. Arabic mode mirrors all layouts to right-to-left

---

## Compliance Notes

- **Privacy Policy:** Available in-app (Profile > Privacy Policy) and at https://genosys.ae/privacy
- **Terms & Conditions:** Available in-app (Profile > Terms & Conditions)
- **Data Encryption:** All API communications use HTTPS/TLS
- **User Data:** Stored securely on AWS servers in UAE (me-central-1 region)
- **GDPR Compliant:** Users can request data deletion via support or in-app
- **No Prohibited Content:** Professional cosmetics and beauty products only
- **No In-App Purchases:** All transactions are for physical goods
- **Target Audience:** General audience (adults interested in skincare)

---

## Technical Details

| Detail | Value |
|--------|-------|
| Framework | React Native (Expo SDK 54) |
| Min Android SDK | 23 (Android 6.0) |
| Target Android SDK | 35 (Android 15) |
| Package Name | ae.genosys.app |
| Backend API | https://genosys.ae/api/mobile/ |
| Authentication | JWT tokens with optional biometric |
| Image CDN | https://genosys.ae/images/ |
| AI Provider | OpenAI GPT-4 Vision |
| Push Notifications | Firebase Cloud Messaging (via Expo) |
| Build System | EAS Build (Expo Application Services) |

---

## Data Safety Section (Google Play)

### Data Collected
| Data Type | Purpose | Shared |
|-----------|---------|--------|
| Email address | Account creation, order notifications | No |
| Name | Account profile, delivery | No |
| Phone number | Order delivery contact | No |
| Delivery address | Order shipping | No |
| Payment info | Processed by Stripe (not stored in app) | With Stripe |
| Photos | AI skin analysis, profile picture | No (processed by OpenAI for analysis) |
| Push token | Delivery of order notifications | No |

### Security Practices
- Data encrypted in transit (TLS/HTTPS)
- Biometric data stored only on device
- User can request account deletion
- No data sold to third parties

---

## Review Checklist

### Core Functionality
- [x] App launches without crashes
- [x] Login with test account works
- [x] Products display correctly with images
- [x] Image gallery swipe works
- [x] Product videos play with sound
- [x] Product documentation downloads (API-driven)
- [x] Cart functionality works
- [x] Checkout process completes (COD)
- [x] Checkout process completes (Card via Stripe)
- [x] User profile management works
- [x] Order history displays with correct pricing

### v1.7.0 Features
- [x] Remote splash screen plays on launch (API-driven video)
- [x] Splash video caches locally for instant repeat playback
- [x] Soft update banner appears when newer version exists
- [x] "Update" button links to Google Play (not App Store)
- [x] Dismiss banner → persists, doesn't reappear for same version
- [x] Force update screen links to Google Play

### v1.6.0 Features
- [x] Force update version gating works (blocks app if below minimum)
- [x] Sticky bar UX with per-item remove and clear all

### v1.5.0 Features
- [x] Skin concern detail pages render natively
- [x] Tap-to-add from routine chips works
- [x] Haptic feedback works on Android

### v1.4.0 Features
- [x] Bundle and VIP discounts mutually exclusive (no stacking)
- [x] Checkout auto-populates saved delivery address
- [x] Checkout footer shows total summary with shipping info
- [x] All UI strings translated (zero hardcoded English)
- [x] Product videos play with audio in silent mode

### v1.3.0 Features (Verified)
- [x] AI Camera Analysis completes with results
- [x] AI Skin Analysis quiz completes
- [x] Build Your Set bundle builder works
- [x] Bundle discounts apply correctly
- [x] Native blog articles display
- [x] Blog comments can be posted
- [x] Push notification permission requested
- [x] Android notification channels created

### Android-Specific
- [x] Fingerprint authentication works
- [x] Adaptive icon displays correctly
- [x] Deep links open correct screens
- [x] Notification channels visible in system settings
- [x] Back button navigation works properly
- [x] Keyboard handling correct on all forms
- [x] Card shadows display with proper elevation
- [x] Stripe opens in Chrome Custom Tabs
- [x] Haptic feedback works on Android
- [x] Nested scroll in product gallery works

### General
- [x] Multilingual support works (EN/AR/RU)
- [x] RTL layout works (Arabic)
- [x] Hamburger menu navigation works
- [x] Permissions properly requested (runtime)
- [x] Privacy policy accessible
- [x] Terms accessible
- [x] No broken links or errors
- [x] Haptic feedback on actions

---

## Version History

| Version | Build | Status | Release Date | Key Features |
|---------|-------|--------|--------------|--------------|
| 1.0.0 | — | Released | Dec 2025 | Initial release |
| 1.1.0 | 34 | Released | Jan 2026 | AI features, image gallery, videos, hamburger menu |
| 1.3.0 | 53 | Released | Feb 11, 2026 | AI Skin Analysis, Bundle Builder, Native Blog, Push Notifications |
| 1.4.0 | 58 | Released | Feb 14, 2026 | Pricing overhaul, checkout improvements, full translation, Android polish |
| 1.5.0 | 65 | Released | Feb 17, 2026 | Skin concern pages, 100% native, haptics, routine tap-to-add |
| 1.6.0 | 68 | Released | Feb 26, 2026 | Ramadan splash, force update, sticky bar UX, pricing fixes |
| 1.7.0 | 71 | **Current** | Mar 21, 2026 | Remote splash screen, soft update banner, 5.6MB binary reduction, platform-aware updates |

---

## Support Information

- **Website:** https://genosys.ae
- **Support Email:** sales@genosys.ae
- **Support Phone:** +971 58 548 76 65
- **WhatsApp:** +971 58 548 76 65

---

**Thank you for reviewing Genosys UAE!**

For any questions or issues during review, please contact: sales@genosys.ae
