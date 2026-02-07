# Genosys Mobile App Documentation

This folder contains all documentation for the Genosys Mobile App.

## Quick Start

- [Main README](../README.md) - Project overview and setup
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Current feature implementation status
- [Build & Submit Commands](./BUILD_AND_SUBMIT_COMMANDS.md) - How to build and submit to App Store

## API & Integration

- [API Endpoints Needed](./API_ENDPOINTS_NEEDED.md) - List of required API endpoints
- [API Connection Success](./API_CONNECTION_SUCCESS.md) - API integration verification
- [Mobile API Implementation](./MOBILE_API_IMPLEMENTATION.md) - Mobile API details
- [Database Integration](./DATABASE_INTEGRATION.md) - Database setup and integration
- [Database Driven Integration](./DATABASE_DRIVEN_INTEGRATION_COMPLETE.md) - Database-driven features
- [Existing Database Integration](./EXISTING_DATABASE_INTEGRATION.md) - Integration with existing DB

## Authentication

- [Setup Authentication](./SETUP_AUTHENTICATION.md) - Auth setup guide
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md) - Google sign-in configuration

## UI & Features

- [Size Variants Implementation](./SIZE_VARIANTS_IMPLEMENTATION.md) - Product size variants
- [Footer Icon Enhancements](./FOOTER_ICON_ENHANCEMENTS.md) - Tab bar improvements
- [Bag Icon Color Change](./BAG_ICON_COLOR_CHANGE.md) - Cart icon styling
- [Orders Icon Color Change](./ORDERS_ICON_COLOR_CHANGE.md) - Orders icon styling
- [Orders Count Debug](./ORDERS_COUNT_DEBUG.md) - Orders badge debugging
- [Skeleton Loading Screens](./SKELETON_LOADING_SCREENS.md) - Shimmer placeholders for loading states
- [Haptic Feedback](./HAPTIC_FEEDBACK.md) - Tactile feedback on key actions

## Performance & UX Enhancements

- [expo-image Migration](./EXPO_IMAGE_MIGRATION.md) - Image caching and performance upgrade
- [Offline Product Cache](./OFFLINE_PRODUCT_CACHE.md) - Browse products without internet
- [Deep Linking](./DEEP_LINKING.md) - Universal links and custom URL scheme configuration

## RTL & Localization

- [Complete RTL Summary](./COMPLETE_RTL_SUMMARY.md) - Full RTL implementation overview
- [RTL Implementation Status](./RTL_IMPLEMENTATION_STATUS.md) - RTL progress tracking
- [Shop Screen RTL Support](./SHOP_SCREEN_RTL_SUPPORT.md) - Shop RTL layout
- [Bag Page RTL Support](./BAG_PAGE_RTL_SUPPORT.md) - Cart RTL layout
- [Login RTL Arabic Support](./LOGIN_RTL_ARABIC_SUPPORT.md) - Login RTL layout
- [Login Buttons RTL Fix](./LOGIN_BUTTONS_RTL_FIX.md) - Auth buttons RTL
- [Login Localization Fix](./LOGIN_LOCALIZATION_FIX.md) - Login translations
- [Profile Subpages RTL Guide](./PROFILE_SUBPAGES_RTL_GUIDE.md) - Profile RTL guide

## Bag/Cart

- [Bag Page Best Practices Fix](./BAG_PAGE_BEST_PRACTICES_FIX.md) - Cart best practices

## Build & Deployment

- [Build Status](./BUILD_STATUS.md) - Current build status
- [Network Error Resolution](./NETWORK_ERROR_RESOLUTION.md) - Network debugging

## App Store

- [App Store Assets](./app-store/APP_STORE_ASSETS.md) - Assets for App Store
- [Apple Review Documentation](./app-store/APPLE_REVIEW_DOCUMENTATION.md) - Review preparation
- [Shotlist](./app-store/SHOTLIST.md) - Screenshot planning

## Screenshots

- [Screenshots Overview](./screenshots/SCREENSHOTS.md) - Screenshot documentation
- [Screenshot Guide](./screenshots/SCREENSHOT_GUIDE.md) - How to capture screenshots
- [Screenshot Capture README](./screenshots/SCREENSHOT_CAPTURE_README.md) - Capture scripts
- [Screenshot Capture Complete](./screenshots/SCREENSHOT_CAPTURE_COMPLETE.md) - Completion status
- [Screenshot Mission Complete](./SCREENSHOT_MISSION_COMPLETE.md) - Mission summary
- [Quick Checklist](./screenshots/QUICK_CHECKLIST.md) - Quick reference
- [Upload Ready](./screenshots/UPLOAD_READY.md) - Ready for upload

### Russian Screenshots

- [Russian Screenshots Guide](./screenshots/RUSSIAN_SCREENSHOTS_GUIDE.md) - Russian localization
- [Russian Quick Start](./screenshots/RUSSIAN_QUICK_START.md) - Quick start for Russian
- [Russian Implementation Complete](./screenshots/RUSSIAN_IMPLEMENTATION_COMPLETE.md) - Russian completion
- [Russian Capture Session](./RUSSIAN_CAPTURE_SESSION.md) - Russian capture notes

## File Organization

```
docs/
├── README.md                      # This file (documentation index)
├── IMPLEMENTATION_SUMMARY.md      # Database integration summary
├── DEEP_LINKING.md                # Universal links & custom URL scheme
├── OFFLINE_PRODUCT_CACHE.md       # Offline product browsing
├── SKELETON_LOADING_SCREENS.md    # Shimmer loading placeholders
├── EXPO_IMAGE_MIGRATION.md        # expo-image performance upgrade
├── HAPTIC_FEEDBACK.md             # Tactile feedback system
├── *.md                           # Other documentation
├── app-store/                     # App Store submission docs
│   ├── APP_STORE_ASSETS.md
│   ├── APPLE_REVIEW_DOCUMENTATION.md
│   └── SHOTLIST.md
└── screenshots/                   # Screenshot documentation
    ├── SCREENSHOTS.md
    ├── SCREENSHOT_GUIDE.md
    └── ...
```
