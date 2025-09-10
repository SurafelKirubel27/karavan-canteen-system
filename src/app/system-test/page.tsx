'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SystemTestPage() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  const { cartItems, addToCart, checkout, clearCart } = useCart();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const addTestResult = (test: string, status: 'pass' | 'fail' | 'info', message: string) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Database Connection
    try {
      const { data, error } = await supabase.from('menu_items').select('count').limit(1);
      if (error) throw error;
      addTestResult('Database Connection', 'pass', 'Successfully connected to Supabase');
    } catch (error) {
      addTestResult('Database Connection', 'fail', `Database error: ${error}`);
    }

    // Test 2: Menu Items Loading
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .limit(5);
      
      if (error) throw error;
      setMenuItems(data || []);
      addTestResult('Menu Loading', 'pass', `Loaded ${data?.length || 0} menu items`);
    } catch (error) {
      addTestResult('Menu Loading', 'fail', `Menu loading error: ${error}`);
    }

    // Test 3: Authentication State
    if (isAuthenticated && user) {
      addTestResult('Authentication', 'pass', `User authenticated: ${user.email} (${user.role})`);
    } else {
      addTestResult('Authentication', 'info', 'User not authenticated - this is normal for testing');
    }

    // Test 4: Cart Functionality
    if (menuItems.length > 0) {
      const testItem = menuItems[0];
      addToCart({
        id: testItem.id,
        name: testItem.name,
        price: testItem.price,
        category: testItem.category,
        image: testItem.image_url,
        description: testItem.description
      });
      addTestResult('Cart Add Item', 'pass', `Added ${testItem.name} to cart`);
    }

    // Test 5: Order System (if authenticated)
    if (isAuthenticated && user && cartItems.length > 0) {
      try {
        const result = await checkout('Test Location', 'Test order from system test', user.id);
        if (result.success) {
          addTestResult('Order Placement', 'pass', `Order placed successfully: ${result.orderNumber}`);
        } else {
          addTestResult('Order Placement', 'fail', `Order failed: ${result.error}`);
        }
      } catch (error) {
        addTestResult('Order Placement', 'fail', `Order error: ${error}`);
      }
    } else {
      addTestResult('Order Placement', 'info', 'Skipped - requires authentication and cart items');
    }

    setIsRunning(false);
  };

  const testCanteenLogin = async () => {
    try {
      const result = await signIn('karavanstaff@sandfordschool.edu', 'KaravanStaff123');
      if (result.success) {
        addTestResult('Canteen Login', 'pass', 'Canteen staff login successful');
      } else {
        addTestResult('Canteen Login', 'fail', `Login failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult('Canteen Login', 'fail', `Login error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔧 System Comprehensive Test</h1>
          
          {/* Current Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Current System Status</h2>
            <div className="space-y-1 text-sm">
              <p><strong>Authentication:</strong> {isAuthenticated ? `✅ Logged in as ${user?.email} (${user?.role})` : '❌ Not authenticated'}</p>
              <p><strong>Cart Items:</strong> {cartItems.length} items</p>
              <p><strong>Menu Items Loaded:</strong> {menuItems.length} items</p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={runComprehensiveTests}
                disabled={isRunning}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </button>
              
              <button
                onClick={testCanteenLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
              >
                Test Canteen Login
              </button>

              {isAuthenticated && (
                <button
                  onClick={signOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
                >
                  Logout
                </button>
              )}

              <button
                onClick={clearCart}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">No tests run yet. Click "Run All Tests" to start.</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border-l-4 ${
                      result.status === 'pass'
                        ? 'bg-green-50 border-green-400'
                        : result.status === 'fail'
                        ? 'bg-red-50 border-red-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{result.test}</span>
                        <span className={`ml-2 text-sm ${
                          result.status === 'pass' ? 'text-green-600' : 
                          result.status === 'fail' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {result.status === 'pass' ? '✅ PASS' : 
                           result.status === 'fail' ? '❌ FAIL' : 'ℹ️ INFO'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/login" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">🔐</div>
                <div className="text-sm font-medium">Login</div>
              </Link>
              <Link href="/menu" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">🍽️</div>
                <div className="text-sm font-medium">Menu</div>
              </Link>
              <Link href="/teacher/dashboard" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">👨‍🏫</div>
                <div className="text-sm font-medium">Teacher</div>
              </Link>
              <Link href="/canteen/dashboard" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">🏪</div>
                <div className="text-sm font-medium">Canteen</div>
              </Link>
              <Link href="/teacher/checkout" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">🛒</div>
                <div className="text-sm font-medium">Checkout</div>
              </Link>
              <Link href="/teacher/orders/recent" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-sm font-medium">Orders</div>
              </Link>
              <Link href="/canteen/reports" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium">Reports</div>
              </Link>
              <Link href="/test-auth" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">🧪</div>
                <div className="text-sm font-medium">Auth Test</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
