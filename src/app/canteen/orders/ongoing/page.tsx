'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import KaravanLogo from '@/components/KaravanLogo';

interface OngoingOrder {
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

export default function CanteenOngoingOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OngoingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/canteen/login');
    } else if (user.role !== 'canteen' && user.role !== 'admin') {
      router.push('/welcome');
    }
  }, [user, router]);

  // Load ongoing orders from database
  useEffect(() => {
    if (user && (user.role === 'canteen' || user.role === 'admin')) {
      loadOngoingOrders();
    }
  }, [user]);

  const loadOngoingOrders = async () => {
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
        .in('status', ['preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading ongoing orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'ready' })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: 'ready' } : order
      ));

      alert('Order marked as ready for delivery!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Remove from ongoing orders
      setOrders(prev => prev.filter(order => order.id !== orderId));

      alert('Order marked as delivered!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'preparing':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: '👨‍🍳',
          text: 'Preparing'
        };
      case 'ready':
        return {
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          icon: '✅',
          text: 'Ready for Delivery'
        };
      case 'delivering':
        return {
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          icon: '🚚',
          text: 'Out for Delivery'
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: '❓',
          text: 'Unknown'
        };
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
              <Link href="/canteen/orders/incoming" className="text-gray-700 hover:text-emerald-700">Incoming Orders</Link>
              <span className="text-emerald-700 font-medium">Ongoing Orders</span>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ongoing Orders</h1>
            <p className="text-gray-600">Track and update order status for active orders</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
            <span className="text-sm text-gray-600">Active Orders: </span>
            <span className="font-bold text-emerald-600">{orders.length}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ongoing orders...</p>
          </div>
        ) : (
          /* Orders List */
          orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">Created at {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{order.total_amount} ETB</p>
                        {order.estimated_ready_time && (
                          <p className="text-sm text-gray-600">Est. ready: {new Date(order.estimated_ready_time).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color} flex items-center space-x-1`}>
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.text}</span>
                      </span>
                      
                      {/* Action Button */}
                      <div className="flex space-x-2">
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleMarkReady(order.id)}
                            disabled={isUpdating === order.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isUpdating === order.id ? 'Updating...' : 'Mark Ready'}
                          </button>
                        )}

                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            disabled={isUpdating === order.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isUpdating === order.id ? 'Completing...' : 'Mark Delivered'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    {/* Teacher Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Teacher Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-900"><span className="font-medium">Name:</span> {order.users?.name}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Email:</span> {order.users?.email}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Phone:</span> {order.users?.phone || 'N/A'}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Department:</span> {order.users?.department || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Items to Prepare</h4>
                      <div className="space-y-2">
                        {order.order_items?.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{item.item_image_url || '🍽️'}</span>
                              <div>
                                <span className="text-sm font-medium text-gray-900">{item.item_name}</span>
                                <p className="text-xs text-gray-600">{item.item_description}</p>
                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {item.total_price} ETB
                            </span>
                          </div>
                        )) || []}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Delivery Details</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Location:</span><br />
                          {order.delivery_location}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Payment Method:</span> {order.payment_method}
                        </p>
                        {order.special_instructions && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Special Instructions:</span><br />
                            {order.special_instructions}
                          </p>
                        )}
                        <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          🗺️ View Location
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="px-6 pb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Order Progress</h4>
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 ${order.status === 'preparing' || order.status === 'ready' || order.status === 'delivering' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-3 h-3 bg-current rounded-full"></div>
                        <span className="text-sm font-medium">Preparing</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className={`flex items-center space-x-2 ${order.status === 'ready' || order.status === 'delivering' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-3 h-3 bg-current rounded-full"></div>
                        <span className="text-sm font-medium">Ready</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className={`flex items-center space-x-2 ${order.status === 'delivering' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-3 h-3 bg-current rounded-full"></div>
                        <span className="text-sm font-medium">Delivering</span>
                      </div>
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <div className="w-3 h-3 bg-current rounded-full"></div>
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No ongoing orders</h3>
              <p className="text-gray-600 mb-6">All orders have been completed</p>
              <Link href="/canteen/orders/incoming" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                Check Incoming Orders
              </Link>
            </div>
          )
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/canteen/orders/incoming"
              className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⏳</div>
                <span className="text-sm font-medium text-yellow-700">Review New Orders</span>
              </div>
            </Link>
            
            <Link 
              href="/canteen/menu"
              className="flex items-center justify-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <span className="text-sm font-medium text-emerald-700">Manage Menu</span>
              </div>
            </Link>
            
            <Link 
              href="/canteen/dashboard"
              className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <span className="text-sm font-medium text-blue-700">View Dashboard</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
