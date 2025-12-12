# Required API Endpoints for Authentication

The mobile app now integrates with your existing Prisma database. Here are the endpoints you need to implement on your backend:

## Base URL
```
https://www.genosys.ae/api/mobile
```

## Authentication Endpoints

### 1. Email Login
**POST** `/auth/login`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: genosys_secure_mobile_2025_v1`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword",
  "source": "mobile_app"
}
```

**Success Response (200):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "firstName": "User",
  "lastName": "Name", 
  "profilePicture": "https://...",
  "token": "jwt_token_here",
  "accessToken": "jwt_token_here"
}
```

### 2. User Registration
**POST** `/auth/register`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: genosys_secure_mobile_2025_v1`

**Request Body:**
```json
{
  "name": "Full Name",
  "email": "user@example.com",
  "password": "userpassword",
  "firstName": "First",
  "lastName": "Last",
  "source": "mobile_app"
}
```

**Success Response (200):**
```json
{
  "id": "new_user_id",
  "email": "user@example.com",
  "name": "Full Name",
  "firstName": "First",
  "lastName": "Last",
  "profilePicture": null,
  "token": "jwt_token_here",
  "accessToken": "jwt_token_here"
}
```

### 3. Google OAuth Integration
**POST** `/auth/google`

**Headers:**
- `Content-Type: application/json`
- `x-api-key: genosys_secure_mobile_2025_v1`

**Request Body:**
```json
{
  "googleId": "google_user_id",
  "email": "user@gmail.com",
  "name": "Google User",
  "picture": "https://lh3.googleusercontent.com/...",
  "accessToken": "google_access_token",
  "source": "mobile_app"
}
```

**Success Response (200):**
```json
{
  "id": "user_id_from_db",
  "email": "user@gmail.com",
  "name": "Google User",
  "picture": "https://lh3.googleusercontent.com/...",
  "token": "jwt_token_here",
  "accessToken": "jwt_token_here",
  "googleId": "google_user_id"
}
```

### 4. Session Validation
**GET** `/auth/validate`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer jwt_token_here`
- `x-api-key: genosys_secure_mobile_2025_v1`

**Success Response (200):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "profile_picture_url",
  "token": "refreshed_token_if_needed"
}
```

### 5. User Logout
**POST** `/auth/logout`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer jwt_token_here`
- `x-api-key: genosys_secure_mobile_2025_v1`

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## Error Responses

All endpoints should return appropriate error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid input data",
  "message": "Email is required"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

**409 Conflict:**
```json
{
  "error": "User already exists",
  "message": "An account with this email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error",
  "message": "Something went wrong"
}
```

## Google OAuth Configuration

Your Google OAuth is already configured with these credentials:
- **Expo Client ID:** `590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com`
- **iOS Client ID:** `590508205468-7ek30vjj6o5k2jfpqpg3t6cr4bnu7rt5.apps.googleusercontent.com`
- **Android Client ID:** `590508205468-vc262gtfqo5a94iifen6gqvlsr5h3to5.apps.googleusercontent.com`
- **Web Client ID:** `590508205468-lom9rvmsm4058nkm4ivsk1g0k5j3sm8j.apps.googleusercontent.com`

## Database Integration

The app expects these endpoints to:
1. **Use your existing Prisma database** with the provided credentials
2. **Handle both Google OAuth and email/password** authentication
3. **Return JWT tokens** for session management
4. **Store user data** in your existing user table structure
5. **Validate sessions** and refresh tokens as needed

## Testing

You can test the integration by:
1. **Starting the mobile app** - it will show the login screen
2. **Testing Google login** - should work with your existing OAuth setup
3. **Testing email login/registration** - will use the new endpoints
4. **Testing logout** - should clear sessions both locally and on server
