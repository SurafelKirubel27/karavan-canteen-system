// Investigate Order Status Synchronization Issue
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mhqwzsksqozydglfbhvx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocXd6c2tzcW96eWRnbGZiaHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUzNDIsImV4cCI6MjA3MzAwMTM0Mn0.ZQqCzkPzWws_HMtUKafVVDBDMRms9Y6dVOI9kmaCP8o'
);

console.log('🔍 INVESTIGATING ORDER STATUS SYNCHRONIZATION ISSUE');

async function investigateOrderStatuses() {
  try {
    // Check current orders and their statuses
    console.log('1️⃣ Checking current orders in database...');
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    console.log(`✅ Found ${orders.length} orders:`);
    orders.forEach(order => {
      console.log(`   - ${order.order_number}: ${order.status} (Created: ${order.created_at.substring(0, 19)})`);
    });

    // Test teacher ongoing orders query
    console.log('\n2️⃣ Testing teacher ongoing orders query...');
    const teacherUserId = 'ed49c443-1bf0-4eba-b6bf-6d5b92463d50'; // Real teacher ID
    
    const { data: ongoingOrders, error: ongoingError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .eq('user_id', teacherUserId)
      .in('status', ['pending', 'preparing', 'ready'])
      .order('created_at', { ascending: false });

    if (ongoingError) {
      console.error('❌ Ongoing orders query error:', ongoingError);
    } else {
      console.log(`✅ Teacher ongoing orders: ${ongoingOrders.length} found`);
      ongoingOrders.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status}`);
      });
    }

    // Test teacher recent orders query
    console.log('\n3️⃣ Testing teacher recent orders query...');
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .eq('user_id', teacherUserId)
      .in('status', ['delivered', 'cancelled'])
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Recent orders query error:', recentError);
    } else {
      console.log(`✅ Teacher recent orders: ${recentOrders.length} found`);
      recentOrders.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status}`);
      });
    }

    // Test canteen incoming orders query
    console.log('\n4️⃣ Testing canteen incoming orders query...');
    const { data: incomingOrders, error: incomingError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false });

    if (incomingError) {
      console.error('❌ Incoming orders query error:', incomingError);
    } else {
      console.log(`✅ Canteen incoming orders: ${incomingOrders.length} found`);
      incomingOrders.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status}`);
      });
    }

    // Check for orders with 'confirmed' status that are missing from teacher ongoing
    console.log('\n5️⃣ Checking for confirmed orders missing from teacher ongoing...');
    const { data: confirmedOrders, error: confirmedError } = await supabase
      .from('orders')
      .select('id, order_number, status, user_id, created_at')
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false });

    if (confirmedError) {
      console.error('❌ Confirmed orders query error:', confirmedError);
    } else {
      console.log(`✅ Found ${confirmedOrders.length} confirmed orders:`);
      confirmedOrders.forEach(order => {
        console.log(`   - ${order.order_number}: ${order.status} (User: ${order.user_id})`);
      });
      
      if (confirmedOrders.length > 0) {
        console.log('\n🚨 ISSUE IDENTIFIED: Orders with "confirmed" status are not showing in teacher ongoing orders!');
        console.log('   Teacher ongoing query filters: ["pending", "preparing", "ready"]');
        console.log('   Missing status: "confirmed"');
      }
    }

    // Test all possible status values in database
    console.log('\n6️⃣ Checking all status values in database...');
    const { data: allStatuses, error: statusError } = await supabase
      .from('orders')
      .select('status')
      .order('status');

    if (statusError) {
      console.error('❌ Status check error:', statusError);
    } else {
      const uniqueStatuses = [...new Set(allStatuses.map(o => o.status))];
      console.log(`✅ All status values in database: ${uniqueStatuses.join(', ')}`);
    }

  } catch (error) {
    console.error('💥 Investigation failed:', error);
  }
}

investigateOrderStatuses().then(() => process.exit(0));
