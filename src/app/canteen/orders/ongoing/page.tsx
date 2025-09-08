'use client';

import Link from 'next/link';
import { useState } from 'react';
import KaravanLogo from '@/components/KaravanLogo';

interface OngoingOrder {
  id: string;
  orderNumber: string;
  teacher: {
    name: string;
    phone: string;
    department: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  deliveryLocation: string;
  specialInstructions?: string;
  acceptedAt: string;
  status: 'preparing' | 'ready' | 'delivering';
  estimatedDelivery: string;
}

// Mock ongoing orders data
const mockOngoingOrders: OngoingOrder[] = [
  {
    id: 'KRV-2024-004',
    orderNumber: 'KRV-2024-004',
    teacher: {
      name: 'Emily Davis',
      phone: '+251 911 567 890',
      department: 'History'
    },
    items: [
      { name: 'Pasta', quantity: 1, price: 300, image: '🍝' },
      { name: 'Garlic Bread', quantity: 2, price: 120, image: '🍞' }
    ],
    total: 540,
    deliveryLocation: 'History Department - Room 150',
    acceptedAt: '1:45 PM',
    status: 'preparing',
    estimatedDelivery: '2:15 PM'
  },
  {
    id: 'KRV-2024-005',
    orderNumber: 'KRV-2024-005',
    teacher: {
      name: 'David Brown',
      phone: '+251 911 678 901',
      department: 'Physical Education'
    },
    items: [
      { name: 'Grilled Chicken', quantity: 2, price: 320, image: '🍗' },
      { name: 'Rice', quantity: 1, price: 150, image: '🍚' },
      { name: 'Water', quantity: 3, price: 50, image: '💧' }
    ],
    total: 940,
    deliveryLocation: 'Sports Complex - Gym Office',
    specialInstructions: 'Please deliver to the main gym entrance',
    acceptedAt: '1:30 PM',
    status: 'ready',
    estimatedDelivery: '2:00 PM'
  },
  {
    id: 'KRV-2024-006',
    orderNumber: 'KRV-2024-006',
    teacher: {
      name: 'Lisa Anderson',
      phone: '+251 911 789 012',
      department: 'Art'
    },
    items: [
      { name: 'Sandwich', quantity: 1, price: 250, image: '🥪' },
      { name: 'Coffee', quantity: 1, price: 80, image: '☕' }
    ],
    total: 330,
    deliveryLocation: 'Art Building - Studio 2',
    acceptedAt: '1:15 PM',
    status: 'delivering',
    estimatedDelivery: '1:45 PM'
  }
];

export default function CanteenOngoingOrdersPage() {
  const [orders, setOrders] = useState<OngoingOrder[]>(mockOngoingOrders);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

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

  const handleStatusUpdate = async (orderId: string, newStatus: 'preparing' | 'ready' | 'delivering') => {
    setIsUpdating(orderId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    setIsUpdating(null);
  };

  const handleCompleteOrder = async (orderId: string) => {
    setIsUpdating(orderId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove from ongoing orders (would move to completed orders in real app)
    setOrders(prev => prev.filter(order => order.id !== orderId));
    setIsUpdating(null);
    
    alert('Order marked as completed!');
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'preparing': return 'ready';
      case 'ready': return 'delivering';
      case 'delivering': return 'completed';
      default: return 'preparing';
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'preparing': return 'Mark Ready';
      case 'ready': return 'Start Delivery';
      case 'delivering': return 'Complete Order';
      default: return 'Update Status';
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
                onClick={() => window.location.href = '/welcome'}
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

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">Accepted at {order.acceptedAt}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{order.total} ETB</p>
                        <p className="text-sm text-gray-600">Est. delivery: {order.estimatedDelivery}</p>
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
                        {order.status !== 'delivering' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status) as 'preparing' | 'ready' | 'delivering' | 'completed')}
                            disabled={isUpdating === order.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isUpdating === order.id ? 'Updating...' : getNextStatusText(order.status)}
                          </button>
                        )}
                        
                        {order.status === 'delivering' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            disabled={isUpdating === order.id}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isUpdating === order.id ? 'Completing...' : 'Complete Order'}
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
                        <p className="text-sm text-gray-900"><span className="font-medium">Name:</span> {order.teacher.name}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Department:</span> {order.teacher.department}</p>
                        <p className="text-sm text-gray-900"><span className="font-medium">Phone:</span> {order.teacher.phone}</p>
                        <button className="mt-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                          📞 Call Teacher
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Items to Prepare</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{item.image}</span>
                              <div>
                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {(item.price * item.quantity)} ETB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Delivery Details</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Location:</span><br />
                          {order.deliveryLocation}
                        </p>
                        {order.specialInstructions && (
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">Special Instructions:</span><br />
                            {order.specialInstructions}
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
