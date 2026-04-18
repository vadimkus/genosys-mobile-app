# Android Build Guide

> Build and run the Genosys app on Android devices and emulators.

**Last Updated**: February 2026

---

## Quick Start

### Prerequisites

1. **Android Studio** - Install from [developer.android.com](https://developer.android.com/studio)
2. **Android SDK** - Install via Android Studio SDK Manager
3. **Android SDK Command Line Tools** - Required for CLI operations (see [SDK CLI Setup](#sdk-command-line-tools-setup))
4. **Android Emulator** or physical device with USB debugging enabled
5. **EAS CLI** - `npm install -g eas-cli`
6. **Java Runtime** - Bundled with Android Studio at `/Applications/Android Studio.app/Contents/jbr/Contents/Home`

### Development Build (Local Testing)

```bash
# Start Metro bundler
npm start

# Run on Android (with emulator running or device connected)
npm run android

# Or start with LAN mode for emulator
unset CI && npx expo start --lan
# Then press 'a' to open on Android
```

### Build APK for Testing

```bash
# Development APK (with dev client)
npm run build:android:dev

# Preview APK (production-like)
npm run build:android:preview
```

### Production Build (Google Play)

```bash
# Production AAB (Android App Bundle)
npm run build:android:production

# Submit to Google Play Store
npm run submit:android
```

---

## Configuration Files

### app.json - Android Section

```json
{
  "expo": {
    "android": {
      "package": "ae.genosys.app",
      "versionCode": 58,
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon-foreground-1024.png",
        "backgroundImage": "./assets/icon-background-1024.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "INTERNET",
        "VIBRATE",
        "RECORD_AUDIO",
        "CAMERA",
        "READ_MEDIA_IMAGES",
        "POST_NOTIFICATIONS",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "ACCESS_NETWORK_STATE"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/products" },
            { "scheme": "https", "host": "www.genosys.ae", "pathPrefix": "/products" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/cart" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/orders" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/profile" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/favorites" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/skin-recommendation" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/skin-analysis" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/blog" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/bundle-builder" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/training" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/chat" },
            { "scheme": "https", "host": "genosys.ae", "pathPrefix": "/checkout" }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Android Plugins (in app.json)

```json
{
  "plugins": [
    "expo-router",
    "expo-secure-store",
    "expo-font",
    "expo-apple-authentication",
    ["@stripe/stripe-react-native", { "merchantIdentifier": "merchant.ae.genosys.app" }],
    "expo-speech-recognition",
    ["expo-notifications", { "icon": "./assets/icon-foreground-1024.png", "color": "#dc2626" }],
    ["expo-camera", { "cameraPermission": "Genosys uses the camera for AI Skin Analysis and profile photos." }],
    ["expo-image-picker", { "photosPermission": "Genosys uses your photo library to let you choose a profile photo or skin analysis image." }],
    "expo-local-authentication"
  ]
}
```

### eas.json - Android Build Profiles

| Profile | Use Case | Output |
|---------|----------|--------|
| `development:android` | Local testing with dev client | APK |
| `preview:android` | Internal testing | APK |
| `production:android` | Google Play submission | AAB |

---

## Feature Parity with iOS

The Android app has **full feature parity** with iOS (aligned February 11, 2026):

| Feature | iOS | Android | Notes |
|---------|-----|---------|-------|
| Product Catalog | ✅ | ✅ | Same UI |
| Shopping Cart | ✅ | ✅ | Same functionality |
| **COD Payment** | ✅ | ✅ | Same flow |
| **Stripe Payment** | ✅ | ✅ | Stripe SDK |
| Google Sign-In | ✅ | ✅ | Uses web client ID |
| Apple Sign-In | ✅ | ❌ | iOS only (hidden on Android) |
| Biometric Auth | Face ID / Touch ID | Fingerprint | Platform-specific |
| Multi-language | ✅ | ✅ | EN, AR, RU |
| RTL Support | ✅ | ✅ | Arabic layout mirroring |
| Deep Linking | Universal Links | Intent Filters | 13 paths each |
| Voice Search | ✅ | ✅ | expo-speech-recognition |
| Haptic Feedback | ✅ | ✅ | expo-haptics |
| **AI Skin Analysis (Camera)** | ✅ | ✅ | GPT-4 Vision |
| **AI Skin Analysis (Quiz)** | ✅ | ✅ | API-driven recommendations |
| **Build Your Set** | ✅ | ✅ | 8-step bundle builder |
| **Native Blog + Comments** | ✅ | ✅ | API-driven, react-native-render-html |
| **Push Notifications** | ✅ (APNs) | ✅ (FCM) | Expo push tokens |
| **AI Chatbot** | ✅ | ✅ | SSE streaming |
| **Product Videos** | ✅ | ✅ | expo-video + expo-audio |
| **PDF Downloads** | ✅ | ✅ | WebView |
| **Offline Cache** | ✅ | ✅ | AsyncStorage |
| **Training (API)** | ✅ | ✅ | Auth-gated |
| **FAQ (API)** | ✅ | ✅ | Database-driven |
| **Partners (API)** | ✅ | ✅ | Database-driven |

---

## Android-Specific Considerations

### Authentication

- **Google Sign-In**: Works on Android using web client ID
- **Apple Sign-In**: Not available on Android (button hidden automatically)
- **Biometric**: Uses fingerprint scanner via `expo-local-authentication`

### Adaptive Icons

Android uses adaptive icons with foreground and background layers:

```
assets/
├── icon-foreground-1024.png   # Logo/icon (transparent background)
├── icon-background-1024.png   # Solid white background
```

The foreground image should have ~66% padding for the safe zone.

### Deep Linking

Intent filters are configured for 13 paths (updated Feb 11, 2026):
- `https://genosys.ae/products/*` + `www.genosys.ae/products/*`
- `https://genosys.ae/cart`
- `https://genosys.ae/orders`
- `https://genosys.ae/profile`
- `https://genosys.ae/favorites`
- `https://genosys.ae/skin-recommendation`
- `https://genosys.ae/skin-analysis`
- `https://genosys.ae/blog`
- `https://genosys.ae/bundle-builder`
- `https://genosys.ae/training`
- `https://genosys.ae/chat`
- `https://genosys.ae/checkout`

All deep links route to **native screens** (not WebView). The deep link handler in `utils/deepLinking.js` maps each URL to the corresponding native app route.

**Server-side requirement:** Host Digital Asset Links file at `https://genosys.ae/.well-known/assetlinks.json` for Android app link verification.

### Permissions

Required permissions (9 total, updated Feb 11, 2026):

| Permission | Purpose | Android Version |
|------------|---------|-----------------|
| `INTERNET` | API calls, content loading | All |
| `VIBRATE` | Haptic feedback, notification alerts | All |
| `RECORD_AUDIO` | Voice search | All |
| `CAMERA` | AI Skin Analysis, profile photo | All |
| `READ_MEDIA_IMAGES` | Photo library for profile picture | 13+ (API 33) |
| `POST_NOTIFICATIONS` | Push notifications for order updates | 13+ (API 33) |
| `USE_BIOMETRIC` | Fingerprint authentication | 9+ (API 28) |
| `USE_FINGERPRINT` | Legacy fingerprint (older devices) | 6+ (API 23) |
| `ACCESS_NETWORK_STATE` | Network connectivity checks | All |

### Notification Channels

Android uses notification channels (required Android 8+):

| Channel | Importance | Description |
|---------|------------|-------------|
| `orders` | HIGH | Order status updates (vibration, LED, sound) |
| `default` | DEFAULT | General notifications |

Configured in `contexts/NotificationContext.js` and `services/pushNotificationsService.js`.

---

## Testing on Emulator

### Recommended Emulator Configuration

For optimal performance, use **Android 14 (API 34)** instead of preview versions:

| Setting | Recommended Value |
|---------|-------------------|
| **Device** | Pixel 6 |
| **System Image** | Android 14 (API 34) - Google APIs ARM64 |
| **RAM** | 4096 MB |
| **GPU** | Host (hardware acceleration) |

> ⚠️ **Avoid API 36.1 preview** - It's extremely slow and has service initialization issues.

### Setup Android Emulator via Android Studio

1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. In **SDK Platforms** tab:
   - Check "Show Package Details"
   - Expand "Android 14.0 (UpsideDownCake)"
   - Install "Google APIs ARM 64 v8a System Image"
4. Go to **Tools > Device Manager**
5. Click "Create Device"
6. Select **Pixel 6** → Next
7. Select **UpsideDownCake API 34** → Next
8. Name it `Fast_API34` → Finish

### Setup Android Emulator via Command Line

```bash
# Set environment variables
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH

# Download system image (if not already installed)
sdkmanager "system-images;android-34;google_apis;arm64-v8a"

# Create AVD
avdmanager create avd -n Fast_API34 -k "system-images;android-34;google_apis;arm64-v8a" -d "pixel_6" --force

# Start emulator with optimal settings
emulator -avd Fast_API34 -gpu host -memory 4096 -no-snapshot
```

### Run App on Emulator

```bash
# Method 1: Via Expo CLI (interactive)
npm start
# Press 'a' to open on Android

# Method 2: Direct command
npm run android

# Method 3: Manual (when automatic launch fails)
# 1. Start Metro
unset CI && npx expo start --lan

# 2. In another terminal, open app URL in Expo Go
adb -s emulator-5554 shell am start -a android.intent.action.VIEW \
  -d "exp://192.168.x.x:8081" host.exp.exponent
```

### First Boot Considerations

On first boot after a fresh emulator creation, the system may take 2-3 minutes to fully initialize. Wait until:

```bash
# Boot completed = 1 means system is ready
adb -s emulator-5554 shell getprop sys.boot_completed
# Output: 1

# Package manager is ready
adb -s emulator-5554 shell pm list packages | head -3
# Output: package:com.android...
```

### Test Checkout Flow

1. Add products to cart
2. Go to checkout
3. Test **COD** payment:
   - Select "Cash on Delivery"
   - Fill delivery details
   - Place order → Success alert
4. Test **Card** payment:
   - Select "Pay by Card"
   - Place order → Opens Stripe WebView
   - Complete payment in WebView

---

## Building for Production

### Google Play Console Setup

1. Create app in [Google Play Console](https://play.google.com/console)
2. Set up app listing, content rating, and privacy policy
3. Create a release track (Internal, Closed, Open, or Production)

### Service Account for EAS Submit

1. In Google Cloud Console, create a Service Account
2. Grant "Service Account User" role
3. Download JSON key file
4. Save as `google-play-service-account.json` in project root
5. In Google Play Console, grant the service account access

### Build and Submit

```bash
# Build AAB
npm run build:android:production

# Submit to Google Play
npm run submit:android
```

---

## SDK Command Line Tools Setup

The Android SDK Command Line Tools provide `sdkmanager` and `avdmanager` for CLI operations.

### Installation

```bash
# Navigate to Android SDK directory
cd ~/Library/Android/sdk

# Download command line tools
curl -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip

# Extract and organize
unzip -o cmdline-tools.zip
mkdir -p cmdline-tools
mv cmdline-tools cmdline-tools/latest
rm cmdline-tools.zip
```

### Environment Variables

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# Android SDK
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH
```

### Verify Installation

```bash
source ~/.zshrc
sdkmanager --version
# Output: 12.0 (or similar)

avdmanager list avd
# Lists available Android Virtual Devices
```

---

## Troubleshooting

### Emulator Won't Start

```bash
# Check for running emulators
adb devices

# Kill ADB server and restart
adb kill-server && adb start-server

# Try with software rendering
emulator -avd YOUR_AVD_NAME -gpu swiftshader_indirect

# Cold boot without snapshot
emulator -avd YOUR_AVD_NAME -gpu host -no-snapshot -memory 4096
```

### Emulator is Slow

1. **Use API 34** instead of preview versions (36.1 is very slow)
2. **Enable hardware acceleration**: Use `-gpu host`
3. **Increase RAM**: Use `-memory 4096`
4. **Disable snapshots on first boot**: Use `-no-snapshot` or `-wipe-data`

```bash
# Optimal emulator launch command for M1/M2 Macs
emulator -avd Fast_API34 -gpu host -memory 4096 -no-snapshot
```

### "Can't find service: package" Error

This occurs when the emulator's system services haven't fully initialized:

```bash
# Wait for boot completion
while [ "$(adb shell getprop sys.boot_completed 2>/dev/null)" != "1" ]; do
  echo "Waiting for boot..."
  sleep 5
done
echo "Boot completed!"
```

### Expo Go Installation Fails

If Expo Go fails to install with `NullPointerException`:

```bash
# Wait 1-2 minutes for StorageManager service to initialize
# Then retry:
npm run android
```

### "expo-notifications: Android Push notifications" Warning

This warning appears because push notifications require Firebase for production delivery. The warning is suppressed via `LogBox.ignoreLogs()` in `app/_layout.js`. Push notifications work via Expo Push Tokens without Firebase, but for production FCM delivery:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add an Android app with package name `ae.genosys.app`
3. Download `google-services.json` to project root
4. Add `"googleServicesFile": "./google-services.json"` to `android` section in `app.json`
5. Add `google-services.json` to `.gitignore` (contains private keys)

### Build Fails

```bash
# Clear Expo cache
npx expo start --clear

# Clear EAS cache
eas build --clear-cache --platform android
```

### App Crashes on Launch

1. Check `adb logcat` for errors:
   ```bash
   adb logcat *:E | grep -i expo
   ```
2. Ensure all native modules are compatible
3. Verify `google-services.json` is present (if using Firebase)

### Metro Bundler Issues

```bash
# Kill all Metro/Expo processes
pkill -f "expo" 2>/dev/null
pkill -f "metro" 2>/dev/null

# Clear cache and restart
npx expo start --clear
```

### "Encountered two children with the same key" Warning

This React warning occurs when list items have duplicate keys. Fixed in February 2026 by adding index to all `.map()` keys:

**Files fixed:**
- `app/(tabs)/shop.js` - Product grid
- `app/favorites.js` - Favorites list
- `app/profile/orders.js` - Orders list
- `app/profile/contact.js` - Contact methods
- `app/profile/help.js` - Support options and FAQs
- `app/profile/addresses.js` - Saved addresses
- `components/product/ProductReviews.js` - Product reviews

**Pattern used:**
```javascript
// Before (can cause duplicate key errors)
{items.map((item) => (
  <View key={item.id}>...</View>
))}

// After (guaranteed unique keys)
{items.map((item, index) => (
  <View key={`${item.id}-${index}`}>...</View>
))}
```

---

## Useful ADB Commands

```bash
# List connected devices
adb devices

# Install APK manually
adb -s emulator-5554 install -r path/to/app.apk

# Open app in Expo Go
adb -s emulator-5554 shell am start -a android.intent.action.VIEW \
  -d "exp://192.168.x.x:8081" host.exp.exponent

# Check installed packages
adb -s emulator-5554 shell pm list packages | grep expo

# View device logs
adb -s emulator-5554 logcat

# Reboot emulator
adb -s emulator-5554 reboot

# Get boot status
adb -s emulator-5554 shell getprop sys.boot_completed
```

---

## Common Android-Specific Issues (Fixed Feb 11, 2026)

### KeyboardAvoidingView Behavior

**Problem:** Input fields get covered by keyboard on Android.

**Solution:** Always use `behavior='height'` on Android, not `undefined`:

```javascript
// ✅ Correct - works on both platforms
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>

// ❌ Wrong - keyboard overlaps inputs on Android
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
```

### Shadow Styles Without Elevation

**Problem:** iOS shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) have no effect on Android.

**Solution:** Always include `elevation` alongside iOS shadow properties:

```javascript
// ✅ Correct - shadows work on both platforms
cardStyle: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,  // Required for Android
}

// ❌ Wrong - shadow only visible on iOS
cardStyle: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  // Missing elevation!
}
```

### iOS-Only Module Imports

**Problem:** Importing iOS-only modules (like `expo-apple-authentication`) at top-level can cause issues on Android.

**Solution:** Use safe dynamic import with try-catch:

```javascript
// ✅ Safe - won't crash on Android
let AppleAuthentication = null;
try {
  AppleAuthentication = require('expo-apple-authentication');
} catch (e) {
  // Expected on Android
}

// Then guard usage
if (AppleAuthentication && Platform.OS === 'ios') {
  // Use Apple Sign-In
}

// ❌ Potentially risky on Android
import * as AppleAuthentication from 'expo-apple-authentication';
```

### Haptics (Don't Restrict to iOS)

**Problem:** Guarding haptic feedback with `if (Platform.OS !== 'ios') return` prevents Android users from feeling feedback.

**Solution:** Use `utils/haptics` (cross-platform) or call `expo-haptics` directly without platform guards:

```javascript
// ✅ Correct - works on both platforms
import * as haptics from '../utils/haptics';
const triggerHaptic = () => haptics.lightTap();

// ❌ Wrong - Android users get no feedback
const triggerHaptic = async () => {
  if (Platform.OS !== 'ios') return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
```

---

## Resources

- [Expo Android Guide](https://docs.expo.dev/workflow/android-studio-emulator/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android SDK Command Line Tools](https://developer.android.com/tools/sdkmanager)
- [Android Emulator CLI Options](https://developer.android.com/studio/run/emulator-commandline)
