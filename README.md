# Genosys Mobile App

A React Native mobile application for Genosys Middle East FZ-LLC, providing a complete e-commerce experience for premium Korean dermacosmetics.

## 🚀 Features

### ✅ Phase 1: Core E-commerce (COMPLETED)
- **Product Catalog**: 50+ real products with search and filtering
- **User Authentication**: Login/Register with API integration
- **Shopping Cart**: Full cart functionality with persistence
- **Checkout Process**: Complete order form with validation
- **Order Management**: Order history and tracking

### 🎨 UI/UX Features
- **Genosys Branding**: Red theme matching website
- **Mobile Optimized**: Responsive design for all screen sizes
- **Loading States**: Professional loading indicators
- **Error Handling**: Graceful error recovery
- **Image Loading**: Real product images with fallbacks

## 🛠️ Technical Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Context API
- **Storage**: AsyncStorage for persistence
- **Navigation**: React Navigation
- **API Integration**: RESTful API with genosys.ae

## 📱 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd genosys-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator

## 🏗️ Project Structure

```
genosys-mobile-app/
├── src/
│   ├── contexts/          # State management
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   └── screens/           # App screens
│       ├── HomeScreen.tsx
│       ├── ProductsScreen.tsx
│       ├── CartScreen.tsx
│       ├── CheckoutScreen.tsx
│       ├── OrdersScreen.tsx
│       ├── ProfileScreen.tsx
│       └── LoginScreen.tsx
├── App.tsx               # Main app component
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔧 Development Workflow

### Git Strategy
- **Main Branch**: Production-ready code
- **Feature Branches**: New features and improvements
- **Local Development**: Test changes before committing

### Commit Convention
```
type(scope): description

Examples:
feat(auth): add login functionality
fix(cart): resolve quantity update issue
style(ui): update button colors
docs(readme): add installation guide
```

### Branch Naming
- `feature/product-search` - New features
- `fix/cart-bug` - Bug fixes
- `style/ui-updates` - UI improvements
- `docs/readme-update` - Documentation

## 🚀 Deployment

### Development
```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Production Build
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Build for web
npx expo build:web
```

## 📊 API Integration

The app integrates with the Genosys website API:

- **Products**: `https://genosys.ae/api/products`
- **Authentication**: `https://genosys.ae/api/auth/login`
- **Orders**: `https://genosys.ae/api/orders`

## 🔒 Security

- **API Keys**: Stored securely in environment variables
- **User Data**: Encrypted with AsyncStorage
- **Authentication**: JWT tokens for secure sessions
- **HTTPS**: All API calls use secure connections

## 📱 Supported Platforms

- **iOS**: 11.0+
- **Android**: API 21+ (Android 5.0+)
- **Web**: Modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions:
- **Email**: sales@genosys.ae
- **Phone**: +971 58 548 76 65
- **Website**: https://genosys.ae

## 📄 License

This project is proprietary software of Genosys Middle East FZ-LLC.

---

**Built with ❤️ for Genosys Middle East FZ-LLC**
