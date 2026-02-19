# Haptic Feedback

## Overview

Every interactive element in the app provides haptic feedback via the centralized `utils/haptics.js` utility. All screens use this utility exclusively — no direct `expo-haptics` imports exist outside the utility itself.

---

## Haptic Types Used

| Function | Haptic Type | Feel | Used For |
|---|---|---|---|
| `lightTap()` | Impact Light | Subtle tap | Navigation, back buttons, card presses, toggles, expand/collapse |
| `mediumTap()` | Impact Medium | Noticeable tap | Form submissions, save/send/pay buttons, add to cart, confirmations |
| `heavyTap()` | Impact Heavy | Strong tap | Destructive actions (delete, sign out, delete account) |
| `success()` | Notification Success | Satisfying double-tap | Order placed, login success, profile saved, password reset |
| `warning()` | Notification Warning | Alert buzz | Validation errors, failed login attempts |
| `error()` | Notification Error | Strong alert | Hard failures (network error, payment declined) |
| `selectionTick()` | Selection | Tiny click | Picker changes, language/emirate/category selection, switch toggles |

---

## Coverage (40 files, ~190 haptic points)

### Core Screens

| Screen | Haptic Points | Key Interactions |
|---|---|---|
| `app/(tabs)/shop.js` | 4 | Category switch, add to bag, product press, voice search |
| `app/product/[id].js` | 2 | Add to bag, product interaction |
| `app/(tabs)/bag.js` | 1 | Checkout button |
| `app/checkout.js` | 6 | Payment method, emirate, submit, validation, order placed |
| `app/profile.js` | 16 | All menu items, quick actions, switches, sign out |
| `app/favorites.js` | 6 | Product press, add to cart, heart toggle, back, browse |

### Auth Screens

| Screen | Haptic Points | Key Interactions |
|---|---|---|
| `app/auth/login.js` | 32 | Login, register, biometric, Google, Apple, success/error for each path |
| `app/auth/forgot-password.js` | 6 | Send code, success, error, back |
| `app/auth/reset-password.js` | 8 | Reset, success, error, back |

### Content Screens

| Screen | Haptic Points | Key Interactions |
|---|---|---|
| `app/skin-concerns.js` | 1 | Concern card press |
| `app/concern-detail.js` | 6 | PDF download, product press, related, essentials |
| `app/skin-analysis.js` | 2 | Next step, toggle concern |
| `app/skin-analysis-camera.js` | 3 | Capture, analysis success, add to cart |
| `app/bundle-builder.js` | 7 | Product toggle, step nav, expand/collapse, clear, success |
| `app/training.js` | 2 | Document open, video open |
| `app/faq.js` | 3 | Toggle FAQ, WhatsApp, email |
| `app/blog/index.js` | 3 | Post press, back, retry |
| `app/blog/[slug].js` | 1 | Comment submitted |
| `app/brand.js` | 1 | Video open |
| `app/partners.js` | 4 | Toggle, call, directions, website |
| `app/locations.js` | 1 | Location toggle |
| `app/delivery.js` | 3 | Method select, rate select, WhatsApp |
| `app/chat.js` | 4 | Send, quick action, add to bag, view product |
| `app/about.js` | 2 | Back, links |
| `app/contact.js` | 2 | Contact cards, back |
| `app/webview.js` | 5 | Back, reload, go back, retry |

### Profile Screens

| Screen | Haptic Points | Key Interactions |
|---|---|---|
| `app/profile/edit.js` | 7 | Save, picture, gender, date, delete, success |
| `app/profile/orders.js` | 5 | Expand, pay, delete, back |
| `app/profile/orders/[id].js` | 3 | Reorder, pay, back |
| `app/profile/addresses.js` | 4 | Card, add, more, delete |
| `app/profile/add-address.js` | 5 | Type, emirate, save, success, default switch |
| `app/profile/language.js` | 1 | Language selection |
| `app/profile/contact.js` | 1 | Contact cards |
| `app/profile/help.js` | 2 | FAQ toggle, support cards |
| `app/profile/payment.js` | 1 | Payment method |
| `app/profile/about.js` | 2 | Back, links |
| `app/profile/promo.js` | 1 | Back |
| `app/profile/terms.js` | 1 | Back |
| `app/profile/privacy.js` | 1 | Back |

### Components

| Component | Haptic Points | Key Interactions |
|---|---|---|
| `components/NavigationDrawer.js` | 19 | All nav items, highlights, auth, backdrop |
| `components/ChatButton.js` | 8 | FAB, quick actions, send, add to bag, view, close |
| `components/ProductGridItem.js` | 1 | Product card press |

---

## Implementation

### Utility Module: `utils/haptics.js`

All haptic calls go through a safe wrapper that catches errors silently:
- No crashes on iOS Simulator (haptics unavailable)
- No crashes in Expo Go on Android
- No crashes on devices without haptic hardware
- Graceful degradation on all platforms

```javascript
import * as haptics from '../utils/haptics';

haptics.lightTap();       // Navigation, toggles
haptics.mediumTap();      // Confirmations, save/pay
haptics.heavyTap();       // Destructive actions
haptics.success();        // Completed actions
haptics.warning();        // Validation errors
haptics.error();          // Hard failures
haptics.selectionTick();  // Picker/category changes
```

---

## Platform Notes

| Platform | Behavior |
|---|---|
| iPhone (physical) | Full haptic engine support |
| iOS Simulator | No haptics (silently skipped) |
| Android (with vibration motor) | Vibration-based haptics |
| Android (no motor) | Silently skipped |
| Expo Go (iOS) | Works on physical devices |
| Expo Go (Android) | May not work (silently skipped) |

---

## Guidelines for Adding New Haptics

1. **Always import from utility**: `import * as haptics from '../utils/haptics'` — never import `expo-haptics` directly
2. **Use sparingly**: Only on meaningful user actions, not on every tap
3. **Match intensity to importance**: `lightTap` for minor, `success` for significant, `heavyTap` for destructive
4. **Never block on haptics**: All calls are fire-and-forget
5. **Test on physical device**: Simulator/emulator cannot reproduce haptic feel
6. **Don't use for scrolling or passive events**: Only for active user decisions
7. **Add `selectionTick()` for picker/toggle changes**: Gives a distinct "selection" feel vs a tap
