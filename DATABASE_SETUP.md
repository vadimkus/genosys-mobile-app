# Database Setup Guide

This guide will help you set up the PostgreSQL database with Prisma for the Genosys Mobile App.

## Prerequisites

- PostgreSQL database (we're using Prisma's hosted database)
- Node.js and npm installed
- Environment variables configured

## Environment Variables

Add the following to your `.env` file:

```env
# Database
DATABASE_URL="postgres://bba1d642802ecf0af6b89802617217c7ee4bd9e45a9df009f7fcc332176072e7:sk_-vf4T6G2TVhfLC4FwIJsi@db.prisma.io:5432/postgres?sslmode=require"

# Prisma Accelerate (optional)
PRISMA_ACCELERATE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza18tdmY0VDZHMlRWaGZMQzRGd0lKc2kiLCJhcGlfa2V5IjoiMDFLNFc3RkdSNDM5MVhUQTBFVjVERVcySEUiLCJ0ZW5hbnRfaWQiOiJiYmExZDY0MjgwMmVjZjBhZjZiODk4MDI2MTcyMTdjN2VlNGJkOWU0NWE5ZGYwMDlmN2ZjYzMzMjE3NjA3MmU3IiwiaW50ZXJuYWxfc2VjcmV0IjoiMWVmM2UzNzgtNzA3OS00MTkxLThiOTAtODBjMmNlYzFlYjc0In0.PlYfzeeWW5WwwZMWzy3ZMdlWzNM2AAJUchLKn9D2nUk"

# API Configuration
EXPO_PUBLIC_API_BASE_URL="https://genosys.ae/api"
EXPO_PUBLIC_API_TIMEOUT="10000"

# App Configuration
NODE_ENV="development"
```

## Setup Steps

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Run Database Migrations
```bash
npm run db:migrate
```

### 3. Seed Test Users
```bash
npm run db:seed
```

### 4. Verify Setup
```bash
npm run db:studio
```

## Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations (development)
- `npm run db:deploy` - Deploy migrations (production)
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Migrate existing test users to database
- `npm run db:setup` - Complete database setup

## Database Schema

The database includes the following models:

- **User** - User accounts with authentication
- **Product** - Product catalog
- **CartItem** - Shopping cart items
- **WishlistItem** - User wishlists
- **Order** - Order management
- **OrderItem** - Order line items
- **Address** - User addresses
- **Review** - Product reviews

## Authentication Flow

The app now uses a **hybrid authentication approach**:

1. **Prisma Database** (Primary) - Direct database authentication
2. **API** (Secondary) - Fallback to existing API
3. **Local JSON** (Tertiary) - Final fallback for development

## Test Users

After running the seed script, these test users will be available:

1. **Email:** `f.this.that@gmail.com`
   - **Password:** `Gestapo9`
   - **Role:** Customer

2. **Email:** `admin@genosys.ae`
   - **Password:** `admin123`
   - **Role:** Admin

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check if the database is accessible
- Ensure SSL mode is properly configured

### Migration Issues
- Make sure the database is empty or use `--force` flag
- Check for conflicting schema changes
- Verify Prisma client is generated

### Authentication Issues
- Check if users exist in the database
- Verify password hashing is working
- Check console logs for detailed error messages

## Production Deployment

For production deployment:

1. Use `npm run db:deploy` instead of `npm run db:migrate`
2. Ensure environment variables are properly set
3. Use Prisma Accelerate for better performance
4. Set up proper database backups

## Support

If you encounter any issues:

1. Check the console logs for detailed error messages
2. Verify your environment variables
3. Ensure the database is accessible
4. Check Prisma documentation: https://www.prisma.io/docs/
