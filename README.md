# Genosys Mobile App

A production-ready **iOS and Android** e-commerce app for GENOSYS Professional skincare, built with React Native (Expo) featuring Apple Store design system aesthetics.

## Features

### E-commerce
- **Product Catalog**: Full product browsing with categories and search
- **Shopping Cart**: Persistent cart with variant selection (size/color)
- **Checkout**: Multi-step checkout with COD and Card (Stripe)
- **Order Management**: Order history, details, and quick reorder
- **Favorites/Wishlist**: Save products for later

### User Experience
- **Multi-language**: English, Russian, Arabic (RTL support)
- **Authentication**: Email/Password, Google OAuth, Apple Sign-In, Biometrics
- **Profile Management**: Edit profile, addresses, payment preferences
- **Product Sharing**: Share products via native share sheet

### Design
- **Apple Store Design**: Large typography, clean cards, smooth animations
- **Glass-morphism Tab Bar**: Transparent blur effects for iOS
- **Parallax Product Details**: Hero images with zoom animations
- **Pull-to-refresh**: On all main screens

## Tech Stack

- **Framework**: React Native (Expo SDK ~54.0)
- **Router**: Expo Router (File-based routing)
- **State**: React Context API
- **Storage**: AsyncStorage
- **Payments**: Stripe (web checkout)
- **Icons**: Ionicons (Expo Vector Icons)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Project Structure

```
genosys-mobile-app/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation (shop, orders, bag)
│   ├── auth/               # Authentication screens
│   ├── product/            # Product detail
│   ├── profile/            # Profile and settings
│   ├── checkout.js         # Checkout flow
│   └── payment/            # Payment screens
├── components/             # Reusable UI components
├── contexts/               # React Context providers
├── services/               # API and business logic
├── utils/                  # Utility functions
├── config/                 # Configuration files
├── i18n/                   # Localization (en, ru, ar)
├── docs/                   # All documentation
│   ├── README.md           # Documentation index
│   ├── app-store/          # App Store submission docs
│   └── screenshots/        # Screenshot documentation
└── assets/                 # Images and static assets
```

## API Integration

- **Endpoint**: `https://genosys.ae/api/mobile`
- **Authentication**: API key via `x-api-key` header

## Documentation

All documentation is centralized in the `docs/` folder. See [docs/README.md](docs/README.md) for the full documentation index.

## Design System

- **Typography**: Large titles (34px), section headers (22px), body text (16px)
- **Colors**: White background, grouped gray (#F5F5F7), accent red (#dc2626)
- **Cards**: 12px radius, soft shadows

## Build & Submit

### iOS (App Store)

```bash
# Build for iOS
npm run build:ios:production

# Submit to App Store
npm run submit:ios
```

### Android (Google Play)

```bash
# Build preview APK for testing
npm run build:android:preview

# Build for Google Play
npm run build:android:production

# Submit to Google Play
npm run submit:android
```

See [docs/build/BUILD_AND_SUBMIT_COMMANDS.md](docs/build/BUILD_AND_SUBMIT_COMMANDS.md) for iOS instructions.
See [docs/build/ANDROID_BUILD_GUIDE.md](docs/build/ANDROID_BUILD_GUIDE.md) for Android instructions.
