# Genosys UAE - App Review Documentation

**App Name:** Genosys UAE  
**Bundle ID:** ae.genosys.app  
**Version:** 1.1.0  
**Build:** 34  
**Platform:** iOS  

---

## App Overview

Genosys UAE is an e-commerce mobile application for purchasing professional Korean dermacosmetics and beauty products in the United Arab Emirates. The app provides a comprehensive shopping experience with AI-powered skin analysis, an intelligent chatbot, product video demonstrations, downloadable product guides, multiple payment options, order tracking, and multilingual support (English, Arabic, Russian).

---

## What's New in Version 1.1.0

### AI Features
- **AI Skin Analysis** - Personalized skin type quiz with product recommendations
- **AI Camera Analysis** - Real-time camera-based skin analysis using device camera
- **AI Chatbot** - Intelligent assistant for product questions and skincare advice

### Product Experience
- **Image Gallery** - Swipeable multi-image carousel on product pages with pagination dots
- **Product Videos** - Embedded video demonstrations (available for select products)
- **Product Documentation** - Downloadable PDF guides for professional application

### Navigation & UI
- **Hamburger Menu** - Full navigation drawer with access to all app sections
- **Skeleton Loading** - Shimmer placeholders instead of spinners for better perceived performance
- **Haptic Feedback** - Tactile feedback on add-to-cart, favorites, and checkout actions

### Performance
- **expo-image Migration** - Faster image loading with built-in caching and blurhash placeholders
- **Offline Product Browsing** - Cached product catalog for browsing without internet
- **Deep Linking** - Direct links open content in-app from emails and shared links

### Order Improvements
- **Discount Tracking** - VIP and bundle discount fields included in order records
- **Localized Emails** - Order confirmation emails sent in user's selected language

---

## Test Account Credentials

| Field | Value |
|-------|-------|
| **Email** | appreview@genosys.ae |
| **Password** | GenosysReview2026! |

This account is pre-created and ready to use. No email verification required.

---

## Testing Instructions

### Quick Test Flow (5-7 minutes)

#### 1. Login
- Open app > Tap "Sign In"
- Enter email: `appreview@genosys.ae`
- Enter password: `GenosysReview2026!`
- Tap "Sign In"

#### 2. Browse Products
- Shop tab > Scroll through product catalog
- Products display with images, prices, discount badges
- Use search bar or category filters to find products

#### 3. Product Detail Page
- Tap any product to view details
- **Swipe images** left/right to see gallery (products with multiple images show pagination dots)
- **Watch video** on products like SNOW O2 Cleanser or EGF Repair Oxymask (scroll down)
- **Download PDF guide** if available (scroll to Documentation section)
- Select size variant if applicable
- Tap "Add to Bag"

#### 4. AI Skin Analysis
- Open hamburger menu (top-left) > Tap "AI Skin Analysis"
- **Quiz Mode:** Answer 4 skin type questions > View personalized product recommendations
- **Camera Mode:** Tap "Live AR" > Allow camera access > Take a selfie for AI analysis

#### 5. AI Chatbot
- Open hamburger menu > Tap "AI Chatbot"
- Ask questions like "What's good for dry skin?" or "Tell me about EGF Repair Oxymask"
- Chatbot provides product recommendations with links

#### 6. Checkout Process
- Go to Bag tab > Review items
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

#### 7. Order History
- Profile tab > Orders
- View past orders with status
- Tap order for full details with item breakdown

#### 8. Language Switching
- Profile tab > Language
- Switch between English, Arabic (RTL), Russian
- App UI updates immediately

---

## Permissions Usage

### Face ID / Touch ID
- **Purpose:** Secure authentication to access user account
- **Usage:** Optional biometric login after initial password login
- **Privacy:** Biometric data stored locally on device, never transmitted

### Camera
- **Purpose:** AI Skin Analysis camera mode and profile photo
- **Usage:** Used when user initiates camera-based skin analysis or profile photo
- **Privacy:** Photos processed on-device, only uploaded with explicit consent

### Photo Library
- **Purpose:** Select existing photo for profile picture or skin analysis
- **Usage:** Only accessed when user explicitly chooses to select a photo
- **Privacy:** Only the selected photo is accessed

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
- Free delivery for orders over 1,000 AED

### 4. Promotions
- Free mask promotion: Spend 500 AED = 1 free mask, 700 AED = 2 free masks
- VIP discounts applied automatically for eligible accounts
- Bundle discounts (15% off) when purchasing 3+ eligible products

### 5. Real Product Data
- Products, prices, and availability are real
- Orders created during testing can be identified and cancelled by our team

### 6. AI Features
- AI Skin Analysis uses a quiz-based recommendation engine
- Camera analysis processes images for skin type detection
- AI Chatbot is powered by a language model trained on our product catalog

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
- **GDPR Compliant:** Users can request data deletion via support
- **No Prohibited Content:** Professional cosmetics and beauty products only
- **No In-App Purchases:** All transactions are for physical goods

---

## Technical Details

| Detail | Value |
|--------|-------|
| Framework | React Native (Expo SDK 54) |
| Min iOS Version | 16.0 |
| Bundle ID | ae.genosys.app |
| Backend API | https://genosys.ae/api/mobile/ |
| Authentication | JWT tokens with optional biometric |
| Image CDN | https://genosys.ae/images/ |

---

## Review Checklist

- [x] App launches without crashes
- [x] Login with test account works
- [x] Products display correctly with images
- [x] Image gallery swipe works
- [x] Product videos play
- [x] Product documentation downloads
- [x] AI Skin Analysis quiz completes
- [x] AI Camera analysis functions
- [x] AI Chatbot responds to questions
- [x] Cart functionality works
- [x] Checkout process completes (COD)
- [x] Checkout process completes (Card)
- [x] User profile management works
- [x] Order history displays
- [x] Multilingual support works (EN/AR/RU)
- [x] RTL layout works (Arabic)
- [x] Hamburger menu navigation works
- [x] Permissions properly requested
- [x] Privacy policy accessible
- [x] Terms accessible
- [x] No broken links or errors
- [x] Haptic feedback on actions
- [x] Skeleton loading on screens

---

## Support Information

- **Website:** https://genosys.ae
- **Support Email:** sales@genosys.ae
- **Support Phone:** +971 58 548 76 65
- **WhatsApp:** +971 58 548 76 65

---

**Thank you for reviewing Genosys UAE!**

For any questions or issues during review, please contact: sales@genosys.ae
