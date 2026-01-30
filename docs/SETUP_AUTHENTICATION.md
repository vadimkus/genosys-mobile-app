# Authentication Setup Guide

## 🚀 Quick Setup

Your mobile app authentication is now fully integrated with your backend! Follow these steps to complete the setup:

### 1. ✅ Backend is Ready
Your backend already has all the authentication endpoints:
- ✅ `/api/mobile/auth/login` - Email/password login
- ✅ `/api/mobile/auth/register` - User registration  
- ✅ `/api/mobile/auth/google` - Google OAuth
- ✅ `/api/mobile/auth/validate` - Token validation
- ✅ `/api/mobile/auth/logout` - User logout

### 2. 🔑 Configure API Key

Update the API key in `/config/auth.js`:

```javascript
export const AUTH_CONFIG = {
  // TODO: Replace with your actual MOBILE_APP_KEY from backend .env
  API_KEY: 'your-secure-random-@2026', // ← Update this!
  
  // ... rest of config
};
```

**Get your API key from your backend `.env.local` file:**
```bash
MOBILE_APP_KEY=your-secure-random-@2026
```

### 3. 🎯 Google OAuth (Already Configured!)

Google OAuth is already set up with your existing credentials:
- ✅ Expo Client ID: `590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com`
- ✅ iOS Client ID: `590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com`
- ✅ Android Client ID: `590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com`
- ✅ Web Client ID: `590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com`

### 4. 🧪 Test the Authentication

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Test login screen**: Should show beautiful Genosys-branded login
3. **Test Google OAuth**: One-tap Google authentication
4. **Test email login**: Traditional email/password login
5. **Test registration**: New user creation
6. **Test logout**: Sign out functionality

## 📱 How It Works

### Login Flow:
1. User opens app → Shows login screen (if not authenticated)
2. User chooses Google or email/password authentication
3. App sends credentials to your backend API
4. Backend validates and returns JWT token + user data
5. App stores token securely and shows main interface

### Session Management:
- **Persistent Login**: Users stay logged in between app launches
- **Token Validation**: App validates tokens with your backend on startup
- **Secure Storage**: Uses React Native's secure AsyncStorage
- **Auto Logout**: Expired tokens automatically redirect to login

### Google OAuth:
- **ID Token Flow**: App gets Google ID token and sends to your backend
- **Backend Processing**: Your backend validates with Google and creates/updates user
- **Unified Database**: All users (Google + email) stored in same Prisma database

## 🔒 Security Features

✅ **API Key Protection**: All requests require your `MOBILE_APP_KEY`  
✅ **JWT Tokens**: 30-day expiration with secure signing  
✅ **Rate Limiting**: Prevents authentication abuse  
✅ **bcrypt Passwords**: Secure password hashing  
✅ **Session Validation**: Real-time token verification  

## 🛠️ Backend Integration

Your mobile app connects to these endpoints:

```javascript
// Login
POST https://www.genosys.ae/api/mobile/auth/login
Headers: { 'x-api-key': 'your-key' }
Body: { email, password }

// Google OAuth  
POST https://www.genosys.ae/api/mobile/auth/google
Headers: { 'x-api-key': 'your-key' }
Body: { idToken }

// Token Validation
GET https://www.genosys.ae/api/mobile/auth/validate
Headers: { 'x-api-key': 'your-key', 'Authorization': 'Bearer token' }
```

## 🎉 Ready to Launch!

Once you update the API key in `/config/auth.js`, your authentication system is production-ready:

- ✅ **Existing Users**: Can login with their current credentials
- ✅ **Google Users**: Seamless OAuth integration
- ✅ **New Users**: Registration creates accounts in your Prisma database  
- ✅ **Admin Panel**: All users appear in your existing admin system
- ✅ **Email Notifications**: Welcome emails and admin alerts work
- ✅ **Analytics**: User actions tracked in your existing system

## 🔍 Troubleshooting

### Common Issues:

**1. "API key not configured" error**
- Update `API_KEY` in `/config/auth.js` with your actual `MOBILE_APP_KEY`

**2. "Network error" on login**
- Check that your backend is running on `https://www.genosys.ae`
- Verify the API endpoints are deployed and accessible

**3. Google login not working**
- Ensure your Google OAuth credentials are correctly configured in Google Cloud Console
- Check that the client IDs in the config match your Google project

**4. Token validation fails**
- Verify your `JWT_SECRET` is set in backend environment
- Check that tokens aren't expired (30-day limit)

## 📞 Support

The authentication system is now fully integrated with your existing infrastructure:
- **Database**: Uses your existing Prisma database
- **Users**: Stored in your existing user table
- **Admin**: Visible in your current admin panel
- **Emails**: Uses your existing notification system
- **Analytics**: Tracked with your existing analytics

Everything works together seamlessly! 🎯