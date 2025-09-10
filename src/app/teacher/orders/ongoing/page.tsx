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

export default function OngoingOrdersPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OngoingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/teacher/login');
    } else if (user.role !== 'teacher') {
      router.push('/welcome');
    }
  }, [user, router]);

  // Load ongoing orders
  useEffect(() => {
    if (user && user.role === 'teacher') {
      loadOngoingOrders();
    }
  }, [user]);

  const loadOngoingOrders = async () => {
    try {
      const { data, error } = await supabase
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
            item_image_url
          )
        `)
        .eq('user_id', user?.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading ongoing orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    setRefreshing(true);
    await loadOngoingOrders();
    setRefreshing(false);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: '⏳',
          text: 'Order Received'
        };
      case 'confirmed':
        return {
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          icon: '✔️',
          text: 'Order Confirmed'
        };
      case 'preparing':
        return {
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          icon: '👨‍🍳',
          text: 'Being Prepared'
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

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 20;
      case 'confirmed': return 40;
      case 'preparing': return 60;
      case 'ready': return 80;
      case 'delivering': return 100;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/teacher/dashboard">
              <KaravanLogo size="md" />
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link href="/teacher/dashboard" className="text-gray-700 hover:text-emerald-700">Dashboard</Link>
              <Link href="/teacher/orders/recent" className="text-gray-700 hover:text-emerald-700">Recent Orders</Link>
              <span className="text-emerald-700 font-medium">Ongoing Orders</span>
              <span className="text-gray-700">Hi, {user?.name?.split(' ')[0]}</span>
              <button onClick={logout} className="text-gray-700 hover:text-red-600">Sign Out</button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ongoing Orders</h1>
            <p className="text-gray-600">Track your current orders in real-time</p>
          </div>
          <button
            onClick={refreshOrders}
            disabled={refreshing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your ongoing orders...</p>
          </div>
        ) : orders.length > 0 ? (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const progress = getProgressPercentage(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">Placed at {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{order.total_amount} ETB</p>
                        {order.estimated_ready_time && (
                          <p className="text-sm text-gray-600">Est. ready: {new Date(order.estimated_ready_time).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color} flex items-center space-x-1`}>
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.text}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Order Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Delivery Location */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Delivery to:</span> {order.delivery_location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Payment:</span> {order.payment_method}
                      </p>
                      {order.special_instructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Special instructions:</span> {order.special_instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 mb-3">Items in this order</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.order_items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-2xl">{item.item_image_url || '🍽️'}</span>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{item.item_name}</h5>
                            <p className="text-xs text-gray-500">{item.item_description}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} × {item.unit_price} ETB = {item.total_price} ETB
                            </p>
                          </div>
                        </div>
                      )) || []}
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="px-6 pb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Order Timeline</h4>
                    <div className="space-y-2">
                      <div className={`flex items-center space-x-3 ${['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        <span className="text-sm">Order received</span>
                      </div>
                      <div className={`flex items-center space-x-3 ${['confirmed', 'preparing', 'ready', 'delivering'].includes(order.status) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        <span className="text-sm">Order confirmed by canteen</span>
                      </div>
                      <div className={`flex items-center space-x-3 ${['preparing', 'ready', 'delivering'].includes(order.status) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        <span className="text-sm">Kitchen started preparing your food</span>
                      </div>
                      <div className={`flex items-center space-x-3 ${['ready', 'delivering'].includes(order.status) ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        <span className="text-sm">Food is ready for delivery</span>
                      </div>
                      <div className={`flex items-center space-x-3 ${order.status === 'delivering' ? 'text-emerald-600' : 'text-gray-400'}`}>
                        <div className="w-2 h-2 bg-current rounded-full"></div>
                        <span className="text-sm">Out for delivery to your location</span>
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
            <p className="text-gray-600 mb-6">You don&apos;t have any active orders at the moment</p>
            <Link href="/teacher/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
              Order Food Now
            </Link>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600 mb-2">Having issues with your order?</p>
              <p className="text-sm text-emerald-600 font-medium">📞 +251 911 234 567</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
              <p className="text-sm text-gray-600">
                Orders are typically delivered within 15-25 minutes during peak hours.
                You&apos;ll receive a call when your order is ready for delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
