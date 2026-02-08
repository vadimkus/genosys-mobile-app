# Genosys Mobile App — Documentation

> iOS app for GENOSYS Professional Korean Dermacosmetics (genosys.ae)
>
> Tech: React Native (Expo), TypeScript, expo-router, expo-image, expo-av

---

## Quick Start

| Doc | Description |
|-----|-------------|
| [Main README](../README.md) | Project overview, install, and run |
| [Build & Submit](./build/BUILD_AND_SUBMIT_COMMANDS.md) | How to build and submit to App Store |
| [Build Status](./build/BUILD_STATUS.md) | Current build status |

---

## Core Features

| Doc | Description |
|-----|-------------|
| [Shop Page](./core/SHOP_PAGE_FEATURES.md) | Product catalog, categories, search, banners |
| [Product Detail Updates](./core/PRODUCT_DETAIL_UPDATES.md) | Image gallery, video player, trust badges (Feb 2026) |
| [Dynamic Content](./core/DYNAMIC_CONTENT.md) | Backend-driven images & videos (no app rebuild needed) |
| [Session Log 7 Feb 2026](./core/SESSION_LOG_2026_02_07.md) | Menu redesign, multi-category, images, videos |
| [Session Log 7–8 Feb (cont.)](./core/SESSION_LOG_2026_02_07_continued.md) | Request Quote, Bio Meso, voice search, more images/videos, dot fix |
| [Session Log 8 Feb 2026](./core/SESSION_LOG_2026_02_08.md) | WebView auth bridge, translation fixes, isPriceOnRequest on all pages |
| [Checkout Flow](./core/CHECKOUT_FLOW.md) | Delivery details, payment, order submission |
| [Orders](./core/ORDERS_PAGES.md) | Orders list, order detail, reorder |
| [Waterfall Pricing](./core/WATERFALL_PRICING.md) | Transparent discount breakdown (VIP, bundle) |
| [Chatbot (Genie)](./core/CHATBOT.md) | AI chatbot: greetings, quick actions, SSE API |
| [Deep Linking](./core/DEEP_LINKING.md) | Universal links and custom URL scheme |
| [Offline Cache](./core/OFFLINE_PRODUCT_CACHE.md) | Browse products without internet |
| [Empty States](./core/EMPTY_STATES.md) | Unicorn mascot on empty favorites/orders |
| [Skeleton Loaders](./core/SKELETON_LOADING_SCREENS.md) | Shimmer placeholders for loading states |
| [Haptic Feedback](./core/HAPTIC_FEEDBACK.md) | Tactile feedback on key actions |
| [Animations](./core/ANIMATIONS.md) | Animation policy: what's kept vs removed |

---

## API & Backend

| Doc | Description |
|-----|-------------|
| [API Endpoints](./api/API_ENDPOINTS_NEEDED.md) | Required API endpoints list |
| [API Connection](./api/API_CONNECTION_SUCCESS.md) | API integration verification |
| [Mobile API](./api/MOBILE_API_IMPLEMENTATION.md) | Mobile API details |
| [Database Integration](./api/DATABASE_INTEGRATION.md) | Database setup and integration |
| [DB-Driven Features](./api/DATABASE_DRIVEN_INTEGRATION_COMPLETE.md) | Database-driven features |
| [Existing DB Integration](./api/EXISTING_DATABASE_INTEGRATION.md) | Integration with existing DB |

---

## Setup & Auth

| Doc | Description |
|-----|-------------|
| [Authentication Setup](./setup/SETUP_AUTHENTICATION.md) | Auth setup guide |
| [Google OAuth](./setup/GOOGLE_OAUTH_SETUP.md) | Google sign-in configuration |

---

## UI Components

| Doc | Description |
|-----|-------------|
| [Size Variants](./ui/SIZE_VARIANTS_IMPLEMENTATION.md) | Product size variant selector |
| [Footer Icons](./ui/FOOTER_ICON_ENHANCEMENTS.md) | Tab bar improvements |
| [Bag Icon](./ui/BAG_ICON_COLOR_CHANGE.md) | Cart icon styling |
| [Orders Icon](./ui/ORDERS_ICON_COLOR_CHANGE.md) | Orders icon styling |
| [expo-image Migration](./ui/EXPO_IMAGE_MIGRATION.md) | Image caching and performance |

---

## RTL & Localization

