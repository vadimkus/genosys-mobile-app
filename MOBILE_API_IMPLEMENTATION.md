# Mobile API Implementation Guide

## Quick Implementation: Add to Existing Next.js Website

### 1. Add API Routes to genosys.ae

Create these files in your Next.js project (`pages/api/mobile/` or `app/api/mobile/`):

```javascript
// pages/api/mobile/user/wishlist.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate API key
  if (req.headers['x-api-key'] !== 'genosys_secure_mobile_2025_v1') {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Validate auth token
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No auth token provided' });
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get user wishlist from database
        const wishlist = await getUserWishlistFromDB(token);
        return res.status(200).json({ success: true, data: wishlist });
        
      case 'POST':
        // Add item to wishlist
        const { productId, productName, productImage, productPrice } = req.body;
        await addToWishlistInDB(token, { productId, productName, productImage, productPrice });
        return res.status(201).json({ success: true, message: 'Added to wishlist' });
        
      case 'DELETE':
        // Remove from wishlist
        const productIdToRemove = req.query.productId;
        await removeFromWishlistInDB(token, productIdToRemove);
        return res.status(200).json({ success: true, message: 'Removed from wishlist' });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Wishlist API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions (implement these with your database)
async function getUserWishlistFromDB(token) {
  // TODO: Implement database query
  return [];
}

async function addToWishlistInDB(token, productData) {
  // TODO: Implement database insert
}

async function removeFromWishlistInDB(token, productId) {
  // TODO: Implement database delete
}
```

### 2. Database Integration

Since you already have the database with Prisma, connect it:

```javascript
// lib/prisma.js (in your Next.js project)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 3. Auth Helper

```javascript
// lib/auth.js
import jwt from 'jsonwebtoken';

export function getUserFromToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### 4. Required API Endpoints

Create these API routes in your Next.js project:

- `pages/api/mobile/auth/login.js`
- `pages/api/mobile/auth/register.js` 
- `pages/api/mobile/user/profile.js`
- `pages/api/mobile/user/wishlist.js`
- `pages/api/mobile/user/addresses.js`
- `pages/api/mobile/orders.js`

## Environment Variables

Add to your Next.js `.env.local`:

```env
PRISMA_DATABASE_URL="your_database_url"
JWT_SECRET="your_jwt_secret"
MOBILE_API_KEY="genosys_secure_mobile_2025_v1"
```

## Deployment

After adding the API routes:

1. Deploy to your existing hosting (Vercel/Netlify)
2. Test endpoints: `curl https://genosys.ae/api/mobile/user/wishlist`
3. Mobile app will automatically work!

## Timeline

- **Setup**: 2-4 hours
- **Testing**: 1 hour
- **Deployment**: 30 minutes
- **Total**: Half day implementation
