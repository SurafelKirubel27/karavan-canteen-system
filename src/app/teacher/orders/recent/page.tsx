'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import KaravanLogo from '@/components/KaravanLogo';

interface RecentOrder {
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
  delivered_at?: string;
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

export default function RecentOrdersPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/teacher/login');
    } else if (user.role !== 'teacher') {
      router.push('/welcome');
    }
  }, [user, router]);

  // Load user's order history
  useEffect(() => {
    if (user && user.role === 'teacher') {
      loadRecentOrders();
    }
  }, [user]);

  const loadRecentOrders = async () => {
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
        .in('status', ['delivered', 'cancelled'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleReorder = (order: RecentOrder) => {
    // Navigate to menu page with items pre-selected
    router.push('/teacher/dashboard');
    alert(`Redirecting to menu to reorder items from ${order.order_number}...`);
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
              <span className="text-emerald-700 font-medium">Recent Orders</span>
              <Link href="/teacher/orders/ongoing" className="text-gray-700 hover:text-emerald-700">Ongoing Orders</Link>
              <span className="text-gray-700">Hi, {user?.name?.split(' ')[0]}</span>
              <button onClick={logout} className="text-gray-700 hover:text-red-600">Sign Out</button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Recent Orders</h1>
          <p className="text-gray-600">View your order history and reorder your favorites</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your order history...</p>
          </div>
        ) : orders.length > 0 ? (
          /* Orders Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                    <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}</p>
                    {order.delivered_at && (
                      <p className="text-xs text-gray-700">Delivered: {new Date(order.delivered_at).toLocaleString()}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{order.total_amount} ETB</p>
                  <p className="text-xs text-gray-700">Service fee: {order.service_fee} ETB</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
                <div className="space-y-2 mb-4">
                  {order.order_items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">{item.item_image_url || '🍽️'}</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-900">{item.item_name}</span>
                        <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                        {item.item_description && (
                          <p className="text-xs text-gray-400">{item.item_description}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.total_price} ETB
                      </span>
                    </div>
                  )) || []}
                  {(order.order_items?.length || 0) > 3 && (
                    <p className="text-xs text-gray-500">+{(order.order_items?.length || 0) - 3} more items</p>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Delivered to:</span> {order.delivery_location}
                  </p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Payment:</span> {order.payment_method}
                  </p>
                  {order.special_instructions && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Instructions:</span> {order.special_instructions}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Order
                  </button>
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      Order Again
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recent orders</h3>
            <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet</p>
            <Link href="/teacher/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
              Browse Menu
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/teacher/dashboard"
              className="flex items-center justify-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🍽️</div>
                <span className="text-sm font-medium text-emerald-700">Order Food</span>
              </div>
            </Link>
            
            <Link 
              href="/teacher/orders/ongoing"
              className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🚚</div>
                <span className="text-sm font-medium text-blue-700">Track Orders</span>
              </div>
            </Link>
            
            <Link 
              href="/teacher/profile"
              className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </div>
            </Link>
          </div>
        </div>
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
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Order ID:</span> #{selectedOrder.id}</p>
                      <p><span className="font-medium">Date:</span> {selectedOrder.date} at {selectedOrder.time}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </p>
                      <p><span className="font-medium">Delivery Location:</span> {selectedOrder.deliveryLocation}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Items Ordered</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{item.image}</span>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {(item.price * item.quantity)} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {selectedOrder.total} ETB
                      </span>
                    </div>
                  </div>

                  {selectedOrder.status === 'completed' && (
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Order Again
                    </button>
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
