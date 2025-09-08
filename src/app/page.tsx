'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
                <h1 className="text-2xl font-bold text-white">🍽️ Canteen Management</h1>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/menu" className="text-white/90 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105">
                Menu
              </Link>
              <Link href="/categories" className="text-white/90 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105">
                Categories
              </Link>
              {isAuthenticated && (
                <Link href="/orders" className="text-white/90 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105">
                  My Orders
                </Link>
              )}
              <Link href="/cart" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-orange-700 hover:scale-105 relative">
                🛒 Cart
                {getCartItemCount() > 0 && (
                  <span className="cart-badge">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/30">
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105">
                      👤 {user?.name}
                    </Link>
                    <button 
                      onClick={logout}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105">
                      Login
                    </Link>
                    <Link href="/signup" className="bg-white text-[#ff6b35] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/10 backdrop-blur-sm rounded-lg mt-2 p-4 animate-slideDown">
              <div className="flex flex-col space-y-2">
                <Link href="/menu" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium">
                  Menu
                </Link>
                <Link href="/categories" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium">
                  Categories
                </Link>
                {isAuthenticated && (
                  <Link href="/orders" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium">
                    My Orders
                  </Link>
                )}
                <Link href="/cart" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium">
                  🛒 Cart ({getCartItemCount()})
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium">
                      👤 Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium">
                      Login
                    </Link>
                    <Link href="/signup" className="text-white/90 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-medium">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#ff6b35] to-[#e55a2b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Welcome to Our Canteen
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto animate-fade-in-up animate-delay-200">
              Delicious meals, quick service, and convenient ordering. 
              Order ahead and skip the queue!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-400">
              <Link href="/menu" className="bg-white text-[#ff6b35] px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors text-center">
                Browse Menu 🍽️
              </Link>
              <Link href="/categories" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#ff6b35] transition-colors text-center">
                View Categories 📋
              </Link>
              {!isAuthenticated && (
                <Link href="/signup" className="bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors text-center">
                  Join Now 🚀
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Why Choose Our Canteen?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
              Experience the convenience of modern canteen management with quality food and efficient service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow animate-fade-in-up animate-delay-300">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Ordering</h3>
              <p className="text-gray-600">
                Order ahead and skip the queue. Get your food ready when you arrive.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow animate-fade-in-up animate-delay-400">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh & Quality</h3>
              <p className="text-gray-600">
                Fresh ingredients prepared daily with high quality standards and hygiene.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow animate-fade-in-up animate-delay-500">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Payment</h3>
              <p className="text-gray-600">
                Multiple payment options including cash, card, and digital wallets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-8 animate-fade-in-up">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="animate-fade-in-up animate-delay-200">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-orange-100">Daily Orders</div>
              </div>
              <div className="animate-fade-in-up animate-delay-300">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-orange-100">Menu Items</div>
              </div>
              <div className="animate-fade-in-up animate-delay-400">
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-orange-100">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in-up">Ready to Order?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up animate-delay-200">
            Browse our delicious menu and place your order now. Fresh food, fast service!
          </p>
          <Link href="/menu" className="bg-[#ff6b35] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#e55a2b] transition-colors inline-block animate-fade-in-up animate-delay-400">
            Start Ordering
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">🍽️ Canteen Management</h3>
              <p className="text-gray-400">
                Your trusted partner for delicious meals and efficient service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/menu?category=main" className="hover:text-white transition-colors">Main Courses</Link></li>
                <li><Link href="/menu?category=snacks" className="hover:text-white transition-colors">Snacks</Link></li>
                <li><Link href="/menu?category=beverages" className="hover:text-white transition-colors">Beverages</Link></li>
                <li><Link href="/menu?category=desserts" className="hover:text-white transition-colors">Desserts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Monday - Friday: 7:00 AM - 8:00 PM</li>
                <li>Saturday: 8:00 AM - 6:00 PM</li>
                <li>Sunday: 9:00 AM - 5:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Canteen Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
