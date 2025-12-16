# Google OAuth Setup for Genosys Mobile App

## 🚨 Current Issue
The Google OAuth shows "Expo" instead of "Genosys Middle East FZ-LLC" and returns 404 errors because the Google Cloud Console configuration needs to be updated for production use.

## 🔧 Required Google Cloud Console Updates

### 1. Update OAuth Consent Screen

Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent) and update:

**App Information:**
- **App name**: `Genosys Middle East FZ-LLC`
- **User support email**: `support@genosys.ae`
- **App logo**: Upload Genosys logo (512x512px recommended)
- **App domain**: `https://genosys.ae`
- **Authorized domains**: 
  - `genosys.ae`
  - `auth.expo.io` (required for Expo Go redirect `https://auth.expo.io/@...`)
  - `expo.dev` (optional; Expo docs domain)

**Developer contact information:**
- **Email addresses**: `support@genosys.ae`

### 2. Update OAuth Client Configuration

Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials) and update each client:

**iOS Client ID: 590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com**
- **Bundle ID**: `com.genosys.mobile`
- **App Store ID**: (Add when app is published)

**Android Client ID: 590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com**
- **Package name**: `com.genosys.mobile`
- **SHA-1 certificate fingerprint**: (Add your signing certificate)

**Web Client ID: 590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com**
- **Authorized redirect URIs**:
  - `https://genosys.ae/auth/callback`
  - `https://auth.expo.io/@anonymous/genosys-mobile-app` (for development)
  - `genosys://oauth/google` (for deep linking)

### 3. Verify API Enablement

Ensure these APIs are enabled:
- **Google+ API** (for user info)
- **People API** (for profile data)

## 📱 Mobile App Configuration

The mobile app is already configured with the correct client IDs:

```javascript
GOOGLE_OAUTH: {
  clientId: '590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com',
  iosClientId: '590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com',
  androidClientId: '590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com',
  webClientId: '590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com',
  redirectUri: 'genosys://oauth/google',
}
```

## 🔍 Testing the Fix

After updating Google Cloud Console:

1. **Clear app data** on your device
2. **Restart the Expo app**
3. **Test Google login** - should now show "Genosys Middle East FZ-LLC"
4. **Verify login completes** without 404 errors

## 🛠️ Development vs Production

**Development (Current):**
- Shows "Expo" in OAuth consent
- Uses Expo development redirect URIs
- May have limited functionality

**Production (After Update):**
- Shows "Genosys Middle East FZ-LLC"
- Uses proper redirect URIs
- Full production functionality

## ⚠️ Important Notes

1. **OAuth consent screen changes** can take up to 24 hours to propagate
2. **App verification** may be required by Google for production use
3. **Privacy Policy** and **Terms of Service** URLs must be accessible
4. **Scopes** should be minimal (profile, email, openid only)

## 🚀 Quick Fix for Immediate Testing

If you need immediate testing while waiting for Google Cloud updates:

1. Use **email/password login** (works perfectly)
2. Enable **Face ID/Touch ID** after email login
3. **Google OAuth** will work once Google Cloud Console is updated

## 📞 Support

If you need help updating Google Cloud Console configuration:
1. Access your Google Cloud Console
2. Navigate to APIs & Services → Credentials
3. Update the OAuth consent screen and client configurations
4. Test the changes in the mobile app

The backend is ready and working - only the Google Cloud Console configuration needs to be updated!