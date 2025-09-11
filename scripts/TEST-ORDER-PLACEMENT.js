// Complete Order Placement Test
// This script tests the entire order placement flow to ensure everything works

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mhqwzsksqozydglfbhvx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXd6c2tzcW96eWRnbGZiaHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUzNDIsImV4cCI6MjA3MzAwMTM0Mn0.ZQqCzkPzWws_HMtUKafVVDBDMRms9Y6dVOI9kmaCP8o'
);

async function testCompleteOrderFlow() {
  console.log('🧪 TESTING COMPLETE ORDER PLACEMENT FLOW\n');

  try {
    // Step 1: Verify users exist
    console.log('1️⃣ Checking users in database...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role');

    if (usersError) {
      console.error('❌ Users check failed:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users in database`);
    const teacherUser = users.find(u => u.role === 'teacher');
    const canteenUser = users.find(u => u.role === 'canteen');

    if (!teacherUser) {
      console.error('❌ No teacher user found');
      return;
    }

    if (!canteenUser) {
      console.error('❌ No canteen user found');
      return;
    }

    console.log(`✅ Teacher user: ${teacherUser.name} (${teacherUser.email})`);
    console.log(`✅ Canteen user: ${canteenUser.name} (${canteenUser.email})\n`);

    // Step 2: Verify menu items exist
    console.log('2️⃣ Checking menu items...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, available')
      .eq('available', true)
      .limit(3);

    if (menuError) {
      console.error('❌ Menu items check failed:', menuError);
      return;
    }

    if (menuItems.length === 0) {
      console.error('❌ No available menu items found');
      return;
    }

    console.log(`✅ Found ${menuItems.length} available menu items`);
    menuItems.forEach(item => {
      console.log(`   - ${item.name}: ${item.price} ETB`);
    });
    console.log('');

    // Step 3: Test order creation (simulating CartContext checkout)
    console.log('3️⃣ Testing order creation...');
    const orderNumber = `TEST-${Date.now()}`;
    const totalAmount = menuItems.reduce((sum, item) => sum + item.price, 0);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: teacherUser.id,
        status: 'pending',
        total_amount: totalAmount,
        delivery_location: 'Test Room 101',
        special_instructions: 'Test order - please ignore'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      return;
    }

    console.log(`✅ Order created: ${order.order_number} (ID: ${order.id})`);
    console.log(`   Total: ${order.total_amount} ETB`);
    console.log(`   Location: ${order.delivery_location}\n`);

    // Step 4: Test order items creation
    console.log('4️⃣ Testing order items creation...');
    const orderItems = menuItems.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: 1,
      unit_price: item.price,
      total_price: item.price,
      item_name: item.name,
      item_description: `Test description for ${item.name}`,
      item_image_url: '🧪'
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('❌ Order items creation failed:', itemsError);
      return;
    }

    console.log(`✅ Created ${createdItems.length} order items`);
    createdItems.forEach(item => {
      console.log(`   - ${item.item_name}: ${item.quantity}x ${item.unit_price} ETB`);
    });
    console.log('');

    // Step 5: Test canteen interface query
    console.log('5️⃣ Testing canteen interface query...');
    const { data: canteenOrder, error: canteenError } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          name,
          email,
          phone,
          department
        ),
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          item_name,
          item_description,
          item_image_url,
          menu_item_id,
          menu_items (
            name,
            description,
            image_url
          )
        )
      `)
      .eq('id', order.id)
      .single();

    if (canteenError) {
      console.error('❌ Canteen query failed:', canteenError);
      return;
    }

    console.log('✅ Canteen interface query successful');
    console.log(`   Order: ${canteenOrder.order_number}`);
    console.log(`   Customer: ${canteenOrder.users.name}`);
    console.log(`   Items: ${canteenOrder.order_items.length}`);
    console.log('');

    // Step 6: Test teacher orders query
    console.log('6️⃣ Testing teacher orders query...');
    const { data: teacherOrders, error: teacherError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          item_name,
          item_description,
          item_image_url,
          menu_item_id,
          menu_items (
            name,
            description,
            image_url
          )
        )
      `)
      .eq('user_id', teacherUser.id)
      .eq('id', order.id);

    if (teacherError) {
      console.error('❌ Teacher query failed:', teacherError);
      return;
    }

    console.log('✅ Teacher orders query successful');
    console.log(`   Found ${teacherOrders.length} orders for teacher`);
    console.log('');

    // Step 7: Clean up test data
    console.log('7️⃣ Cleaning up test data...');
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('✅ Test data cleaned up\n');

    // Final result
    console.log('🎉 ALL TESTS PASSED! Order placement system is working correctly.');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Users exist and are accessible');
    console.log('✅ Menu items are available');
    console.log('✅ Orders can be created successfully');
    console.log('✅ Order items can be created with correct schema');
    console.log('✅ Canteen interface can query orders properly');
    console.log('✅ Teacher interface can query orders properly');
    console.log('✅ Database relationships work correctly');

  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Run the test
testCompleteOrderFlow().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
