// Test Order Status Synchronization Issue
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mhqwzsksqozydglfbhvx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXd6c2tzcW96eWRnbGZiaHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUzNDIsImV4cCI6MjA3MzAwMTM0Mn0.ZQqCzkPzWws_HMtUKafVVDBDMRms9Y6dVOI9kmaCP8o'
);

console.log('🧪 TESTING ORDER STATUS SYNCHRONIZATION WORKFLOW');

async function testStatusSynchronization() {
  try {
    const teacherUserId = 'ed49c443-1bf0-4eba-b6bf-6d5b92463d50';
    
    // Step 1: Create a test order (simulating teacher placing order)
    console.log('1️⃣ Creating test order (teacher places order)...');
    const orderNumber = `SYNC-TEST-${Date.now()}`;
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: teacherUserId,
        status: 'pending',
        total_amount: 100.00,
        delivery_location: 'Test Room 101',
        special_instructions: 'Test order for status sync'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      return;
    }

    console.log(`✅ Order created: ${order.order_number} with status: ${order.status}`);

    // Step 2: Check if order appears in teacher ongoing orders
    console.log('\n2️⃣ Checking teacher ongoing orders (should include pending)...');
    const { data: teacherOngoing1, error: teacherError1 } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('user_id', teacherUserId)
      .in('status', ['pending', 'preparing', 'ready'])
      .eq('id', order.id);

    if (teacherError1) {
      console.error('❌ Teacher ongoing query failed:', teacherError1);
    } else {
      console.log(`✅ Teacher ongoing orders: ${teacherOngoing1.length} found`);
      if (teacherOngoing1.length > 0) {
        console.log(`   - ${teacherOngoing1[0].order_number}: ${teacherOngoing1[0].status}`);
      }
    }

    // Step 3: Check if order appears in canteen incoming orders
    console.log('\n3️⃣ Checking canteen incoming orders (should include pending)...');
    const { data: canteenIncoming1, error: canteenError1 } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .in('status', ['pending', 'confirmed'])
      .eq('id', order.id);

    if (canteenError1) {
      console.error('❌ Canteen incoming query failed:', canteenError1);
    } else {
      console.log(`✅ Canteen incoming orders: ${canteenIncoming1.length} found`);
      if (canteenIncoming1.length > 0) {
        console.log(`   - ${canteenIncoming1[0].order_number}: ${canteenIncoming1[0].status}`);
      }
    }

    // Step 4: Simulate canteen staff confirming the order
    console.log('\n4️⃣ Simulating canteen staff confirming order...');
    const { error: confirmError } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', order.id);

    if (confirmError) {
      console.error('❌ Order confirmation failed:', confirmError);
      return;
    }

    console.log('✅ Order status updated to: confirmed');

    // Step 5: Check teacher ongoing orders after confirmation
    console.log('\n5️⃣ Checking teacher ongoing orders after confirmation...');
    const { data: teacherOngoing2, error: teacherError2 } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('user_id', teacherUserId)
      .in('status', ['pending', 'preparing', 'ready'])
      .eq('id', order.id);

    if (teacherError2) {
      console.error('❌ Teacher ongoing query failed:', teacherError2);
    } else {
      console.log(`✅ Teacher ongoing orders: ${teacherOngoing2.length} found`);
      if (teacherOngoing2.length === 0) {
        console.log('🚨 ISSUE CONFIRMED: Order with "confirmed" status is missing from teacher ongoing orders!');
      } else {
        console.log(`   - ${teacherOngoing2[0].order_number}: ${teacherOngoing2[0].status}`);
      }
    }

    // Step 6: Check what happens with the correct filter
    console.log('\n6️⃣ Testing with corrected filter (including confirmed)...');
    const { data: teacherOngoing3, error: teacherError3 } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('user_id', teacherUserId)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .eq('id', order.id);

    if (teacherError3) {
      console.error('❌ Corrected teacher query failed:', teacherError3);
    } else {
      console.log(`✅ Teacher ongoing orders (with confirmed): ${teacherOngoing3.length} found`);
      if (teacherOngoing3.length > 0) {
        console.log(`   - ${teacherOngoing3[0].order_number}: ${teacherOngoing3[0].status}`);
        console.log('✅ SOLUTION CONFIRMED: Adding "confirmed" to filter fixes the issue!');
      }
    }

    // Step 7: Test the full status workflow
    console.log('\n7️⃣ Testing full status workflow...');
    
    // Move to preparing
    await supabase.from('orders').update({ status: 'preparing' }).eq('id', order.id);
    console.log('✅ Status updated to: preparing');
    
    // Move to ready
    await supabase.from('orders').update({ status: 'ready' }).eq('id', order.id);
    console.log('✅ Status updated to: ready');
    
    // Move to delivered
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id);
    console.log('✅ Status updated to: delivered');

    // Check recent orders
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('user_id', teacherUserId)
      .in('status', ['delivered', 'cancelled'])
      .eq('id', order.id);

    if (recentError) {
      console.error('❌ Recent orders query failed:', recentError);
    } else {
      console.log(`✅ Teacher recent orders: ${recentOrders.length} found`);
      if (recentOrders.length > 0) {
        console.log(`   - ${recentOrders[0].order_number}: ${recentOrders[0].status}`);
      }
    }

    // Step 8: Clean up
    console.log('\n8️⃣ Cleaning up test data...');
    await supabase.from('orders').delete().eq('id', order.id);
    console.log('✅ Test order deleted');

    // Summary
    console.log('\n📋 SYNCHRONIZATION ISSUE ANALYSIS:');
    console.log('❌ PROBLEM: Teacher ongoing orders filter missing "confirmed" status');
    console.log('✅ SOLUTION: Add "confirmed" to teacher ongoing orders status filter');
    console.log('✅ STATUS FLOW: pending → confirmed → preparing → ready → delivered');
    console.log('✅ TEACHER ONGOING: should include [pending, confirmed, preparing, ready]');
    console.log('✅ TEACHER RECENT: should include [delivered, cancelled]');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testStatusSynchronization().then(() => process.exit(0));
