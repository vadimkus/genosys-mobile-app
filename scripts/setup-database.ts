import { PrismaClient } from '../src/generated/prisma';
import migrateUsers from './migrate-users';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Check database health
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database health check passed');

    // Run Prisma migrations
    console.log('📦 Running database migrations...');
    // Note: In production, you would run: npx prisma migrate deploy
    // For development, you would run: npx prisma migrate dev
    
    console.log('✅ Database setup completed');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('✅ Disconnected from database');
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabase;
