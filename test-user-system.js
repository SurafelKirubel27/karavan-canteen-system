// Test the complete user system
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const envVars = {};
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('❌ Could not read .env.local file:', error.message);
    return null;
  }
}

async function testUserSystem() {
  console.log('🧪 TESTING USER SYSTEM\n');
  
  const envVars = loadEnvFile();
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if users table exists
    console.log('1. Testing users table...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Users table error:', error.message);
      console.log('   Please run the 01-create-users-table.sql script first');
      return false;
    }
    
    console.log('✅ Users table exists and accessible\n');
    
    // Test 2: Check if canteen admin exists
    console.log('2. Checking canteen admin user...');
    const { data: canteenUser, error: canteenError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'karavanstaff@sandfordschool.edu')
      .single();
    
    if (canteenError) {
      console.log('❌ Canteen admin not found in users table');
      console.log('   Please run the 02-create-canteen-admin.sql script');
      return false;
    }
    
    console.log('✅ Canteen admin user exists:');
    console.log(`   Name: ${canteenUser.name}`);
    console.log(`   Role: ${canteenUser.role}`);
    console.log(`   Department: ${canteenUser.department}\n`);
    
    // Test 3: Test user creation (simulate teacher signup)
    console.log('3. Testing user creation...');

    // First create auth user (simulate signup)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `teacher.test${Date.now()}@sandfordschool.edu`,
      password: 'TestPassword123'
    });
    
    if (authError) {
      console.log('❌ Auth signup failed:', authError.message);
      return false;
    }
    
    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: 'Test Teacher',
          role: 'teacher',
          department: 'Mathematics',
          phone: '+251 900000000'
        });
      
      if (profileError) {
        console.log('❌ User profile creation failed:', profileError.message);
        return false;
      }
      
      console.log('✅ User creation successful');
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', authData.user.id);
      console.log('✅ Test user cleaned up\n');
    }
    
    console.log('🎉 USER SYSTEM TEST PASSED!');
    console.log('✅ Users table is working');
    console.log('✅ Canteen admin is set up');
    console.log('✅ Teacher signup will work');
    console.log('\n📋 Ready for authentication testing in the app!');
    
    return true;
    
  } catch (error) {
    console.log('❌ User system test failed:', error.message);
    return false;
  }
}

testUserSystem();
