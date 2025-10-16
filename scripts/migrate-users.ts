import { PrismaClient, UserRole } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';
import usersData from '../src/data/users.json';

const prisma = new PrismaClient();

async function migrateUsers() {
  console.log('🚀 Starting user migration...');

  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Check if users already exist
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      console.log(`⚠️ Found ${existingUsers.length} existing users. Skipping migration.`);
      return;
    }

    // Migrate each user
    for (const userData of usersData.users) {
      console.log(`📝 Migrating user: ${userData.email}`);

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          name: userData.name,
          phone: userData.phone,
          role: userData.role.toUpperCase() as UserRole,
          isActive: userData.isActive,
          emailVerified: userData.emailVerified,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
        },
      });

      console.log(`✅ Migrated user: ${user.email} (ID: ${user.id})`);
    }

    console.log('🎉 User migration completed successfully!');
    console.log(`📊 Migrated ${usersData.users.length} users`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('✅ Disconnected from database');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateUsers;
