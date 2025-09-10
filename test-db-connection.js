// Test database connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwzbvlwjehcssjzyydgj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3emJ2bHdqZWhjc3Nqenl5ZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTYzMDgsImV4cCI6MjA3Mjk3MjMwOH0.XU5O6BCax98w2YUGGLxZGrWOfHZEOna-wbGjxrCRbBk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('menu_items').select('count');

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }

    console.log('✅ Connection successful!');

    // Test 2: Check tables exist
    const tables = ['users', 'menu_items', 'orders', 'order_items'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.error(`❌ Table '${table}' error:`, error.message);
        } else {
          console.log(`✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.error(`❌ Table '${table}' failed:`, err.message);
      }
    }

    // Test 3: Try to insert a test menu item
    console.log('\nTesting menu item insertion...');
    const { data: insertData, error: insertError } = await supabase
      .from('menu_items')
      .insert({
        name: 'Test Item',
        description: 'Test Description',
        price: 100,
        category: 'Test',
        image_url: '🧪',
        prep_time: 5,
        available: true
      })
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.error('Error details:', insertError);
    } else {
      console.log('✅ Insert successful:', insertData);

      // Clean up - delete the test item
      await supabase.from('menu_items').delete().eq('id', insertData[0].id);
      console.log('✅ Test item cleaned up');
    }

    // Test 4: Try to create a test user (skip for now since it needs auth user)
    console.log('\nSkipping user creation test (requires auth user)...');
    console.log('✅ User test skipped - will test through signup flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