| Doc | Description |
|-----|-------------|
| [RTL Summary](./rtl/COMPLETE_RTL_SUMMARY.md) | Full RTL implementation overview |
| [RTL Status](./rtl/RTL_IMPLEMENTATION_STATUS.md) | RTL progress tracking |
| [Shop RTL](./rtl/SHOP_SCREEN_RTL_SUPPORT.md) | Shop page RTL layout |
| [Bag RTL](./rtl/BAG_PAGE_RTL_SUPPORT.md) | Cart page RTL layout |
| [Login RTL](./rtl/LOGIN_RTL_ARABIC_SUPPORT.md) | Login page RTL layout |
| [Login Buttons RTL](./rtl/LOGIN_BUTTONS_RTL_FIX.md) | Auth buttons RTL fix |
| [Login Localization](./rtl/LOGIN_LOCALIZATION_FIX.md) | Login translations fix |
| [Profile RTL](./rtl/PROFILE_SUBPAGES_RTL_GUIDE.md) | Profile subpages RTL guide |

---

## Build & Deploy

| Doc | Description |
|-----|-------------|
| [Build Commands](./build/BUILD_AND_SUBMIT_COMMANDS.md) | Build and submit to App Store |
| [Build Status](./build/BUILD_STATUS.md) | Current build status |
| [Network Errors](./build/NETWORK_ERROR_RESOLUTION.md) | Network debugging |

---

## App Store

| Doc | Description |
|-----|-------------|
| [App Store Assets](./app-store/APP_STORE_ASSETS.md) | Assets for App Store listing |
| [Apple Review](./app-store/APPLE_REVIEW_DOCUMENTATION.md) | Review preparation |
| [Shotlist](./app-store/SHOTLIST.md) | Screenshot planning |

---

## Screenshots

| Doc | Description |
|-----|-------------|
| [Overview](./screenshots/SCREENSHOTS.md) | Screenshot documentation |
| [Guide](./screenshots/SCREENSHOT_GUIDE.md) | How to capture screenshots |
| [Capture Scripts](./screenshots/SCREENSHOT_CAPTURE_README.md) | Automated capture scripts |
| [Capture Complete](./screenshots/SCREENSHOT_CAPTURE_COMPLETE.md) | Completion status |
| [Quick Checklist](./screenshots/QUICK_CHECKLIST.md) | Quick reference |
| [Upload Ready](./screenshots/UPLOAD_READY.md) | Ready for upload |
| [Russian Guide](./screenshots/RUSSIAN_SCREENSHOTS_GUIDE.md) | Russian localization screenshots |
| [Russian Quick Start](./screenshots/RUSSIAN_QUICK_START.md) | Russian quick start |
| [Russian Complete](./screenshots/RUSSIAN_IMPLEMENTATION_COMPLETE.md) | Russian completion |

---

## Archive

Older docs kept for reference. These cover completed tasks or debugging sessions.

| Doc | Description |
|-----|-------------|
| [Implementation Summary](./archive/IMPLEMENTATION_SUMMARY.md) | Original DB integration summary |
| [Orders Count Debug](./archive/ORDERS_COUNT_DEBUG.md) | Orders badge debugging |
| [Bag Best Practices](./archive/BAG_PAGE_BEST_PRACTICES_FIX.md) | Cart best practices fix |
| [Screenshot Mission](./archive/SCREENSHOT_MISSION_COMPLETE.md) | Screenshot mission summary |
| [Russian Capture Session](./archive/RUSSIAN_CAPTURE_SESSION.md) | Russian capture notes |

---

## Folder Structure

```
docs/
├── README.md                  # This file — documentation index
├── core/                      # Core feature documentation
│   ├── PRODUCT_DETAIL_UPDATES.md   # Image gallery, video, badges (Feb 2026)
│   ├── DYNAMIC_CONTENT.md          # Backend-driven images & videos
│   ├── SESSION_LOG_2026_02_07.md   # Menu redesign, categories, images, videos
│   ├── SESSION_LOG_2026_02_07_continued.md  # Request Quote, voice search, more images
│   ├── SESSION_LOG_2026_02_08.md          # WebView auth bridge, translations, isPriceOnRequest
│   ├── SHOP_PAGE_FEATURES.md       # Shop page features
│   ├── CHECKOUT_FLOW.md            # Checkout flow
│   ├── ORDERS_PAGES.md             # Orders pages
│   ├── WATERFALL_PRICING.md        # Pricing breakdown
│   ├── CHATBOT.md                  # AI chatbot
│   ├── DEEP_LINKING.md             # Universal links
│   ├── OFFLINE_PRODUCT_CACHE.md    # Offline browsing
│   ├── EMPTY_STATES.md             # Empty state screens
│   ├── SKELETON_LOADING_SCREENS.md # Loading placeholders
│   ├── HAPTIC_FEEDBACK.md          # Tactile feedback
│   └── ANIMATIONS.md               # Animation policy
├── api/                       # API and backend integration
├── setup/                     # Auth and setup guides
├── ui/                        # UI component documentation
├── rtl/                       # RTL and localization
├── build/                     # Build, deploy, and debugging
├── app-store/                 # App Store submission
├── screenshots/               # Screenshot capture guides
└── archive/                   # Completed/legacy docs
```
