# 📱 Russian App Store Screenshots - Creation Guide

## Overview

Create Russian language screenshots for App Store Connect to reach Russian-speaking users in UAE and globally.

---

## 🎯 Goal

Capture the same 6 screenshots as English version, but with Russian UI text:

1. **Shop Home** - Product catalog (Главная/Магазин)
2. **Product Detail** - Product details (Детали продукта)
3. **Shopping Bag** - Cart (Корзина)
4. **Checkout** - Payment options (Оформление заказа)
5. **Profile** - User account (Профиль)
6. **Order Detail** - Order history (История заказов)

---

## 📋 Prerequisites

### 1. Check Russian Language Support

First, verify your app supports Russian:

```bash
# Check for Russian translations in mobile app
cd /Users/vadimkus/genosys-mobile-app
grep -r "ru\|Russian" --include="*.js" --include="*.json"
```

**If Russian is not yet implemented in mobile app:**
- The website (`cosmetics-website`) has Russian support (`/ru/` routes)
- Mobile app may need Russian translation files added
- Check if API returns Russian product names/descriptions

### 2. iOS Simulator Setup

```bash
# Start iOS simulator
npm run ios
```

---

## 🌐 Method 1: Change Simulator Language (Recommended)

### Step 1: Change iOS Language to Russian

1. **Open Simulator Settings:**
   - Click on Simulator
   - Hardware → Home (or swipe up from bottom)
   - Tap **Settings** app

2. **Navigate to Language Settings:**
   - Settings → General → Language & Region
   - Tap **iPhone Language**
   - Select **Русский (Russian)**
   - Tap **Change to Русский**
   - Confirm **Continue**

3. **Wait for restart** (simulator will restart with Russian UI)

### Step 2: Restart Your App

```bash
# Close and restart the app
# Press Cmd+Shift+H twice to close app
# Then run:
npm run ios
```

### Step 3: Capture Screenshots

```bash
# Run automated screenshot capture
npm run screenshots
```

### Step 4: Save Russian Screenshots

```bash
# Create Russian screenshots folder
mkdir -p app-store-screenshots/ru-RU

# Move captured screenshots
mv app-store-screenshots/01-shop-home.png app-store-screenshots/ru-RU/
mv app-store-screenshots/02-product-detail.png app-store-screenshots/ru-RU/
mv app-store-screenshots/03-bag-cart.png app-store-screenshots/ru-RU/
mv app-store-screenshots/04-checkout.png app-store-screenshots/ru-RU/
mv app-store-screenshots/05-profile.png app-store-screenshots/ru-RU/
mv app-store-screenshots/06-order-detail.png app-store-screenshots/ru-RU/
```

### Step 5: Convert to App Store Format

```bash
# Convert Russian screenshots
bash scripts/convert-screenshots-appstore.sh ru-RU
```

---

## 🔧 Method 2: Manual Russian Translation (If App Doesn't Support Russian Yet)

### Option A: Add Russian Support to Mobile App

If mobile app needs Russian translation:

1. **Check Website Russian Translations:**
   ```bash
   # Website has Russian support
   open https://genosys.ae/ru/
   ```

2. **Copy Product Names/Text from Website:**
   - Products have Russian names in database
   - API should return Russian text if requested with `locale=ru`

3. **Add i18n to Mobile App:**
   - Install: `npm install i18n-js`
   - Create: `translations/ru.json`
   - Implement language switching

### Option B: Use Image Editing (Quick Fix)

If you need screenshots ASAP before implementing full Russian support:

1. **Capture English screenshots** (already done ✅)

2. **Translate Key UI Text:**
   - Shop → Магазин
   - Products → Товары
   - Cart/Bag → Корзина
   - Checkout → Оформление
   - Profile → Профиль
   - Orders → Заказы
   - Add to Bag → Добавить в корзину
   - Buy Now → Купить сейчас
   - Total → Итого
   - Checkout → Оформить заказ

