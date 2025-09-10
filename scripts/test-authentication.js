// Test Authentication Script
// Run this with: node scripts/test-authentication.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthentication() {
  console.log('🔍 Testing Authentication Flow...\n');

  // Test 1: Check database connection
  console.log('1. Testing database connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    console.log('✅ Database connection successful\n');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return;
  }

  // Test 2: Check users table structure
  console.log('2. Checking users table...');
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('❌ Users table access failed:', error.message);
      console.log('💡 Try running: scripts/FIX-AUTHENTICATION-ISSUE.sql');
      return;
    }
    console.log('✅ Users table accessible\n');
  } catch (err) {
    console.error('❌ Users table error:', err.message);
    return;
  }

  // Test 3: Test sign-in with the problematic account
  const testEmail = 'surafel@sandfordschool.org'; // From the screenshot
  console.log(`3. Testing sign-in with: ${testEmail}`);
  
  try {
    // First, check if user profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('❌ No user profile found in users table');
        console.log('💡 This is likely the cause of the authentication error');
        
        // Check if auth user exists
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          console.error('❌ Cannot check auth users:', authError.message);
          return;
        }
        
        const authUser = authUsers.users.find(u => u.email === testEmail);
        if (authUser) {
          console.log('✅ Auth user exists but no profile in users table');
          console.log('🔧 Creating missing profile...');
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email,
              name: authUser.email.split('@')[0],
              role: 'teacher',
              department: 'General'
            });
            
          if (insertError) {
            console.error('❌ Failed to create profile:', insertError.message);
          } else {
            console.log('✅ Profile created successfully');
          }
        } else {
          console.log('❌ No auth user found either');
        }
      } else {
        console.error('❌ Profile check failed:', profileError.message);
      }
    } else {
      console.log('✅ User profile exists:', {
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role
      });
    }
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }

  console.log('\n🏁 Authentication test completed');
  console.log('\n💡 Next steps:');
  console.log('1. Run the SQL script: scripts/FIX-AUTHENTICATION-ISSUE.sql');
  console.log('2. Try signing in again');
  console.log('3. Check browser console for detailed error messages');
}

testAuthentication().catch(console.error);
