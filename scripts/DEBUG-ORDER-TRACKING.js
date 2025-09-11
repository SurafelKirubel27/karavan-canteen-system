// Debug Order Tracking Synchronization Issue
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mhqwzsksqozydglfbhvx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXd6c2tzcW96eWRnbGZiaHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUzNDIsImV4cCI6MjA3MzAwMTM0Mn0.ZQqCzkPzWws_HMtUKafVVDBDMRms9Y6dVOI9kmaCP8o'
);

console.log('🔍 DEBUGGING ORDER TRACKING SYNCHRONIZATION ISSUE');

async function debugOrderTracking() {
  try {
    // Check current orders and their statuses
    console.log('1️⃣ Checking current orders in database...');
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    console.log(`✅ Found ${orders.length} recent orders:`);
    orders.forEach(order => {
      console.log(`   - ${order.order_number}: ${order.status} (User: ${order.user_id})`);
    });

    // Check order_items schema
    console.log('\n2️⃣ Checking order_items schema...');
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
    } else if (orderItems.length > 0) {
      console.log('✅ Order items schema:');
      console.log(JSON.stringify(orderItems[0], null, 2));
    }

    // Test teacher ongoing orders query with WRONG schema (current implementation)
    console.log('\n3️⃣ Testing teacher ongoing orders query (CURRENT - WRONG SCHEMA)...');
    const teacherUserId = 'ed49c443-1bf0-4eba-b6bf-6d5b92463d50';
    
    const { data: teacherOrdersWrong, error: teacherErrorWrong } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price_at_time,
          menu_item_id,
          menu_items (
            name,
            description,
            image_url
          )
        )
      `)
      .eq('user_id', teacherUserId)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (teacherErrorWrong) {
      console.error('❌ Teacher orders query (WRONG SCHEMA) failed:', teacherErrorWrong);
    } else {
      console.log(`✅ Teacher ongoing orders (WRONG SCHEMA): ${teacherOrdersWrong.length} found`);
    }

    // Test teacher ongoing orders query with CORRECT schema
    console.log('\n4️⃣ Testing teacher ongoing orders query (CORRECT SCHEMA)...');
    
    const { data: teacherOrdersCorrect, error: teacherErrorCorrect } = await supabase
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
      .eq('user_id', teacherUserId)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (teacherErrorCorrect) {
      console.error('❌ Teacher orders query (CORRECT SCHEMA) failed:', teacherErrorCorrect);
    } else {
      console.log(`✅ Teacher ongoing orders (CORRECT SCHEMA): ${teacherOrdersCorrect.length} found`);
      teacherOrdersCorrect.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status} (Items: ${order.order_items?.length || 0})`);
      });
    }

    // Test recent orders query
    console.log('\n5️⃣ Testing teacher recent orders query...');
    
    const { data: recentOrders, error: recentError } = await supabase
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
      .eq('user_id', teacherUserId)
      .in('status', ['delivered', 'cancelled'])
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Teacher recent orders query failed:', recentError);
    } else {
      console.log(`✅ Teacher recent orders: ${recentOrders.length} found`);
      recentOrders.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status} (Items: ${order.order_items?.length || 0})`);
      });
    }

    // Create a test order to verify the workflow
    console.log('\n6️⃣ Creating test order to verify workflow...');
    const testOrderNumber = `DEBUG-${Date.now()}`;
    
    const { data: testOrder, error: testOrderError } = await supabase
      .from('orders')
      .insert({
        order_number: testOrderNumber,
        user_id: teacherUserId,
        status: 'pending',
        total_amount: 100.00,
        delivery_location: 'Debug Room 101',
        special_instructions: 'Debug test order'
      })
      .select()
      .single();

    if (testOrderError) {
      console.error('❌ Test order creation failed:', testOrderError);
    } else {
      console.log(`✅ Test order created: ${testOrder.order_number}`);

      // Test status updates
      console.log('\n7️⃣ Testing status updates...');
      
      // Update to confirmed
      await supabase.from('orders').update({ status: 'confirmed' }).eq('id', testOrder.id);
      console.log('✅ Updated to confirmed');
      
      // Update to preparing
      await supabase.from('orders').update({ status: 'preparing' }).eq('id', testOrder.id);
      console.log('✅ Updated to preparing');
      
      // Update to ready
      await supabase.from('orders').update({ status: 'ready' }).eq('id', testOrder.id);
      console.log('✅ Updated to ready');

      // Test if teacher can see the order at each stage
      const { data: finalCheck, error: finalError } = await supabase
        .from('orders')
        .select('id, order_number, status')
        .eq('user_id', teacherUserId)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .eq('id', testOrder.id);

      if (finalError) {
        console.error('❌ Final check failed:', finalError);
      } else {
        console.log(`✅ Final check - Teacher can see order: ${finalCheck.length > 0 ? 'YES' : 'NO'}`);
        if (finalCheck.length > 0) {
          console.log(`   Status: ${finalCheck[0].status}`);
        }
      }

      // Clean up
      await supabase.from('orders').delete().eq('id', testOrder.id);
      console.log('✅ Test order cleaned up');
    }

  } catch (error) {
    console.error('💥 Debug failed:', error);
  }
}

debugOrderTracking().then(() => process.exit(0));
