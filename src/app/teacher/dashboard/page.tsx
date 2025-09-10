'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import KaravanLogo from '@/components/KaravanLogo';
import { supabase, MenuItem } from '@/lib/supabase';

// Using MenuItem interface from supabase.ts

// Real menu data will be loaded from Supabase

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const { addToCart, cartItems, getCartTotal, getCartItemCount, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/teacher/login');
    } else if (user.role !== 'teacher') {
      router.push('/welcome');
    }
  }, [user, router]);

  // Load menu items from Supabase
  useEffect(() => {
    if (user && user.role === 'teacher') {
      loadMenuItems();
    }
  }, [user]);

  const loadMenuItems = async () => {
    try {
      console.log('Loading menu items from database...');
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Loaded menu items:', data);
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, menuItems]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category || 'Food',
      image: item.image_url || '🍽️',
      description: item.description,
    });
  };

  const handleQuantityChange = (uniqueId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(uniqueId);
    } else {
      updateQuantity(uniqueId, newQuantity);
    }
  };

  const renderMenuSection = (title: string, items: MenuItem[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex-1 h-px bg-gray-200 ml-4"></div>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {items.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-72 bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="text-center mb-3">
                <span className="text-4xl">{item.image_url || '🍽️'}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description || 'Delicious food item'}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-emerald-700">{item.price} ETB</span>
                <span className="text-xs text-gray-500">⏱️ {item.prep_time}min</span>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                className="w-full bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
              >
                Add to Basket
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/teacher/dashboard">
              <KaravanLogo size="md" />
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/teacher/dashboard" className="text-gray-700 hover:text-emerald-700 font-medium">Home Page</Link>
              <Link href="/teacher/orders/recent" className="text-gray-700 hover:text-emerald-700 font-medium">Recent Orders</Link>
              <Link href="/teacher/orders/ongoing" className="text-gray-700 hover:text-emerald-700 font-medium">On-Going Orders</Link>
              
              {/* Cart Button */}
              <button 
                onClick={() => setShowCart(true)}
                className="relative bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
              >
                🛒 My Basket
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>

              {/* Profile Link */}
              <Link href="/teacher/profile" className="flex items-center space-x-2 text-gray-700 hover:text-emerald-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm">Hi, {user?.name?.split(' ')[0] || 'User'}</span>
              </Link>

              <button
                onClick={async () => {
                  await signOut();
                  router.push('/welcome');
                }}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Sign-Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Content - Menu */}
          <div className="lg:col-span-3">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl overflow-hidden mb-8">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }}></div>
              </div>
              
              <div className="relative px-8 py-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Get food from your own canteen delivered to your desired location!
                </h1>
                <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
                  Choose your items and specify your campus location for delivery
                </p>
              </div>
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Results for &quot;{searchTerm}&quot;</h2>
                {filteredItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="text-center mb-3">
                          <span className="text-3xl">{item.image_url}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-emerald-700">{item.price} ETB</span>
                          <span className="text-xs text-gray-500">⏱️ {item.prep_time}min</span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
                        >
                          Add to Basket
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No items found matching your search.</p>
                )}
              </div>
            )}

            {/* Menu Sections */}
            {!searchTerm && !loading && (
              <div className="space-y-8">
                {/* Debug info */}
                {menuItems.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      Loaded {menuItems.length} menu items. Categories: {[...new Set(menuItems.map(item => item.category))].join(', ')}
                    </p>
                  </div>
                )}

                {renderMenuSection('Breakfast', menuItems.filter(item => item.category === 'Breakfast'))}
                {renderMenuSection('Lunch', menuItems.filter(item => item.category === 'Lunch'))}
                {renderMenuSection('Dinner', menuItems.filter(item => item.category === 'Dinner'))}
                {renderMenuSection('Drinks', menuItems.filter(item => item.category === 'Drinks'))}
                {renderMenuSection('Snacks', menuItems.filter(item => item.category === 'Snacks'))}

                {/* Fallback: Show all items if none match categories */}
                {menuItems.length > 0 &&
                 menuItems.filter(item => ['Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Snacks'].includes(item.category)).length === 0 && (
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">All Menu Items</h2>
                      <div className="flex-1 h-px bg-gray-200 ml-4"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menuItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                          <div className="text-center mb-3">
                            <span className="text-3xl">{item.image_url}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-bold text-emerald-700">{item.price} ETB</span>
                            <span className="text-xs text-gray-700">⏱️ {item.prep_time}min</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
                          >
                            Add to Basket
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No items message */}
                {menuItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No menu items available</h3>
                    <p className="text-gray-600">Please check back later or contact the canteen staff.</p>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading menu items...</div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Sticky Basket */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                {/* Basket Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900">My Basket</h3>
                  </div>
                </div>

                {/* Basket Content */}
                <div className="p-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Your basket is empty!</h4>
                      <p className="text-sm text-gray-600">Add items to your basket to order</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.uniqueId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                          <span className="text-lg">{item.image}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center space-x-1">
                                <button 
                                  onClick={() => handleQuantityChange(item.uniqueId, item.quantity - 1)}
                                  className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700"
                                >
                                  -
                                </button>
                                <span className="text-xs font-medium w-6 text-center text-gray-900">{item.quantity}</span>
                                <button 
                                  onClick={() => handleQuantityChange(item.uniqueId, item.quantity + 1)}
                                  className="w-5 h-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs font-bold"
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
                  )}
                </div>

                {/* Basket Footer */}
                {cartItems.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-emerald-600">{getCartTotal()} ETB</span>
                    </div>
                    <Link 
                      href="/teacher/checkout"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block"
                    >
                      Checkout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="bg-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting your favorite food delivered to your campus location is simple and fast
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a Meal</h3>
              <p className="text-gray-600">
                Browse our delicious menu and choose your favorite items from breakfast, lunch, dinner, drinks, and snacks.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Place Order</h3>
              <p className="text-gray-600">
                Add items to your basket, specify your campus location, and complete your order with your preferred payment method.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Food Delivered</h3>
              <p className="text-gray-600">
                Your order will be confirmed and prepared fresh. We&apos;ll deliver it directly to your specified campus location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Karavan */}
            <div>
              <KaravanLogo size="md" className="mb-4" />
              <p className="text-gray-600 text-sm">
                Campus food delivery service designed specifically for teachers. Get delicious meals delivered right to your location.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/teacher/dashboard" className="hover:text-emerald-700 transition-colors">Browse Menu</Link></li>
                <li><Link href="/teacher/orders/ongoing" className="hover:text-emerald-700 transition-colors">Track Orders</Link></li>
                <li><Link href="/teacher/orders/recent" className="hover:text-emerald-700 transition-colors">Order History</Link></li>
                <li><Link href="/teacher/profile" className="hover:text-emerald-700 transition-colors">My Profile</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+251 911 234 567</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>✉️</span>
                  <span>support@karavan.edu</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Sandford School</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>🕒</span>
                  <span>Mon-Fri: 7AM-6PM</span>
                </li>
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Help & Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-emerald-700 transition-colors">How to Order</a></li>
                <li><a href="#" className="hover:text-emerald-700 transition-colors">Delivery Info</a></li>
                <li><a href="#" className="hover:text-emerald-700 transition-colors">Payment Methods</a></li>
                <li><a href="#" className="hover:text-emerald-700 transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Karavan Campus Food Delivery. Designed for Teachers
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50" onClick={() => setShowCart(false)}></div>
          <div className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">My Basket</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your basket is empty!</h3>
                    <p className="text-sm text-gray-600">Add items to your basket to order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.uniqueId} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.price} ETB each</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.uniqueId, item.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700"
                              >
                                -
                              </button>
                              <span className="text-sm font-medium w-8 text-center text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.uniqueId, item.quantity + 1)}
                                className="w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-sm font-bold"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-semibold text-emerald-600">
                              {(item.price * item.quantity)} ETB
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-emerald-600">{getCartTotal()} ETB</span>
                  </div>
                  <Link
                    href="/teacher/checkout"
                    onClick={() => setShowCart(false)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                  >
                    Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
