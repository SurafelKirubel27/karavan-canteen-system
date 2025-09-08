'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    getCartItemCount 
  } = useCart();
  const { isAuthenticated } = useAuth();

  const deliveryFee = 2.99;
  const tax = getCartTotal() * 0.08; // 8% tax
  const total = getCartTotal() + deliveryFee + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <Link href="/menu" className="text-[#ff6b35] hover:text-[#e55a2b] font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items from our menu to get started!</p>
            <Link 
              href="/menu" 
              className="btn-primary inline-block"
            >
              Browse Menu
            </Link>
          </div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600">{getCartItemCount()} items in your cart</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
              <Link href="/menu" className="text-[#ff6b35] hover:text-[#e55a2b] font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.uniqueId} className="p-6 flex items-center space-x-4">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{item.image}</span>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      {item.customizations && item.customizations.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Customizations: {item.customizations.join(', ')}
                        </p>
                      )}
                      <p className="text-lg font-semibold text-[#ff6b35] mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.uniqueId, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.uniqueId)}
                        className="text-red-600 hover:text-red-700 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-4">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-semibold text-[#ff6b35]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="bg-orange-50 rounded-lg p-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600">⏱️</span>
                    <span className="text-sm text-orange-800">
                      Estimated preparation: 15-25 minutes
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                {isAuthenticated ? (
                  <Link 
                    href="/checkout" 
                    className="btn-primary w-full text-center block mt-6"
                  >
                    Proceed to Checkout
                  </Link>
                ) : (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      Please login to place your order
                    </p>
                    <Link 
                      href="/login" 
                      className="btn-primary w-full text-center block"
                    >
                      Login to Checkout
                    </Link>
                    <Link 
                      href="/signup" 
                      className="btn-secondary w-full text-center block"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg shadow-sm border mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                <textarea
                  placeholder="Any special requests or dietary requirements?"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
