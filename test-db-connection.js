// Simple test to check database connection
// Run this with: node test-db-connection.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zpltdsnjvsdvoppgebjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbHRkc25qdnNkdm9wcGdlYmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjE0MzcsImV4cCI6MjA3NjE5NzQzN30.AXhr-ei348S1ZIlRgnOzwgFy5fyO5vc7ZMwT0bG7Xtc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test if wishlist_items table exists
    const { data: wishlistData, error: wishlistError } = await supabase
      .from('wishlist_items')
      .select('count')
      .limit(1);
    
    if (wishlistError) {
      console.log('⚠️  wishlist_items table does not exist:', wishlistError.message);
      console.log('Please run the setup-tables.sql script in your Supabase SQL editor');
    } else {
      console.log('✅ wishlist_items table exists');
    }
    
    // Test if addresses table exists
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .select('count')
      .limit(1);
    
    if (addressError) {
      console.log('⚠️  addresses table does not exist:', addressError.message);
      console.log('Please run the setup-tables.sql script in your Supabase SQL editor');
    } else {
      console.log('✅ addresses table exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testConnection();
