'use client';

import Link from 'next/link';
import { useState } from 'react';
import KaravanLogo from '@/components/KaravanLogo';

interface IncomingOrder {
  id: string;
  orderNumber: string;
  teacher: {
    name: string;
    email: string;
    phone: string;
    department: string;
    officeLocation: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
    specialInstructions?: string;
  }>;
  total: number;
  deliveryLocation: string;
  specialInstructions?: string;
  placedAt: string;
  estimatedPrepTime: number;
}

// Mock incoming orders data
const mockIncomingOrders: IncomingOrder[] = [
  {
    id: 'KRV-2024-001',
    orderNumber: 'KRV-2024-001',
    teacher: {
      name: 'John Smith',
      email: 'john.smith@sandfordschool.edu',
      phone: '+251 911 234 567',
      department: 'Mathematics',
      officeLocation: 'Main Building Room 205'
    },
    items: [
      { name: 'Grilled Chicken', quantity: 1, price: 320, image: '🍗' },
      { name: 'Caesar Salad', quantity: 1, price: 220, image: '🥗' },
      { name: 'Coffee', quantity: 2, price: 80, image: '☕' }
    ],
    total: 700,
    deliveryLocation: 'Science Lab - Room 205',
    specialInstructions: 'Please call when you arrive at the building',
    placedAt: '2:30 PM',
    estimatedPrepTime: 15
  },
  {
    id: 'KRV-2024-002',
    orderNumber: 'KRV-2024-002',
    teacher: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@sandfordschool.edu',
      phone: '+251 911 345 678',
      department: 'English',
      officeLocation: 'Arts Building Room 102'
    },
    items: [
      { name: 'Pizza', quantity: 1, price: 380, image: '🍕' },
      { name: 'Orange Juice', quantity: 2, price: 100, image: '🍊' }
    ],
    total: 580,
    deliveryLocation: 'Library - Study Room A',
    placedAt: '2:45 PM',
    estimatedPrepTime: 20
  },
  {
    id: 'KRV-2024-003',
    orderNumber: 'KRV-2024-003',
    teacher: {
      name: 'Mike Wilson',
      email: 'mike.wilson@sandfordschool.edu',
      phone: '+251 911 456 789',
      department: 'Science',
      officeLocation: 'Science Building Room 301'
    },
    items: [
      { name: 'Sandwich', quantity: 2, price: 250, image: '🥪' },
      { name: 'Iced Tea', quantity: 1, price: 75, image: '🧊' }
    ],
    total: 575,
    deliveryLocation: 'Science Building - Room 301',
    specialInstructions: 'No onions in the sandwich please',
    placedAt: '3:00 PM',
    estimatedPrepTime: 10
  }
];

export default function IncomingOrdersPage() {
  const [orders, setOrders] = useState<IncomingOrder[]>(mockIncomingOrders);
  const [selectedOrder, setSelectedOrder] = useState<IncomingOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAcceptOrder = async (orderId: string) => {
    setIsProcessing(orderId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove from incoming orders (would move to ongoing orders in real app)
    setOrders(prev => prev.filter(order => order.id !== orderId));
    setSelectedOrder(null);
    setIsProcessing(null);
    
    alert('Order accepted and moved to ongoing orders!');
  };

  const handleDeclineOrder = async (orderId: string) => {
    setIsProcessing(orderId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove from incoming orders
    setOrders(prev => prev.filter(order => order.id !== orderId));
    setSelectedOrder(null);
    setIsProcessing(null);
    
    alert('Order declined and customer notified.');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Incoming Orders</h1>
            <p className="text-gray-600">Review and accept new orders from teachers</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
            <span className="text-sm text-gray-600">Pending Orders: </span>
            <span className="font-bold text-emerald-600">{orders.length}</span>
          </div>
        </div>

        {/* Orders Grid */}
        {orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-800">Placed at {order.placedAt}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">{order.total} ETB</p>
                    <p className="text-sm text-gray-800">Est. prep: {order.estimatedPrepTime} min</p>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Teacher Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900"><span className="font-medium">Name:</span> {order.teacher.name}</p>
                    <p className="text-gray-900"><span className="font-medium">Department:</span> {order.teacher.department}</p>
                    <p className="text-gray-900"><span className="font-medium">Phone:</span> {order.teacher.phone}</p>
                    <p className="text-gray-900"><span className="font-medium">Office:</span> {order.teacher.officeLocation}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-3">Items Ordered</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{item.image}</span>
                          <span className="text-sm text-gray-900 font-medium">{item.name}</span>
                          <span className="text-xs text-gray-800">x{item.quantity}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {(item.price * item.quantity)} ETB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                  <p className="text-sm text-gray-900 mb-2">
                    <span className="font-medium">Location:</span> {order.deliveryLocation}
                  </p>
                  {order.specialInstructions && (
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                    </p>
                  )}
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
                    <button
                      onClick={() => handleDeclineOrder(order.id)}
                      disabled={isProcessing === order.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isProcessing === order.id ? 'Processing...' : 'Decline'}
                    </button>
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      disabled={isProcessing === order.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isProcessing === order.id ? 'Processing...' : 'Accept'}
                    </button>
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
                      <p><span className="font-medium">Order ID:</span> {selectedOrder.orderNumber}</p>
                      <p><span className="font-medium">Placed at:</span> {selectedOrder.placedAt}</p>
                      <p><span className="font-medium">Estimated prep time:</span> {selectedOrder.estimatedPrepTime} minutes</p>
                      <p><span className="font-medium">Total amount:</span> {selectedOrder.total} ETB</p>
                    </div>
                  </div>

                  {/* Teacher Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Teacher Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedOrder.teacher.name}</p>
                      <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedOrder.teacher.email}</p>
                      <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedOrder.teacher.phone}</p>
                      <p className="text-gray-900"><span className="font-medium">Department:</span> {selectedOrder.teacher.department}</p>
                      <p className="text-gray-900"><span className="font-medium">Office:</span> {selectedOrder.teacher.officeLocation}</p>
                    </div>
                  </div>

                  {/* Items */}
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

                  {/* Delivery Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Delivery Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-gray-900"><span className="font-medium">Location:</span> {selectedOrder.deliveryLocation}</p>
                      {selectedOrder.specialInstructions && (
                        <p className="text-gray-900"><span className="font-medium">Special Instructions:</span> {selectedOrder.specialInstructions}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
