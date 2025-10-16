// Prisma client - only available in Node.js environments
let prisma: any = null;

// Try to import Prisma client (will fail in React Native)
try {
  if (typeof window === 'undefined') {
    // Only import in Node.js environment
    const { PrismaClient } = require('../generated/prisma');
    prisma = new PrismaClient({
      log: ['error'],
      errorFormat: 'pretty',
    });
  }
} catch (error) {
  console.log('⚠️ Prisma client not available in this environment');
  prisma = null;
}

export default prisma;

// Database connection helper
export const connectDatabase = async () => {
  if (!prisma) {
    console.log('⚠️ Prisma not available in this environment');
    return false;
  }
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Database disconnection helper
export const disconnectDatabase = async () => {
  if (!prisma) return;
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
};

// Health check
export const checkDatabaseHealth = async () => {
  if (!prisma) {
    return { 
      status: 'unavailable', 
      error: 'Prisma not available in this environment',
      timestamp: new Date().toISOString() 
    };
  }
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
};
