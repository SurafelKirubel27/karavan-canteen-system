'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import KaravanLogo from '@/components/KaravanLogo';

export default function CanteenDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [menuItems, setMenuItems] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [additionalStats, setAdditionalStats] = useState({
    totalRevenue: 0,
    weekRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0
  });

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/canteen/login');
    } else if (user.role !== 'canteen' && user.role !== 'admin') {
      router.push('/welcome');
    }
  }, [user, router]);

  // Load dashboard data
  useEffect(() => {
    if (user && (user.role === 'canteen' || user.role === 'admin')) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load all orders for statistics
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('*');

      if (allOrdersError) throw allOrdersError;

      // Load recent orders with user info
      const { data: recentOrders, error: recentOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          users(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentOrdersError) throw recentOrdersError;

      // Load menu items count
      const { data: menuItemsData, error: menuError } = await supabase
        .from('menu_items')
        .select('id');

      if (menuError) throw menuError;

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Active orders (pending, confirmed, preparing, ready)
      const activeOrdersCount = allOrders?.filter(order =>
        ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
      ).length || 0;

      // Pending orders (pending, confirmed)
      const pendingOrdersCount = allOrders?.filter(order =>
        ['pending', 'confirmed'].includes(order.status)
      ).length || 0;

      // Today's revenue (delivered orders only)
      const todayOrders = allOrders?.filter(order =>
        order.status === 'delivered' &&
        new Date(order.created_at) >= today
      ) || [];

      const todayRevenueAmount = todayOrders.reduce((sum, order) =>
        sum + parseFloat(order.total_amount || 0), 0
      );

      // Total revenue (all delivered orders)
      const totalRevenueAmount = allOrders?.filter(order =>
        order.status === 'delivered'
      ).reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

      // This week's revenue
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekRevenueAmount = allOrders?.filter(order =>
        order.status === 'delivered' &&
        new Date(order.created_at) >= weekAgo
      ).reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;

      // Update state
      setActiveOrders(activeOrdersCount);
      setPendingOrders(pendingOrdersCount);
      setTodayRevenue(todayRevenueAmount);
      setMenuItems(menuItemsData?.length || 0);

      // Format recent activity
      const activity = recentOrders?.map(order => ({
        id: order.id,
        type: 'order',
        message: `New order ${order.order_number} from ${order.users?.name || 'Unknown'}`,
        time: new Date(order.created_at).toLocaleString(),
        status: order.status,
        amount: order.total_amount
      })) || [];

      setRecentActivity(activity);

      // Store additional stats for display
      setAdditionalStats({
        totalRevenue: totalRevenueAmount,
        weekRevenue: weekRevenueAmount,
        totalOrders: allOrders?.length || 0,
        deliveredOrders: allOrders?.filter(order => order.status === 'delivered').length || 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionText = (status: string) => {
    switch (status) {
      case 'pending': return 'placed an order';
      case 'confirmed': return 'order confirmed';
      case 'preparing': return 'order being prepared';
      case 'ready': return 'order ready';
      case 'delivered': return 'order delivered';
      case 'cancelled': return 'order cancelled';
      default: return 'updated order';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };



  const quickStats = [
    {
      label: 'Active Orders',
      value: activeOrders,
      icon: '🍽️',
      color: 'bg-blue-500',
      change: `${activeOrders} orders in progress`
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-500',
      change: `${pendingOrders} awaiting confirmation`
    },
    {
      label: 'Today\'s Revenue',
      value: `${todayRevenue.toFixed(2)} ETB`,
      icon: '💰',
      color: 'bg-emerald-500',
      change: `From ${additionalStats.deliveredOrders} delivered orders`
    },
    {
      label: 'Menu Items',
      value: menuItems,
      icon: '📋',
      color: 'bg-purple-500',
      change: `${menuItems} items available`
    },
  ];

  const revenueStats = [
    {
      label: 'Total Revenue',
      value: `${additionalStats.totalRevenue.toFixed(2)} ETB`,
      icon: '💎',
      color: 'bg-indigo-500',
      change: `From ${additionalStats.totalOrders} total orders`
    },
    {
      label: 'This Week',
      value: `${additionalStats.weekRevenue.toFixed(2)} ETB`,
      icon: '📈',
      color: 'bg-green-500',
      change: 'Last 7 days earnings'
    }
  ];

  // Show loading state while checking authentication
  if (!user || loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            <KaravanLogo size="md" />
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5H2.5" />
                  </svg>
                </button>
                {pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingOrders}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-700 font-medium text-sm">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CS'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Canteen Staff'}</p>
                  <p className="text-xs text-gray-500">Sandford School</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Navigation</h2>
              
              <nav className="space-y-2">
                <Link href="/canteen/dashboard" className="flex items-center space-x-3 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <Link href="/canteen/orders/incoming" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Incoming Orders</span>
                  {pendingOrders > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                      {pendingOrders}
                    </span>
                  )}
                </Link>

                <Link href="/canteen/orders/ongoing" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 00-2-2z" />
                  </svg>
                  <span>Ongoing Orders</span>
                </Link>

                <Link href="/canteen/menu" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Menu Management</span>
                </Link>

                <Link href="/canteen/reports" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Reports</span>
                </Link>

                <Link href="/canteen/settings" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => window.location.href = '/welcome'}
                  className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors w-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2 text-white">Welcome to Karavan Canteen Dashboard</h1>
              <p className="text-white opacity-90">Manage orders, menu items, and track your daily operations</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-xl`}>
                      <span className="text-white font-bold">{stat.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                  <p className="text-xs text-emerald-700 font-medium">{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Revenue Analytics</h2>
                <button
                  onClick={loadDashboardData}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Refresh Data
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {revenueStats.map((stat, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 ${stat.color} rounded-xl flex items-center justify-center text-2xl`}>
                        <span className="text-white">{stat.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-lg font-medium text-gray-700">{stat.label}</p>
                        <p className="text-sm text-gray-500">{stat.change}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <Link href="/canteen/orders/incoming" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    View All Orders →
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          activity.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {activity.status === 'pending' ? '⏳' : 
                           activity.status === 'completed' ? '✅' : '👨‍🍳'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-800">Order {activity.id} • {activity.teacher}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-700">{activity.time}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/canteen/orders/incoming" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review New Orders</h3>
                <p className="text-gray-600 text-sm">Accept or decline incoming orders from teachers</p>
              </Link>

              <Link href="/canteen/menu" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Menu</h3>
                <p className="text-gray-600 text-sm">Add, edit, or remove menu items and categories</p>
              </Link>

              <Link href="/canteen/reports" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Reports</h3>
                <p className="text-gray-600 text-sm">Download daily, weekly, or monthly reports</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
