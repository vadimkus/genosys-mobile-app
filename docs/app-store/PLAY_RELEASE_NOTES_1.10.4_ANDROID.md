# Google Play Release — Genosys UAE 1.10.4 (versionCode 88)

**Date:** July 3, 2026
**Platform:** Android (app-bundle, Play internal track → promote to production)
**Runtime version:** 1.10.4 (reconnects Android to the OTA update pipeline)
**Previous Play release:** 1.10.2 (versionCode 86, June 12, 2026)

## Why this release matters

Android users have been frozen on the pre-redesign app since June 12: all EAS (OTA)
updates after ~June 20 targeted runtime `1.10.4`, while the Play build embedded
runtime `1.10.2`. This build closes that gap — Android users jump straight to the
fully redesigned app and start receiving OTA updates again.

## What's new for Android users (1.10.2 → 1.10.4)

### Native payment sheet (new revenue path on Android)
- Native Stripe Payment Sheet with **Google Pay** support (AED, UAE merchant)
- No more browser hand-off during checkout; 3-D Secure handled in-app
- Friendly pre-payment screen (gray unicorn, no spinner)
- Unified animated order-success screen for both card and COD orders

### Full app redesign (Apple-grade native feel, applies to Android too)
- Grouped-gray background, soft-shadow cards, icon tiles, tinted status capsules
- Scroll-aware fading navigation headers across all screens
- Redesigned: Orders, Order Details, Profile (+ all sub-screens), Bag, Checkout,
  Shop, Product, Favorites, Auth, Skin Analysis, Bundle Builder, Chat, Blog,
  About/Brand/Delivery/Contact/FAQ/Locations/Partners/Training, WebView
- Hamburger menu removed — everything lives in Profile now
- Splash screen flicker fixed (proper native → JS handoff)

### Product & content fixes
- Product cards: full image visible (no cropping), white tiles, cleaner badges
- Product 51 (Bio-Ferment mask): 4-image gallery, no video
- Fullscreen image viewer: close button correctly positioned on first open
- Legal pages: Privacy Policy & Terms dates updated (June 20, 2026)
- Full EN / AR / RU localization parity (1,445 keys per locale)

## Play Console "What's new" copy (≤500 chars each)

### English
```
Genosys UAE 1.10.4 — our biggest update yet:
• All-new modern design across the entire app
• Native checkout with Google Pay — faster, safer payments
• Smoother navigation: everything now lives in your Profile
• Redesigned orders, bag, shop and product pages
• Sharper product photos and galleries
• Fixed splash screen flicker and many polish fixes
• Full English, Arabic and Russian support
```

### Arabic
```
‏Genosys UAE 1.10.4 — أكبر تحديث حتى الآن:
• تصميم عصري جديد كليًا في جميع أنحاء التطبيق
• دفع أصلي مع Google Pay — مدفوعات أسرع وأكثر أمانًا
• تنقّل أسهل: كل شيء الآن في ملفك الشخصي
• صفحات محسّنة للطلبات والحقيبة والمتجر والمنتجات
• صور منتجات وأستوديوهات أوضح
• إصلاح وميض شاشة البداية وتحسينات كثيرة
• دعم كامل للعربية والإنجليزية والروسية
```

### Russian
```
Genosys UAE 1.10.4 — наше самое большое обновление:
• Полностью новый современный дизайн всего приложения
• Нативная оплата с Google Pay — быстрее и безопаснее
• Удобная навигация: всё теперь в вашем профиле
• Обновлённые страницы заказов, корзины, магазина и товаров
• Более чёткие фото товаров и галереи
• Исправлено мерцание заставки и множество мелких улучшений
• Полная поддержка русского, английского и арабского
```

## Build / submit commands used

```bash
eas build --platform android --profile production:android --non-interactive
eas submit --platform android --profile production:android --id <build-id>
```

- Submit goes to the **internal** track first (same flow as v85/v86); promote to
  production in Play Console after a quick smoke test.
- Keystore: EAS-managed (Build Credentials 2h9CFRBXLs).

## Post-release checklist

- [ ] Install from Play internal track; verify redesign is live
- [ ] Test Google Pay payment end-to-end (live mode, small order)
- [ ] Verify COD order + success screen
- [ ] Confirm an OTA lands on Android (publish any update, relaunch twice)
- [ ] Verify App Links still open the app (genosys.ae/products/51)
- [ ] Promote to production track

## Fixed during this session

- `scripts/sync-runtime-version.js` now also syncs `expo_runtime_version` in
  `android/app/src/main/res/values/strings.xml` (was stuck at 1.10.2 locally;
  EAS builds regenerate android/ via prebuild, local native builds now match).
- `eas.json`: added `submit.production:android` profile so `--auto-submit`
  resolves when building with the `production:android` profile.
