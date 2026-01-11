# Genosys UAE - App Review Documentation

**App Name:** Genosys UAE  
**Bundle ID:** ae.genosys.app  
**Version:** 1.0.0  
**Build:** 32  
**Platform:** iOS  

---

## 📱 App Overview

Genosys UAE is an e-commerce mobile application for purchasing premium cosmetics and beauty products in the United Arab Emirates. The app provides a seamless shopping experience with multiple payment options, order tracking, and multilingual support (English, Arabic, Russian).

---

## ✨ Key Features

### 1. **Product Catalog**
- Browse products with high-quality images
- Product details with variants (size, color)
- Real-time pricing and availability
- Product badges and promotions
- Search and category filtering

### 2. **Shopping Cart & Checkout**
- Add products to cart
- Multiple delivery addresses
- Free mask promotion (spend 500 AED = 1 free mask, 700 AED = 2 free masks)
- Free delivery for orders over 1000 AED
- Order summary with VAT breakdown

### 3. **Payment Methods**
- **Cash on Delivery (COD)** - Pay when delivered
- **Card Payment** - Credit/debit card via Stripe
- **Apple Pay** - One-tap payment (requires Apple Pay setup on device)

### 4. **User Account**
- User registration and login
- Profile management (name, phone, email, birthday)
- Multiple delivery addresses
- Order history with tracking
- Wishlist/favorites
- Language selection (English, Arabic, Russian)

### 5. **Order Management**
- View order history
- Order details with item breakdown
- Order status tracking
- Payment status (pending, paid, completed)

### 6. **Multilingual Support**
- English (default)
- Arabic (RTL support)
- Russian

---

## 🧪 Testing Instructions

### Quick Test Flow (5 minutes)

1. **Browse Products**
   - Open app → Shop tab
   - Scroll through product catalog
   - Tap any product to view details
   - Select variant (size/color) if available

2. **Add to Cart**
   - Tap "Add to Bag" on product detail page
   - Go to Bag tab
   - Verify items appear in cart
   - Check totals and promotions

3. **Checkout Process**
   - Tap "Proceed to Checkout"
   - Select delivery address (or add new)
   - Choose payment method:
     - **COD**: No payment required, order will be created
     - **Card**: Test card `4242 4242 4242 4242` (any future date, any CVC)
     - **Apple Pay**: Requires Apple Pay setup on device
   - Complete order

4. **View Orders**
   - Go to Profile tab → Orders
   - View order history
   - Tap order to see details

5. **User Account**
   - Profile tab → Edit Profile
   - Update name, phone, birthday
   - Add delivery address
   - Change language

### Test Account Credentials

**Note:** The app uses real user registration. Reviewers can:
- Create a new account (recommended)
- Use existing account if provided separately

**To Create Test Account:**
1. Tap "Sign In" → "Create Account"
2. Enter email, password, name, phone
3. Complete registration
4. Account is immediately active

**Test Payment Cards:**
- **Success:** `4242 4242 4242 4242` (any future expiry, any CVC)
- **Decline:** `4000 0000 0000 0002`

---

## 🔐 Permissions Usage

### Face ID / Touch ID
- **Purpose:** Secure authentication to access user account
- **Usage:** Optional biometric login after initial password login
- **Privacy:** Stored locally on device, never transmitted

### Camera
- **Purpose:** Take profile photo
- **Usage:** Optional feature in Profile → Edit Profile
- **Privacy:** Photo stored only if user chooses to upload

### Photo Library
- **Purpose:** Select existing photo for profile picture
- **Usage:** Optional feature in Profile → Edit Profile
- **Privacy:** Only accessed when user explicitly chooses photo

---

## 💳 Payment Testing

### Apple Pay
- **Setup Required:** Device must have Apple Pay configured
- **Merchant ID:** merchant.ae.genosys.app
- **Testing:** Use test Apple Pay card in Wallet app
- **Note:** Apple Pay requires valid payment method in device Wallet

### Stripe Card Payments
- **Test Mode:** Uses Stripe test environment
- **Test Cards:** Standard Stripe test cards work
- **No Real Charges:** All test transactions are simulated

### Cash on Delivery
- **No Payment Required:** Order is created without payment
- **Payment Collected:** On actual delivery (not during review)

---

## 🌍 Localization Testing

### Language Switching
1. Profile → Language
2. Select language (English/Arabic/Russian)
3. App UI updates immediately
4. Arabic uses RTL (right-to-left) layout

### RTL Support
- Arabic interface fully supports RTL
- Text alignment, navigation, and layouts adapt automatically
- Test in Profile → Help & Support for full RTL experience

---

## 📍 Important Notes for Reviewers

### 1. **Internet Connection Required**
- App requires active internet connection
- All data fetched from live API: `https://genosys.ae/api/mobile/`

### 2. **Real Product Data**
- Products, prices, and availability are real
- Orders created during testing are test orders (can be cancelled)

### 3. **Delivery Address**
- App requires UAE delivery address
- Select emirate (Dubai, Abu Dhabi, etc.)
- Address validation ensures UAE-only delivery

### 4. **Promotions**
- Free mask promotion: Spend 500 AED = 1 free mask, 700 AED = 2 free masks
- Free delivery: Orders over 1000 AED
- Promotions automatically applied at checkout

### 5. **Order Processing**
- Orders are created immediately upon checkout
- Payment processing happens via Stripe (test mode)
- Order status updates in real-time

### 6. **No In-App Purchases**
- All purchases are physical products
- No subscriptions or digital goods
- Standard e-commerce transaction flow

---

## 🐛 Known Limitations (Not Bugs)

1. **Apple Pay:** Requires device with Apple Pay configured
2. **Delivery:** Only available in UAE
3. **Test Mode:** Payment processing uses Stripe test environment
4. **Language:** Some third-party content may remain in English

---

## 📞 Support Information

- **Website:** https://genosys.ae
- **Support Email:** sales@genosys.ae
- **Support Phone:** +971 58 548 76 65
- **WhatsApp:** +971 58 548 76 65

---

## ✅ Compliance Notes

- **Privacy Policy:** Available in-app (Profile → Privacy Policy)
- **Terms & Conditions:** Available in-app (Profile → Terms & Conditions)
- **Data Encryption:** All API communications use HTTPS
- **User Data:** Stored securely, GDPR-compliant
- **Apple Pay:** Properly configured with merchant ID
- **No Prohibited Content:** Cosmetics and beauty products only

---

## 🎯 Review Checklist

- [x] App launches without crashes
- [x] Products display correctly
- [x] Cart functionality works
- [x] Checkout process completes
- [x] Payment methods function (test mode)
- [x] User registration works
- [x] Profile management works
- [x] Order history displays
- [x] Multilingual support works
- [x] RTL layout works (Arabic)
- [x] Permissions properly requested
- [x] Privacy policy accessible
- [x] Terms accessible
- [x] No broken links or errors

---

**Thank you for reviewing Genosys UAE!**

For any questions or issues during review, please contact: sales@genosys.ae

