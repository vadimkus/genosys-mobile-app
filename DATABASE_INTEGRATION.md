# Mobile App Database Integration

This document outlines the complete database setup and integration for the Genosys mobile application, ensuring all user data, orders, addresses, and preferences are properly stored and managed.

## 🏗️ Database Architecture

### Database Technology
- **Primary Database**: PostgreSQL on Prisma Cloud
- **Connection**: Direct PostgreSQL connection with Prisma Accelerate for performance
- **ORM**: Raw SQL queries for maximum flexibility and performance

### Database Credentials
The app uses the following database URLs (configured in `.env`):
- **Prisma Accelerate URL**: For production app usage with caching and connection pooling
- **Direct PostgreSQL URL**: For database setup, migrations, and admin tasks

## 📊 Database Schema

### Core Tables

#### 1. `mobile_users`
Stores user profile information for mobile app users.

**Fields:**
- `id` (VARCHAR, Primary Key): Unique user identifier
- `email` (VARCHAR, Unique): User email address
- `name` (VARCHAR): Full name
- `phone` (VARCHAR): Phone number
- `date_of_birth` (VARCHAR): Date of birth
- `gender` (VARCHAR): Gender preference
- `address` (TEXT): Primary delivery address
- `profile_picture` (VARCHAR): URL to profile image
- `discount_type` (VARCHAR): User discount category
- `discount_percentage` (DECIMAL): Discount rate
- `email_notifications` (BOOLEAN): Email notification preference
- `sms_notifications` (BOOLEAN): SMS notification preference
- `created_at`, `updated_at` (TIMESTAMP): Audit timestamps

#### 2. `mobile_addresses`
Manages multiple delivery addresses per user.

**Fields:**
- `id` (VARCHAR, Primary Key): Address identifier
- `user_id` (VARCHAR, Foreign Key): Reference to mobile_users
- `type` (VARCHAR): Address type ('Home', 'Work', 'Other')
- `name` (VARCHAR): Contact person name
- `phone` (VARCHAR): Contact phone number
- `address` (TEXT): Street address
- `city` (VARCHAR): City name (default: 'Dubai')
- `emirate` (VARCHAR): UAE emirate (default: 'Dubai')
- `country` (VARCHAR): Country (default: 'United Arab Emirates')
- `is_default` (BOOLEAN): Default address flag
- `created_at`, `updated_at` (TIMESTAMP): Audit timestamps

#### 3. `mobile_orders`
Stores all order information and history.

**Fields:**
- `id` (VARCHAR, Primary Key): Order identifier
- `order_number` (VARCHAR, Unique): Human-readable order number
- `user_id` (VARCHAR, Foreign Key): Reference to mobile_users
- `status` (VARCHAR): Order status ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
- `payment_method` (VARCHAR): Payment method ('cod', 'card')
- `payment_status` (VARCHAR): Payment status ('pending', 'paid', 'failed')
- `customer_name`, `customer_email`, `customer_phone` (VARCHAR): Customer details
- `delivery_address_id` (VARCHAR, Foreign Key): Reference to mobile_addresses
- `shipping_address` (TEXT): Fallback address text
- `subtotal`, `shipping_cost`, `vat_amount`, `discount_amount`, `total_amount` (DECIMAL): Order totals
- `items` (JSONB): Order items with quantities and details
- `created_at`, `updated_at` (TIMESTAMP): Audit timestamps

#### 4. `mobile_wishlist`
User favorites/wishlist functionality.

**Fields:**
- `id` (VARCHAR, Primary Key): Wishlist item identifier
- `user_id` (VARCHAR, Foreign Key): Reference to mobile_users
- `product_id` (VARCHAR): Product identifier
- `product_name` (VARCHAR): Product name (cached)
- `product_image` (VARCHAR): Product image URL (cached)
- `product_price` (DECIMAL): Product price (cached)
- `added_at` (TIMESTAMP): When item was added

#### 5. `mobile_user_settings`
App-specific user preferences and settings.

**Fields:**
- `id` (VARCHAR, Primary Key): Settings identifier
- `user_id` (VARCHAR, Unique Foreign Key): Reference to mobile_users
- `theme` (VARCHAR): App theme preference ('light', 'dark')
- `language` (VARCHAR): Language preference (default: 'en')
- `push_notifications` (BOOLEAN): Push notification setting
- `email_notifications` (BOOLEAN): Email notification setting
- `sms_notifications` (BOOLEAN): SMS notification setting
- `biometric_enabled` (BOOLEAN): Biometric authentication enabled
- `auto_login` (BOOLEAN): Auto-login preference
- `created_at`, `updated_at` (TIMESTAMP): Audit timestamps

## 🔧 Database Setup

### Initial Setup
Run the database setup script to create all tables and indexes:

```bash
cd /Users/vadimkus/genosys-mobile-app
node scripts/setup-mobile-database.js
```

This script:
1. Creates all required tables with proper constraints
2. Sets up indexes for performance optimization
3. Creates triggers for automatic `updated_at` timestamp management
4. Adds sample data for testing

### Manual Setup
Alternatively, execute the SQL file directly:

```bash
psql "postgres://[connection-string]" -f database-setup.sql
```

## 🔗 Integration Architecture

### Service Layer Structure

#### 1. `services/api/mobileUserAPI.js`
Core database operations using direct PostgreSQL connections:
- **Profile Operations**: `updateUserProfile()`
- **Address Management**: `createAddress()`, `updateAddress()`, `deleteAddress()`, `getUserAddresses()`, `setDefaultAddress()`
- **Order Processing**: `saveOrder()`, `getUserOrders()`, `getOrderDetails()`
- **Wishlist Management**: `addToWishlist()`, `removeFromWishlist()`, `getUserWishlist()`

