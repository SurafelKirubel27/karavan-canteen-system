'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestOrder() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOrderCreation = async () => {
    setLoading(true);
    try {
      console.log('Testing order creation...');
      
      // Test creating an order
      const orderData = {
        order_number: `TEST-${Date.now()}`,
        teacher_id: '00000000-0000-0000-0000-000000000000',
        status: 'pending',
        total_amount: 100.00,
        delivery_location: 'Test Room 101',
        special_instructions: 'Test order'
      };

      console.log('Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      console.log('Order creation result:', { order, orderError });

      if (orderError) {
        setResult({ success: false, error: orderError.message, details: orderError });
        return;
      }

      // Get a real menu item ID first
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('id')
        .limit(1);

      if (!menuItems || menuItems.length === 0) {
        setResult({ success: false, error: 'No menu items found in database' });
        return;
      }

      // Test creating order items
      const orderItems = [
        {
          order_id: order.id,
          menu_item_id: menuItems[0].id,
          quantity: 2,
          price_at_time: 50.00
        }
      ];

      console.log('Creating order items:', orderItems);

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      console.log('Order items result:', { items, itemsError });

      if (itemsError) {
        setResult({ 
          success: false, 
          error: itemsError.message, 
          details: itemsError,
          orderCreated: true,
          orderId: order.id 
        });
        return;
      }

      setResult({ 
        success: true, 
        order, 
        items,
        message: 'Order created successfully!' 
      });

    } catch (error) {
      console.error('Test error:', error);
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Order Creation</h1>
      
      <button
        onClick={testOrderCreation}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Order Creation'}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
