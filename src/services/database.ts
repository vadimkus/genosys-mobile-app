import { Pool } from 'pg';

// Database configuration
const POSTGRES_URL = process.env.POSTGRES_URL || 'postgres://bba1d642802ecf0af6b89802617217c7ee4bd9e45a9df009f7fcc332176072e7:sk_-vf4T6G2TVhfLC4FwIJsi@db.prisma.io:5432/postgres?sslmode=require';

// Create connection pool
const pool = new Pool({
  connectionString: POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Get all products
export const getProducts = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        id,
        name,
        description,
        price,
        "originalPrice",
        "discountPercentage",
        "imageUrl",
        "imageUrls",
        category,
        brand,
        "isActive",
        "isFeatured",
        "isNew",
        "isOnSale",
        stock,
        "averageRating",
        "reviewCount",
        "createdAt",
        "updatedAt"
      FROM "Product" 
      WHERE "isActive" = true 
      ORDER BY "createdAt" DESC
    `);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        id,
        name,
        description,
        price,
        "originalPrice",
        "discountPercentage",
        "imageUrl",
        "imageUrls",
        category,
        brand,
        "isActive",
        "isFeatured",
        "isNew",
        "isOnSale",
        stock,
        "averageRating",
        "reviewCount",
        "createdAt",
        "updatedAt"
      FROM "Product" 
      WHERE "isActive" = true AND "isFeatured" = true
      ORDER BY "createdAt" DESC
      LIMIT 8
    `);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    throw error;
  }
};

// Get new products
export const getNewProducts = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        id,
        name,
        description,
        price,
        "originalPrice",
        "discountPercentage",
        "imageUrl",
        "imageUrls",
        category,
        brand,
        "isActive",
        "isFeatured",
        "isNew",
        "isOnSale",
        stock,
        "averageRating",
        "reviewCount",
        "createdAt",
        "updatedAt"
      FROM "Product" 
      WHERE "isActive" = true AND "isNew" = true
      ORDER BY "createdAt" DESC
      LIMIT 6
    `);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching new products:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM "Product" 
      WHERE "isActive" = true AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 6
    `);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
};

export default pool;
