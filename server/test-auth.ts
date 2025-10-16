import { AuthAPI } from './api/auth';

async function testServerAuth() {
  console.log('🚀 Testing server-side authentication...');
  
  try {
    // Test login
    const loginResult = await AuthAPI.login({
      email: 'f.this.that@gmail.com',
      password: 'Gestapo9'
    });
    
    if (loginResult.success) {
      console.log('✅ Server login successful!');
      console.log(`User: ${loginResult.data?.user.name}`);
      console.log(`Email: ${loginResult.data?.user.email}`);
      console.log(`Role: ${loginResult.data?.user.role}`);
    } else {
      console.log('❌ Server login failed:', loginResult.error);
    }
    
    // Test admin login
    const adminResult = await AuthAPI.login({
      email: 'admin@genosys.ae',
      password: 'admin123'
    });
    
    if (adminResult.success) {
      console.log('✅ Admin login successful!');
      console.log(`Admin: ${adminResult.data?.user.name}`);
      console.log(`Role: ${adminResult.data?.user.role}`);
    } else {
      console.log('❌ Admin login failed:', adminResult.error);
    }
    
  } catch (error) {
    console.error('❌ Server test error:', error);
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testServerAuth()
    .then(() => {
      console.log('✅ Server authentication test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Server authentication test failed:', error);
      process.exit(1);
    });
}

export default testServerAuth;
