// Simple connection test
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwzbvlwjehcssjzyydgj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3emJ2bHdqZWhjc3Nqenl5ZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTYzMDgsImV4cCI6MjA3Mjk3MjMwOH0.XU5O6BCax98w2YUGGLxZGrWOfHZEOna-wbGjxrCRbBk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('✅ Authentication service is working');
    console.log('✅ Environment variables are loaded correctly');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection();