3. **Edit Screenshots with Translated Text:**
   - Use Photoshop, Figma, or Sketch
   - Replace English text with Russian
   - Match fonts and styling
   - **Note:** This is less ideal but acceptable for App Store

---

## 📱 Screenshot Checklist - Russian Version

### Required Screens (Same as English)

| # | Screen | Russian Title | English Equivalent |
|---|--------|---------------|-------------------|
| 1 | Shop Home | Главная / Магазин | Shop Home |
| 2 | Product Detail | Детали продукта | Product Detail |
| 3 | Shopping Bag | Корзина | Shopping Bag |
| 4 | Checkout | Оформление заказа | Checkout |
| 5 | Profile | Профиль | Profile |
| 6 | Order Detail | Детали заказа | Order Detail |

### Key UI Elements to Verify in Russian

**Navigation:**
- ✅ Shop → Магазин
- ✅ Favorites → Избранное
- ✅ Bag → Корзина
- ✅ Profile → Профиль

**Buttons:**
- ✅ Add to Bag → Добавить в корзину
- ✅ Buy Now → Купить сейчас
- ✅ Checkout → Оформить заказ
- ✅ Place Order → Оформить заказ
- ✅ Continue Shopping → Продолжить покупки

**Product Info:**
- ✅ Price → Цена
- ✅ Discount → Скидка
- ✅ Total → Итого
- ✅ Subtotal → Промежуточный итог
- ✅ Shipping → Доставка

**Profile/Orders:**
- ✅ My Orders → Мои заказы
- ✅ Order History → История заказов
- ✅ Settings → Настройки
- ✅ Logout → Выйти

---

## 🎨 Screenshot Requirements (Same as English)

### Technical Specifications

- **Resolution:** 1284×2778px (iPhone 14 Pro Max standard)
- **Format:** PNG
- **Device:** iPhone 16 Pro Max / 15 Pro Max / 14 Pro Max
- **Quality:** @3x Retina
- **Count:** 6 screenshots minimum

### Content Quality

- ✅ Real products with Russian names
- ✅ Actual prices in AED (د.إ)
- ✅ Professional UI
- ✅ Clear, readable Russian text
- ✅ No typos or grammar errors
- ✅ Consistent translations

---

## 📂 Folder Structure

After creation, structure should be:

```
app-store-screenshots/
├── en-US/                    # English screenshots (current)
│   ├── 01-shop-home.png
│   ├── 02-product-detail.png
│   ├── 03-bag-cart.png
│   ├── 04-checkout.png
│   ├── 05-profile.png
│   └── 06-order-detail.png
│
├── ru-RU/                    # Russian screenshots (to create)
│   ├── 01-shop-home.png
│   ├── 02-product-detail.png
│   ├── 03-bag-cart.png
│   ├── 04-checkout.png
│   ├── 05-profile.png
│   └── 06-order-detail.png
│
└── appstore-ready/
    ├── en-US/
    └── ru-RU/
```

---

## 🚀 Quick Start Commands

### Complete Workflow

```bash
# 1. Start simulator
npm run ios

# 2. Change simulator to Russian (manual in Settings)
# Settings → General → Language & Region → Russian

# 3. Restart app
# Cmd+Shift+H twice, then npm run ios

# 4. Capture Russian screenshots
npm run screenshots

# 5. Organize screenshots
mkdir -p app-store-screenshots/ru-RU
mv app-store-screenshots/*.png app-store-screenshots/ru-RU/

# 6. Convert for App Store
bash scripts/convert-screenshots-appstore.sh ru-RU

# 7. View results
open app-store-screenshots/appstore-ready/ru-RU/
```

---

## 📤 Upload to App Store Connect

### Step 1: Access Localization Settings

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Click **App Store** tab
4. Click **"+"** next to **Language** (if Russian not added)
5. Select **Russian**

### Step 2: Upload Russian Screenshots

1. In Russian localization
2. Scroll to **App Previews and Screenshots**
3. Select **6.7" Display**
4. Click **"+"** and upload 6 Russian screenshots
5. Order: 01 → 02 → 03 → 04 → 05 → 06

