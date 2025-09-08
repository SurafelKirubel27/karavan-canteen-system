'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KaravanLogo from '@/components/KaravanLogo';

interface RecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  status: 'completed' | 'cancelled';
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  deliveryLocation: string;
}

// Mock recent orders data with Ethiopian Birr prices
const mockRecentOrders: RecentOrder[] = [
  {
    id: '251027276',
    orderNumber: 'KRV-2024-276',
    date: 'July 02, 2025',
    time: '7:34 pm',
    status: 'cancelled',
    total: 1620,
    items: [
      { name: 'Grilled Chicken', quantity: 2, price: 320, image: '🍗' },
      { name: 'Caesar Salad', quantity: 1, price: 220, image: '🥗' }
    ],
    deliveryLocation: 'Science Lab - Room 205'
  },
  {
    id: '251020913',
    orderNumber: 'KRV-2024-913',
    date: 'June 11, 2025',
    time: '12:33 pm',
    status: 'completed',
    total: 2850,
    items: [
      { name: 'Pizza', quantity: 1, price: 380, image: '🍕' },
      { name: 'Pasta', quantity: 2, price: 300, image: '🍝' },
      { name: 'Coffee', quantity: 3, price: 80, image: '☕' }
    ],
    deliveryLocation: 'Main Building - Room 101'
  },
  {
    id: '251016815',
    orderNumber: 'KRV-2024-815',
    date: 'May 28, 2025',
    time: '12:06 pm',
    status: 'completed',
    total: 2850,
    items: [
      { name: 'Sandwich', quantity: 2, price: 250, image: '🥪' },
      { name: 'Orange Juice', quantity: 2, price: 100, image: '🍊' }
    ],
    deliveryLocation: 'Library - Study Room A'
  },
  {
    id: '251015700',
    orderNumber: 'KRV-2024-700',
    date: 'May 24, 2025',
    time: '1:17 pm',
    status: 'completed',
    total: 2650,
    items: [
      { name: 'Fish & Chips', quantity: 1, price: 350, image: '🐟' },
      { name: 'Iced Tea', quantity: 2, price: 75, image: '🧊' }
    ],
    deliveryLocation: 'Cafeteria - Staff Lounge'
  },
  {
    id: '251011978',
    orderNumber: 'KRV-2024-978',
    date: 'May 10, 2025',
    time: '12:54 pm',
    status: 'completed',
    total: 1620,
    items: [
      { name: 'Pancakes', quantity: 1, price: 180, image: '🥞' },
      { name: 'Scrambled Eggs', quantity: 1, price: 150, image: '🍳' }
    ],
    deliveryLocation: 'Art Building - Studio 3'
  }
];

export default function RecentOrdersPage() {
  const { user, logout } = useAuth();
  const [orders] = useState<RecentOrder[]>(mockRecentOrders);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleReorder = (order: RecentOrder) => {
    // Add items to cart logic would go here
    alert(`Reordering ${order.orderNumber}...`);
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

        {/* Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">#{order.id}</h3>
                    <p className="text-sm text-gray-600">{order.date} {order.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">{order.total} ETB</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
                <div className="space-y-2 mb-4">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">{item.image}</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-900">{item.name}</span>
                        <span className="text-xs text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {(item.price * item.quantity)} ETB
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Delivered to:</span> {order.deliveryLocation}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    View Order
                  </button>
                  {order.status === 'completed' && (
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

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recent orders</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
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
