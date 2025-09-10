// Verify complete setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cwzbvlwjehcssjzyydgj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3emJ2bHdqZWhjc3Nqenl5ZGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTYzMDgsImV4cCI6MjA3Mjk3MjMwOH0.XU5O6BCax98w2YUGGLxZGrWOfHZEOna-wbGjxrCRbBk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySetup() {
  console.log('🔍 Verifying complete setup...\n');
  
  try {
    // 1. Test basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('menu_items').select('count');
    if (error) throw error;
    console.log('✅ Basic connection works\n');
    
    // 2. Check if sample menu items exist
    console.log('2. Checking sample menu items...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(5);
    
    if (menuError) throw menuError;
    console.log(`✅ Found ${menuItems.length} menu items`);
    if (menuItems.length > 0) {
      console.log(`   Sample: ${menuItems[0].name} - ${menuItems[0].price} ETB`);
    }
    console.log('');
    
    // 3. Test menu item creation (the main issue)
    console.log('3. Testing menu item creation...');
    const { data: newItem, error: createError } = await supabase
      .from('menu_items')
      .insert({
        name: 'Test Wings',
        description: 'Spicy chicken wings',
        price: 250,
        category: 'Snacks',
        image_url: '🍗',
        prep_time: 15,
        available: true
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Menu item creation failed:', createError.message);
      console.error('   This means RLS policies are still blocking!');
      return false;
    } else {
      console.log('✅ Menu item creation works!');
      console.log(`   Created: ${newItem.name} (ID: ${newItem.id})`);
      
      // Clean up
      await supabase.from('menu_items').delete().eq('id', newItem.id);
      console.log('✅ Test item cleaned up\n');
    }
    
    // 4. Check table permissions
    console.log('4. Checking table permissions...');
    const tables = ['users', 'menu_items', 'orders', 'order_items'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    }
    
    console.log('\n🎉 Setup verification completed successfully!');
    console.log('Your database is ready for the canteen management system.');
    return true;
    
  } catch (error) {
    console.error('❌ Setup verification failed:', error.message);
    console.error('\n🔧 Please run the COMPLETE-RESET-DATABASE.sql script in Supabase.');
    return false;
  }
}

verifySetup();
