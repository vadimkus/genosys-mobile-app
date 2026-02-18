# Google Play Console Setup — Complete Guide

> Step-by-step documentation for setting up and publishing Genosys UAE on Google Play.
>
> **Last Updated:** February 14, 2026

---

## Overview

| Item | Value |
|------|-------|
| **App Name** | Genosys UAE |
| **Package Name** | ae.genosys.app |
| **Version** | 1.4.0 |
| **Version Code** | 59 (auto-incremented) |
| **Build System** | EAS Build (Expo Application Services) |
| **Submit Method** | EAS Submit (service account) or manual upload |

---

## 1. Developer Account Setup

### 1.1 Play Console & Android Experience

When asked: *"Tell us about your previous experience with Play Console and Android"*

**Suggested response:**

> **Play Console**
> - Managing the Genosys UAE app (package: ae.genosys.app) in Play Console
> - Publishing releases to production and internal testing tracks
> - Configuring app listing, store listing, content rating, and Data Safety
> - Using EAS Submit with a service account for automated uploads
> - Handling app updates and version management
>
> **Apps built and published**
> - **Genosys UAE** — E-commerce app for professional Korean dermacosmetics in the UAE. Features: AI skin analysis (GPT-4 Vision), shopping cart, Stripe payments, push notifications, multilingual support (EN/AR/RU), deep linking, biometric auth. Built with React Native (Expo SDK 54).
>
> **Android development**
> - React Native (Expo) development with Android-specific handling (keyboard behavior, elevation/shadows, notification channels, Chrome Custom Tabs)
> - EAS Build for production AAB builds
> - Android SDK 23–35, adaptive icons, intent filters for deep links
> - Testing on Android emulators (API 34) and physical devices
>
> **Supporting links:** https://genosys.ae

---

### 1.2 Earning Money on Google Play

**Question:** Does your organization plan to earn money from the apps you publish on Google Play?

**Answer:** Yes

**How does your organization plan to earn money?**

**Answer:** Select **Other**, then enter:

> Physical product sales (e-commerce). The app sells professional cosmetic products that are shipped to customers in the UAE. Revenue comes from orders placed in the app and paid via Cash on Delivery (COD) or card payments (Stripe). No digital goods, subscriptions, or in-app purchases.

---

### 1.3 App Categories

**Question:** Does your organization plan to publish any of the following types of apps?

**Answer:** **None of the above**

Genosys UAE is an e-commerce/shopping app and does not fall under kids, COVID, government, election, news, telehealth, tobacco, banking, crowdfunding, crypto, loans, gambling, or other financial services.

---

## 2. Dashboard Setup Checklist

Before submitting a build, complete all required items on the **Dashboard**:

| Task | Genosys UAE Setting |
|------|---------------------|
| **App access** | Login optional; most content public |
| **Ads declaration** | No ads |
| **Content rating** | Complete IARC questionnaire → typically "Everyone" or similar |
| **Target audience** | 18+ or general audience |
| **News app** | No |
| **COVID-19 app** | No |
| **Data safety** | Declare: email, name, address, payment (Stripe), photos (AI), push token |
| **Privacy policy** | https://genosys.ae/privacy-policy |
| **Store listing** | App name, short description, full description, screenshots, feature graphic, icon |
| **App signing** | Use Google Play App Signing (recommended) |

---

## 3. Build & Submit (EAS)

### 3.1 Both Platforms Use EAS

| Platform | Build Command | Submit Command | Output |
|----------|---------------|----------------|--------|
| **Android** | `npm run build:android:production` | `npm run submit:android` | AAB |
| **iOS** | `npm run build:ios:production` | `npm run submit:ios` | IPA |

### 3.2 Build Android Production AAB

```bash
cd /Users/vadimkus/genosys-mobile-app
npm run build:android:production
```

Or directly:

```bash
eas build --platform android --profile production:android
```

