# Genosys Mobile App

A React Native mobile application for Genosys Middle East FZ-LLC, providing a complete e-commerce experience for premium Korean dermacosmetics.

## 🚀 Features

### Core E-commerce Features
- **Product Catalog**: Browse and search premium Korean dermacosmetics
- **User Authentication**: Secure login and registration
- **Shopping Cart**: Add, remove, and manage cart items
- **Checkout Process**: Complete order placement with validation
- **Order Management**: Track order history and status
- **User Profile**: Manage account settings and preferences

### Technical Features
- **TypeScript**: Full type safety and better development experience
- **Modern React Native**: Latest Expo SDK with new architecture
- **State Management**: Context API for global state
- **Navigation**: React Navigation for smooth screen transitions
- **API Integration**: RESTful API integration with genosys.ae
- **Offline Support**: Basic offline functionality
- **Performance**: Optimized for mobile devices

## 🛠️ Technical Stack

- **Framework**: React Native + Expo SDK 52
- **Language**: TypeScript
- **State Management**: React Context API
- **Navigation**: React Navigation v6
- **Storage**: AsyncStorage
- **API**: RESTful API integration
- **Platforms**: iOS, Android, Web

## 📱 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vadimkus/genosys-mobile-app.git
   cd genosys-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app (iOS/Android)
   - Press 'i' for iOS simulator
   - Press 'a' for Android emulator
   - Press 'w' for web browser

## 🏗️ Project Structure

```
genosys-mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── navigation/         # Navigation configuration
│   ├── contexts/           # React Context providers
│   ├── services/           # API and external services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── constants/          # App constants
├── assets/                 # Images, fonts, and other assets
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm test` - Run tests

### Development Workflow

1. **Feature Development**: Create feature branches for new functionality
2. **Testing**: Test on multiple devices and platforms
3. **Code Review**: Review code before merging
4. **Deployment**: Deploy to app stores when ready

## 📊 API Integration

The app integrates with the Genosys website API:

- **Base URL**: `https://genosys.ae/api`
- **Authentication**: JWT token-based authentication
- **Products**: Product catalog and details
- **Orders**: Order management and tracking
- **User**: User profile and preferences

## 🔒 Security

- **API Keys**: Stored securely in environment variables
- **User Data**: Encrypted with AsyncStorage
- **Authentication**: JWT tokens for secure sessions
- **HTTPS**: All API calls use secure connections

## 📱 Supported Platforms

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0+)
- **Web**: Modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For technical support or questions:

- **Email**: sales@genosys.ae
- **Phone**: +971 58 548 76 65
- **Website**: https://genosys.ae

## 📄 License

This project is proprietary software of Genosys Middle East FZ-LLC.

---

**Built with ❤️ for Genosys Middle East FZ-LLC**