#### 2. `services/databaseService.js`
Abstraction layer that calls the mobile API functions and handles error formatting.

#### 3. `services/authService.js`
Updated to integrate database operations for profile management.

### Context Integration

#### AuthContext Enhancements
- **Profile Management**: `updateProfile()` now saves to database
- **Address Operations**: `getAddresses()`, `addAddress()`, `editAddress()`, `removeAddress()`, `setAddressAsDefault()`
- **Image Upload**: `uploadProfilePicture()` integration

#### CartContext Enhancements  
- **Order Persistence**: `saveOrderToDatabase()` function
- **Automatic Cart Clearing**: After successful order placement

#### FavoritesContext (New)
- **Wishlist Sync**: Synchronizes local favorites with database
- **Offline Support**: Works offline with local storage, syncs when online
- **User Integration**: Automatically syncs when user logs in

## 📱 Mobile App Integration

### Profile Management
All profile data is now stored in the database:
- **Profile Pictures**: Uploaded and stored with URL references
- **Personal Information**: Name, phone, date of birth, gender
- **Addresses**: Multiple delivery addresses with default selection
- **Preferences**: Notification settings and app preferences

### Order Management
Orders are automatically saved to the database:
- **Order Creation**: Complete order data including items, totals, and customer details
- **Order History**: Users can view past orders
- **Order Tracking**: Status updates are reflected in the database

### Favorites/Wishlist
Wishlist items are synchronized across devices:
- **Local Storage**: For offline access
- **Database Sync**: When user is logged in
- **Cross-Device**: Favorites sync across all user devices

### Address Management
Comprehensive address functionality:
- **Multiple Addresses**: Users can save multiple delivery addresses
- **Address Types**: Home, Work, Other categories
- **Default Selection**: One default address per user
- **UAE Emirates**: Full support for UAE emirates and cities

## 🔒 Data Security & Privacy

### Security Measures
1. **Connection Security**: All database connections use SSL
2. **Input Validation**: SQL injection prevention through parameterized queries
3. **User Isolation**: All queries are user-scoped with proper foreign key constraints
4. **Data Encryption**: Sensitive data is encrypted in transit

### Privacy Compliance
1. **User Consent**: All data collection follows user consent
2. **Data Retention**: Orders and profiles are retained as per privacy policy
3. **Data Portability**: Users can export their data
4. **Right to Deletion**: Users can delete their accounts and all associated data

## 🚀 Performance Optimizations

### Database Indexes
- **User Lookups**: `idx_mobile_users_email` for fast user queries
- **Address Queries**: `idx_mobile_addresses_user_id` for user address lookups
- **Order History**: `idx_mobile_orders_user_id` and `idx_mobile_orders_number`
- **Wishlist Queries**: `idx_mobile_wishlist_user_id` for favorites

### Connection Pooling
- **Prisma Accelerate**: Automatic connection pooling and caching
- **Query Optimization**: Efficient queries with minimal round trips
- **Async Operations**: Non-blocking database operations

## 📊 Analytics & Monitoring

### Data Insights
The database structure supports comprehensive analytics:
- **User Behavior**: Order patterns, favorite products, address usage
- **Sales Analytics**: Order values, payment methods, popular products
- **Geographic Data**: Delivery patterns by emirate/city
- **App Usage**: User settings, notification preferences, feature adoption

### Monitoring Points
- **Order Success Rate**: Percentage of successful orders
- **User Engagement**: Wishlist activity, profile completeness
- **Performance Metrics**: Query response times, error rates
- **Data Quality**: Address validation, profile completeness

## 🔄 Data Migration & Backup

### Backup Strategy
1. **Automated Backups**: Prisma Cloud provides automated backups
2. **Data Export**: Regular exports for disaster recovery
3. **Version Control**: Database schema versions tracked in Git

### Migration Support
- **Schema Changes**: Managed through migration scripts
- **Data Transformation**: Scripts for data format updates
- **Rollback Support**: Ability to revert schema changes

## 📋 Testing & Validation

### Database Testing
1. **Connection Testing**: Verify database connectivity
2. **CRUD Operations**: Test all create, read, update, delete operations
3. **Constraint Testing**: Verify foreign key and unique constraints
4. **Performance Testing**: Query performance under load

### Integration Testing
1. **End-to-End**: Full user journey testing
2. **Error Handling**: Database error scenarios
3. **Sync Testing**: Offline/online data synchronization
4. **Multi-User**: Concurrent user operations

## 🎯 Future Enhancements

### Planned Features
1. **Real-time Sync**: WebSocket-based real-time updates
2. **Advanced Analytics**: Machine learning for recommendations
3. **Multi-Region**: Geographic data distribution
4. **API Gateway**: Centralized API management
5. **GraphQL**: More efficient data fetching
6. **Caching Layer**: Redis for frequently accessed data

### Scalability Considerations
1. **Read Replicas**: For improved read performance
2. **Sharding**: Horizontal scaling for large datasets
3. **CDN Integration**: For profile images and assets
4. **Queue System**: For background processing of orders

---

## 📞 Support & Maintenance

For database-related issues or questions:
- **Technical Documentation**: This file and inline code comments
- **Database Schema**: `database-setup.sql` for reference
- **API Documentation**: Function signatures in service files
- **Monitoring**: Check Prisma Cloud dashboard for performance metrics

All database operations are logged for debugging and performance monitoring.