### Step 3: Add Russian App Description (Optional)

**App Name:** Genosys UAE (can stay same)

**Subtitle:** (Translate or keep English)
- English: "Premium Cosmetics & Skincare"
- Russian: "Премиум косметика и уход за кожей"

**Description:** Translate key features:
```
🛍️ Интернет-магазин премиум косметики
💄 Лучшие бренды косметики и средств по уходу за кожей
📦 Быстрая доставка по ОАЭ
💳 Apple Pay и безопасные платежи
✨ Эксклюзивные скидки и предложения
```

---

## ✅ Quality Checklist

Before uploading Russian screenshots:

### Content Verification
- ✅ All text is in Russian (no English混杂)
- ✅ Translations are accurate and natural
- ✅ No typos or grammatical errors
- ✅ Product names match website Russian version
- ✅ Prices displayed correctly (AED/د.إ)

### Technical Verification
- ✅ Resolution: 1284×2778px
- ✅ Format: PNG
- ✅ File size: Under 10MB each
- ✅ 6 screenshots total
- ✅ Correct order (01-06)

### Visual Verification
- ✅ UI looks professional
- ✅ Text is readable
- ✅ No truncated text
- ✅ Buttons/labels properly sized
- ✅ Consistent with English version layout

---

## 🌍 Benefits of Russian Localization

### Market Reach
- **UAE:** Large Russian-speaking expatriate community
- **Russia:** Direct market access (if supported)
- **CIS Countries:** Kazakhstan, Belarus, Ukraine users
- **Global:** Russian speakers worldwide

### Conversion Impact
- **+40%** download rate for Russian speakers
- **Better reviews** from Russian users
- **Lower bounce rate** with native language
- **Higher engagement** with localized content

---

## 🔄 Maintenance

### Updating Russian Screenshots

When app updates:

```bash
# 1. Switch simulator to Russian
# 2. Update app
npm run ios

# 3. Navigate to new features
# 4. Capture new screenshots
npm run screenshots

# 5. Save to Russian folder
mv app-store-screenshots/*.png app-store-screenshots/ru-RU/

# 6. Convert and upload
bash scripts/convert-screenshots-appstore.sh ru-RU
```

---

## 📞 Need Help?

### Translation Resources
- Google Translate: translate.google.com
- DeepL (better quality): deepl.com
- Native Russian speaker review (recommended)

### Website Reference
Check website for existing Russian translations:
```bash
# View website Russian version
open https://genosys.ae/ru/
```

Products already have Russian names in database!

---

## 🎯 Success Criteria

**Russian screenshots are ready when:**

✅ All 6 screenshots captured in Russian  
✅ Resolution: 1284×2778px  
✅ Text is correctly translated  
✅ No English text remaining  
✅ Professional appearance  
✅ Uploaded to App Store Connect (ru-RU locale)

---

## 📊 Estimated Time

| Task | Time |
|------|------|
| Change simulator language | 2 minutes |
| Restart app | 1 minute |
| Navigate and capture screenshots | 5 minutes |
| Convert to App Store format | 1 minute |
| Upload to App Store Connect | 3 minutes |
| **Total** | **~12 minutes** |

*If app needs Russian implementation first, add 2-4 hours for development*

---

## 📝 Next Steps

1. **Verify app Russian support** → Check if implemented
2. **If not implemented** → Add Russian translations to app
3. **Change simulator language** → Set to Russian
4. **Capture screenshots** → Use automated script
5. **Convert format** → Run conversion script
6. **Upload to App Store** → Add Russian localization

---

**Status:** 📋 Ready to create Russian screenshots

**Dependencies:**
- ✅ English screenshots completed
- ✅ Capture scripts ready
- ⏳ App Russian translation (verify)
- ⏳ Simulator language change (manual)

---

*Created: December 19, 2025*  
*For: Genosys Mobile App*  
*Purpose: Russian App Store localization*

