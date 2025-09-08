'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import KaravanLogo from '@/components/KaravanLogo';

export default function TeacherCheckoutPage() {
  const { cartItems, getCartTotal, clearCart, updateCartItemQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [orderData, setOrderData] = useState({
    deliveryLocation: '',
    specialInstructions: '',
    paymentMethod: 'cash'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  const serviceFee = 25; // 25 ETB service fee
  const total = getCartTotal() + serviceFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (uniqueId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(uniqueId);
    } else {
      updateCartItemQuantity(uniqueId, newQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate order ID
      const orderId = `KRV-${Date.now()}`;
      
      // Clear cart
      clearCart();
      
      // Redirect to success page
      router.push(`/teacher/order-success?id=${orderId}&location=${encodeURIComponent(orderData.deliveryLocation)}`);
    } catch (error) {
      console.error('Order processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your basket is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your basket before checking out</p>
          <Link href="/teacher/dashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

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
              <span className="text-emerald-700 font-medium">Checkout</span>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
              <p className="text-gray-600">Complete your order and get food delivered to your location</p>
            </div>

            {/* Delivery Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Delivery Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Where are you on campus? *
                  </label>
                  <input
                    id="deliveryLocation"
                    name="deliveryLocation"
                    type="text"
                    value={orderData.deliveryLocation}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Science Building Room 205, Library 2nd Floor, Main Office..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Please be specific so we can find you easily</p>
                </div>

                <div>
                  <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={orderData.specialInstructions}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-gray-900 placeholder-gray-500"
                    placeholder="Any special requests or dietary requirements?"
                  />
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={orderData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="digital">Digital Wallet</option>
                    <option value="school_account">School Account</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors flex justify-center items-center shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    `Place Order - ${total} ETB`
                  )}
                </button>
              </form>
            </div>

            {/* Teacher Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 Your Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium text-gray-900">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{user?.email || 'N/A'}</p>
                </div>
                {user?.department && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Department:</span>
                    <p className="font-medium text-gray-900">{user.department}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modern Cart Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-8">
              {/* Cart Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">🛒 My Basket</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full">
                    {cartItems.length} items
                  </span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.uniqueId} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-xl">{item.image}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{item.price} ETB each</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleQuantityChange(item.uniqueId, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-8 text-center text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.uniqueId, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs font-medium"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600">
                            {(item.price * item.quantity)} ETB
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{getCartTotal()} ETB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium text-gray-900">{serviceFee} ETB</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-emerald-600">
                        {total} ETB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xs text-emerald-700 space-y-1">
                    <p><strong>Estimated Time:</strong> 15-25 minutes</p>
                    <p><strong>Delivery:</strong> To your campus location</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
