'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [orderData, setOrderData] = useState({
    pickupTime: '',
    specialInstructions: '',
    paymentMethod: 'cash',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const deliveryFee = 2.99;
  const tax = getCartTotal() * 0.08;
  const total = getCartTotal() + deliveryFee + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate order ID
    const orderId = `ORD-${Date.now()}`;
    
    // Clear cart and redirect to success page
    clearCart();
    router.push(`/order-success?id=${orderId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setOrderData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Generate pickup time options (next 2 hours in 15-minute intervals)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60000); // Start 30 minutes from now
    
    for (let i = 0; i < 8; i++) {
      const time = new Date(startTime.getTime() + i * 15 * 60000);
      const timeString = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      times.push({
        value: time.toISOString(),
        label: timeString
      });
    }
    
    return times;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out</p>
          <Link href="/menu" className="btn-primary">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <Link href="/cart" className="text-[#ff6b35] hover:text-[#e55a2b] font-medium">
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-gray-50"
                  />
                </div>
                {user?.studentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      type="text"
                      value={user.studentId}
                      disabled
                      className="input-field bg-gray-50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Pickup Time
                  </label>
                  <select
                    id="pickupTime"
                    name="pickupTime"
                    value={orderData.pickupTime}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select pickup time</option>
                    {generatePickupTimes().map((time) => (
                      <option key={time.value} value={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={orderData.specialInstructions}
                    onChange={handleChange}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Any special requests or dietary requirements?"
                  />
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={orderData.paymentMethod}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="cash">Cash on Pickup</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="digital">Digital Wallet</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-primary w-full flex justify-center items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Items Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.uniqueId} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{item.image}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold text-[#ff6b35]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Information */}
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Pickup Information</h3>
              <div className="text-sm text-orange-700 space-y-2">
                <p><strong>Location:</strong> Main Canteen, Ground Floor</p>
                <p><strong>Hours:</strong> Monday-Friday 7:00 AM - 8:00 PM</p>
                <p><strong>Note:</strong> Please bring your order confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
