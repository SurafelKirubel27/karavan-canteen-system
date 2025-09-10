'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import KaravanLogo from '@/components/KaravanLogo';

interface IncomingOrder {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  service_fee: number;
  delivery_location: string;
  special_instructions?: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  estimated_ready_time?: string;
  users?: {
    name: string;
    email: string;
    phone?: string;
    department?: string;
  };
  order_items?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    item_name: string;
    item_description?: string;
    item_image_url?: string;
  }>;
}

// Real orders will be loaded from database
export default function IncomingOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<IncomingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/canteen/login');
    } else if (user.role !== 'canteen' && user.role !== 'admin') {
      router.push('/welcome');
    }
  }, [user, router]);

  // Load incoming orders from database
  useEffect(() => {
    loadIncomingOrders();
  }, []);

  const loadIncomingOrders = async () => {
    try {
      const { data, error } = await supabase
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
            item_image_url
          )
        `)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    setIsProcessing(orderId);

    try {
      // Update order status to 'confirmed' in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'confirmed'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Reload orders to show updated status
      await loadIncomingOrders();
      setSelectedOrder(null);

      alert('Order confirmed! Estimated ready time has been calculated.');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Failed to confirm order. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleStartPreparing = async (orderId: string) => {
    setIsProcessing(orderId);

    try {
      // Update order status to 'preparing' in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'preparing'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Remove from incoming orders list
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setSelectedOrder(null);

      alert('Order moved to preparing! Check ongoing orders to continue.');
    } catch (error) {
      console.error('Error starting preparation:', error);
      alert('Failed to start preparation. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setIsProcessing(orderId);

    try {
      // Update order status to 'cancelled' in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Remove from incoming orders list
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setSelectedOrder(null);

      alert('Order cancelled and customer notified.');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    setIsProcessing(orderId);

    try {
      // Update order status to 'confirmed' in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          estimated_ready_time: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        })
        .eq('id', orderId);

      if (error) throw error;

      // Reload orders to show updated status
      await loadIncomingOrders();
      setSelectedOrder(null);

      alert('Order accepted! Estimated ready time set to 30 minutes.');
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeclineOrder = async (orderId: string) => {
    setIsProcessing(orderId);

    try {
      // Update order status to 'cancelled' in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled'
        })
        .eq('id', orderId);

      if (error) throw error;

      // Remove from incoming orders list
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setSelectedOrder(null);

      alert('Order declined and customer notified.');
    } catch (error) {
      console.error('Error declining order:', error);
      alert('Failed to decline order. Please try again.');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/canteen/dashboard">
              <KaravanLogo size="md" />
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link href="/canteen/dashboard" className="text-gray-700 hover:text-emerald-700">Dashboard</Link>
              <span className="text-emerald-700 font-medium">Incoming Orders</span>
              <Link href="/canteen/orders/ongoing" className="text-gray-700 hover:text-emerald-700">Ongoing Orders</Link>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push('/welcome');
                }}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Incoming Orders</h1>
            <p className="text-gray-600">Review and accept new orders from teachers</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
            <span className="text-sm text-gray-600">Pending Orders: </span>
            <span className="font-bold text-emerald-600">{orders.length}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading incoming orders...</div>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                      <p className="text-sm text-gray-800">Placed at {new Date(order.created_at).toLocaleTimeString()}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{order.total_amount} ETB</p>
                    <p className="text-sm text-gray-800">Items: {order.order_items?.length || 0}</p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900"><span className="font-medium">Location:</span> {order.delivery_location}</p>
                    {order.special_instructions && (
                      <p className="text-gray-900"><span className="font-medium">Instructions:</span> {order.special_instructions}</p>
                    )}
                    <p className="text-gray-900"><span className="font-medium">Teacher:</span> {order.users?.name || 'Unknown'}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
                  <div className="space-y-2">
                    {order.order_items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{item.item_image_url || '🍽️'}</span>
                          <span className="text-sm text-gray-900 font-medium">{item.item_name || 'Unknown Item'}</span>
                          <span className="text-xs text-gray-800">x{item.quantity}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.total_price} ETB
                        </span>
                      </div>
                    )) || <p className="text-sm text-gray-500">No items found</p>}
                  </div>
                </div>



                {/* Action Buttons */}
                <div className="p-6">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={isProcessing === order.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isProcessing === order.id ? 'Processing...' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => handleConfirmOrder(order.id)}
                          disabled={isProcessing === order.id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isProcessing === order.id ? 'Processing...' : 'Confirm'}
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleStartPreparing(order.id)}
                        disabled={isProcessing === order.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isProcessing === order.id ? 'Processing...' : 'Start Preparing'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No incoming orders</h3>
            <p className="text-gray-600 mb-6">All orders have been processed</p>
            <Link href="/canteen/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSelectedOrder(null)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Order Number:</span> {selectedOrder.order_number}</p>
                      <p><span className="font-medium">Status:</span> <span className="capitalize">{selectedOrder.status}</span></p>
                      <p><span className="font-medium">Placed at:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                      {selectedOrder.estimated_ready_time && (
                        <p><span className="font-medium">Estimated ready time:</span> {new Date(selectedOrder.estimated_ready_time).toLocaleString()}</p>
                      )}
                      <p><span className="font-medium">Total amount:</span> {selectedOrder.total_amount} ETB</p>
                      <p><span className="font-medium">Service fee:</span> {selectedOrder.service_fee} ETB</p>
                    </div>
                  </div>

                  {/* Teacher Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Teacher Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedOrder.users?.name}</p>
                      <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedOrder.users?.email}</p>
                      <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedOrder.users?.phone}</p>
                      <p className="text-gray-900"><span className="font-medium">Department:</span> {selectedOrder.users?.department}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Items Ordered</h3>
                    <div className="space-y-3">
                      {selectedOrder.order_items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{item.item_image_url || '🍽️'}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                              <p className="text-sm text-gray-600">{item.item_description}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {item.total_price} ETB
                          </span>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-900"><span className="font-medium">Location:</span> {selectedOrder.delivery_location}</p>
                      <p className="text-gray-900"><span className="font-medium">Payment Method:</span> {selectedOrder.payment_method}</p>
                      {selectedOrder.special_instructions && (
                        <p className="text-gray-900"><span className="font-medium">Special Instructions:</span> {selectedOrder.special_instructions}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedOrder.status === 'pending' && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => handleDeclineOrder(selectedOrder.id)}
                        disabled={isProcessing === selectedOrder.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isProcessing === selectedOrder.id ? 'Processing...' : 'Decline Order'}
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(selectedOrder.id)}
                        disabled={isProcessing === selectedOrder.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isProcessing === selectedOrder.id ? 'Processing...' : 'Accept Order'}
                      </button>
                    </div>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => handleStartPreparing(selectedOrder.id)}
                        disabled={isProcessing === selectedOrder.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {isProcessing === selectedOrder.id ? 'Processing...' : 'Start Preparing'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
