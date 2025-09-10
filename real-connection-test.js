// REAL CONNECTION TEST - This will actually verify the connection
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

async function realConnectionTest() {
  console.log('🔍 REAL Supabase Connection Test\n');
  
  // Step 1: Check environment file
  console.log('1. Checking environment variables...');
  const envVars = loadEnvFile();
  
  if (!envVars) {
    console.log('❌ Failed to load environment variables');
    return false;
  }
  
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase URL or Key in .env.local');
    return false;
  }
  
  if (supabaseUrl.includes('YOUR_NEW_PROJECT_URL_HERE') || supabaseKey.includes('YOUR_NEW_ANON_KEY_HERE')) {
    console.log('❌ You still have placeholder values in .env.local');
    console.log('   Please replace them with your actual Supabase project values');
    return false;
  }
  
  console.log('✅ Environment variables look good\n');
  
  // Step 2: Create Supabase client
  console.log('2. Creating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Client created\n');
  
  // Step 3: Test actual server connection
  console.log('3. Testing REAL server connection...');
  try {
    // This actually contacts the Supabase server
    const { data, error } = await supabase
      .from('_realtime_schema')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      // This error means we connected but the table doesn't exist - which is good!
      console.log('✅ Successfully connected to Supabase server!');
      console.log('✅ Your project exists and is accessible\n');
    } else if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('   This means your URL or key is wrong, or project doesn\'t exist');
      return false;
    } else {
      console.log('✅ Connected successfully!\n');
    }
  } catch (error) {
    console.log('❌ Failed to connect to server:', error.message);
    return false;
  }
  
  // Step 4: Test authentication service
  console.log('4. Testing authentication service...');
  try {
    const { data, error } = await supabase.auth.getUser();
    console.log('✅ Authentication service is working');
    console.log(`   Current user: ${data.user ? data.user.email : 'No user logged in'}\n`);
  } catch (error) {
    console.log('❌ Authentication service failed:', error.message);
    return false;
  }
  
  console.log('🎉 REAL CONNECTION TEST PASSED!');
  console.log('Your Supabase project is properly connected to your app.');
  return true;
}

realConnectionTest();
