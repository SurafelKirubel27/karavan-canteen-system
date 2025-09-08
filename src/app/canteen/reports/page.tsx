'use client';

import Link from 'next/link';
import { useState } from 'react';
import KaravanLogo from '@/components/KaravanLogo';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const reportData = {
    daily: {
      totalOrders: 45,
      totalRevenue: 12450,
      averageOrderValue: 276,
      topItems: [
        { name: 'Grilled Chicken', orders: 12, revenue: 3840 },
        { name: 'Pizza', orders: 8, revenue: 3040 },
        { name: 'Caesar Salad', orders: 10, revenue: 2200 }
      ]
    },
    weekly: {
      totalOrders: 312,
      totalRevenue: 86240,
      averageOrderValue: 276,
      topItems: [
        { name: 'Grilled Chicken', orders: 84, revenue: 26880 },
        { name: 'Pizza', orders: 56, revenue: 21280 },
        { name: 'Caesar Salad', orders: 72, revenue: 15840 }
      ]
    },
    monthly: {
      totalOrders: 1248,
      totalRevenue: 344320,
      averageOrderValue: 276,
      topItems: [
        { name: 'Grilled Chicken', orders: 336, revenue: 107520 },
        { name: 'Pizza', orders: 224, revenue: 85120 },
        { name: 'Caesar Salad', orders: 288, revenue: 63360 }
      ]
    }
  };

  const currentData = reportData[selectedPeriod as keyof typeof reportData];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    alert(`${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} report generated! (Download functionality will be implemented later)`);
  };

  const reportTypes = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Detailed breakdown of sales, revenue, and order statistics',
      icon: '💰',
      color: 'bg-emerald-500'
    },
    {
      id: 'menu',
      title: 'Menu Performance',
      description: 'Analysis of menu item popularity and performance metrics',
      icon: '📊',
      color: 'bg-blue-500'
    },
    {
      id: 'customer',
      title: 'Customer Analytics',
      description: 'Teacher ordering patterns and customer behavior insights',
      icon: '👥',
      color: 'bg-purple-500'
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels, usage patterns, and inventory recommendations',
      icon: '📦',
      color: 'bg-orange-500'
    }
  ];

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
              <span className="text-emerald-700 font-medium">Reports</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and download detailed reports for your canteen operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Report Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Report Configuration</h2>
              
              <div className="space-y-6">
                {/* Period Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Report Period</label>
                  <div className="space-y-2">
                    {[
                      { value: 'daily', label: 'Daily Report' },
                      { value: 'weekly', label: 'Weekly Report' },
                      { value: 'monthly', label: 'Monthly Report' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="period"
                          value={option.value}
                          checked={selectedPeriod === option.value}
                          onChange={(e) => setSelectedPeriod(e.target.value)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedPeriod === 'daily' ? 'Select Date' : 
                     selectedPeriod === 'weekly' ? 'Week Starting' : 'Select Month'}
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Generate & Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Overview
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800">Total Orders</span>
                  <span className="font-semibold text-gray-900">{currentData.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800">Total Revenue</span>
                  <span className="font-semibold text-emerald-600">{currentData.totalRevenue} ETB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800">Avg. Order Value</span>
                  <span className="font-semibold text-gray-900">{currentData.averageOrderValue} ETB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Types & Preview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Report Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Report Types</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                        {report.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Top Performing Items ({selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)})
              </h2>
              
              <div className="space-y-4">
                {currentData.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-800">{item.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{item.revenue} ETB</p>
                      <p className="text-sm text-gray-800">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Reports</h2>
              
              <div className="space-y-3">
                {[
                  { name: 'Daily Sales Report - Dec 8, 2024', date: '2 hours ago', type: 'Sales', size: '2.4 MB' },
                  { name: 'Weekly Menu Performance - Dec 2-8, 2024', date: '1 day ago', type: 'Menu', size: '1.8 MB' },
                  { name: 'Monthly Customer Analytics - November 2024', date: '1 week ago', type: 'Customer', size: '3.2 MB' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{report.name}</h4>
                        <p className="text-xs text-gray-700">{report.type} • {report.size} • {report.date}</p>
                      </div>
                    </div>
                    <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Advanced Features Coming Soon</h3>
              <p className="text-blue-800 mb-4">
                We&apos;re working on advanced reporting features including automated scheduling,
                custom report builders, and real-time analytics dashboards.
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Automated daily/weekly/monthly report emails</li>
                <li>• Custom date range selections</li>
                <li>• Interactive charts and graphs</li>
                <li>• Export to Excel, CSV, and PDF formats</li>
                <li>• Inventory forecasting and recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
