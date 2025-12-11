# Genosys Mobile App

A high-fidelity iOS e-commerce app built with React Native (Expo) that mimics the Apple Store design system.

## 🚀 Features

- **Apple Store Design System**: Large typography, clean cards, and smooth animations
- **Live API Integration**: Connects to Genosys Vercel API with secure authentication
- **Parallax Product Details**: Hero images with zoom animations
- **Glass-morphism Tab Bar**: Transparent blur effects for iOS
- **File-based Routing**: Clean navigation with Expo Router

## 📱 Tech Stack

- **Framework**: React Native (Expo SDK 50+)
- **Router**: Expo Router (File-based routing)
- **Styling**: StyleSheet (Standard React Native)
- **Animations**: react-native-reanimated
- **Blur Effects**: expo-blur
- **Icons**: lucide-react-native

## 🛠 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS simulator:
```bash
npm run ios
```

## 📂 Project Structure

```
app/
├── _layout.js              # Root stack layout
├── (tabs)/
│   ├── _layout.js          # Transparent tab bar with blur
│   ├── shop.js             # Main shop screen with live API
│   └── bag.js              # Cart screen
└── product/
    └── [id].js             # Product detail with parallax

components/
├── HeroCard.js             # Horizontal scroll card
├── ProductGridItem.js      # Grid item component
└── ParallaxScrollView.js   # Custom parallax wrapper

services/
└── api.js                  # Live API integration
```

## 🔗 API Integration

The app connects to the live Genosys API at:
- **Endpoint**: `https://www.genosys.ae/api/mobile/products`
- **Authentication**: Custom header `x-api-key: genosys_secure_mobile_2025_v1`

## 🎨 Design System

- **Typography**: Large titles (34px), section headers (22px), body text (16px)
- **Colors**: White background, grouped gray (#F5F5F7), accent red (#E74C3C)
- **Cards**: 12px radius, soft shadows (0.08 opacity)

## 📱 Screen Flow

1. **Shop Screen**: Displays "New Arrivals" horizontally and "All Products" in a grid
2. **Product Detail**: Parallax hero image with sticky "Add to Bag" footer
3. **Bag Screen**: Cart functionality (placeholder for now)

## 🧪 Testing

The app handles API errors gracefully - if the API is unavailable, it shows an empty state instead of crashing.