**What happens:**
- Resolves `production` environment (loads `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- Uses remote Android credentials (Expo server)
- Auto-increments `versionCode` in app.json (e.g., 58 → 59)
- Compresses and uploads project to EAS
- Builds AAB (Android App Bundle) in the cloud
- Build logs: https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/builds

### 3.3 First Build: Android Keystore

On **first ever** Android build, EAS will prompt:

```
✔ Generate a new Android Keystore? … yes
```

- **First release:** Choose **Yes** — EAS creates and stores the keystore
- **Existing app (already published):** Choose **No** — use existing credentials

⚠️ **Critical:** Never generate a new keystore for an app already on Play Store. Google rejects updates signed with a different key.

### 3.4 Submit to Google Play

**Option A: EAS Submit (automated)**

```bash
npm run submit:android
```

Requires `google-play-service-account.json` in project root. Submits to **internal** track (configurable in `eas.json`).

**Option B: Manual upload**

1. Download AAB from [EAS builds](https://expo.dev/accounts/vadimkus/projects/genosys-mobile-app/builds)
2. Play Console → **Test and release** → **Production** (or Internal testing)
3. **Create new release** → Upload AAB
4. Fill release details (see Section 4)
5. Submit for review

---

## 4. Release Details

When creating a release in Play Console, you must fill:

### 4.1 Release Name (Required)

Internal identifier, max 50 characters. Not shown to users.

**Examples:**
- `1.4.0 (59)`
- `Genosys UAE 1.4.0 - Initial release`

### 4.2 Release Notes

Shown to users on the store listing. Use language tags for localization.

**English (en-US):**

```
<en-US>
Welcome to Genosys UAE — your destination for professional Korean dermacosmetics in the UAE.

• AI Skin Analysis — Get personalized skin insights and product recommendations
• Build Your Set — Create your perfect skincare routine with tiered discounts
• Shop professional Korean beauty products — cleansers, serums, creams, and more
• Product videos and guides — Learn how to use each product
• Secure checkout — Order with Cash on Delivery or card payment
• Multilingual — English, Arabic, and Russian with RTL support

Official distributor of DTSMG Co., Ltd, Korea since 2019. Products certified in Montaji System by Dubai Municipality.
</en-US>
```

**Arabic (ar):**

```
<ar>
مرحباً بكم في Genosys UAE — وجهتك لمستحضرات التجميل الكورية الاحترافية في الإمارات.

• تحليل البشرة بالذكاء الاصطناعي
• بناء مجموعتك
• تسوق منتجات الجمال الكورية الاحترافية
• فيديوهات ومجلدات المنتجات
• دفع آمن — الدفع عند الاستلام أو البطاقة
• متعدد اللغات — الإنجليزية والعربية والروسية
</ar>
```

**Russian (ru):**

```
<ru>
Добро пожаловать в Genosys UAE — профессиональная корейская дермокосметика в ОАЭ.

• Анализ кожи с ИИ
• Собери свой набор
• Профессиональная корейская косметика
• Видео и руководства по продуктам
• Безопасная оплата — наличными или картой
• Мультиязычность — английский, арабский, русский
</ru>
```

---

## 5. EAS Configuration

### 5.1 eas.json (relevant sections)

```json
{
  "build": {
    "production:android": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 5.2 Service Account (for EAS Submit)

1. Google Cloud Console → Create Service Account
2. Grant "Service Account User" role
3. Download JSON key → save as `google-play-service-account.json` in project root
4. Play Console → Users and permissions → Add service account with release permissions

---

## 6. Build Credits & Billing

- **Free tier:** Limited builds per month
- **Pay-as-you-go:** Additional builds charged when free credits exhausted
- **Billing:** https://expo.dev/accounts/vadimkus/settings/billing

When you see:
```
You've used 100% of your included build credits for this month.
Additional usage beyond your limit will be charged at pay-as-you-go rates.
```
The build will still proceed; you'll be charged for the extra usage.

---

## 7. EAS CLI

### Upgrade to latest

```bash
npm install -g eas-cli
```

### Verify version

```bash
eas --version
```

Current: `eas-cli/18.0.1` (as of Feb 2026)

---

## 8. Quick Reference

| Action | Command |
|--------|---------|
| Build Android production | `npm run build:android:production` |
| Build iOS production | `npm run build:ios:production` |
| Submit Android | `npm run submit:android` |
| Submit iOS | `npm run submit:ios` |
| List recent builds | `eas build:list --platform android --limit 5` |
| View build logs | `eas build:view <build-id>` |

---

## 9. Related Documentation

- [Google Play Review Documentation](./GOOGLE_PLAY_REVIEW_DOCUMENTATION.md) — Test account, testing instructions, permissions
- [Android Build Guide](../build/ANDROID_BUILD_GUIDE.md) — Emulator, local dev, troubleshooting
- [Build & Submit Commands](../build/BUILD_AND_SUBMIT_COMMANDS.md) — iOS build and submit
