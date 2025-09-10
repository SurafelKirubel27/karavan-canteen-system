'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import KaravanLogo from '@/components/KaravanLogo';
import ReportTemplate from '@/components/reports/ReportTemplate';
import {
  getDailySalesReport,
  getWeeklySalesReport,
  getMonthlySalesReport,
  getMenuPerformanceReport,
  DailySalesReport,
  WeeklySalesReport,
  MonthlySalesReport,
  MenuPerformanceReport
} from '@/lib/report-data';
import { formatDateRange } from '@/lib/pdf-generator';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedReportType, setSelectedReportType] = useState('sales');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<DailySalesReport | WeeklySalesReport | MonthlySalesReport | MenuPerformanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/welcome');
      return;
    }

    // Check if user is canteen staff
    if (user.role !== 'canteen') {
      router.push('/welcome');
      return;
    }
  }, [user, router]);

  // Generate report data
  const generateReportData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const date = new Date(selectedDate);
      let data;

      if (selectedReportType === 'sales') {
        switch (selectedPeriod) {
          case 'daily':
            data = await getDailySalesReport(date);
            break;
          case 'weekly':
            data = await getWeeklySalesReport(date);
            break;
          case 'monthly':
            data = await getMonthlySalesReport(date);
            break;
          default:
            data = await getDailySalesReport(date);
        }
      } else if (selectedReportType === 'menu') {
        const startDate = selectedPeriod === 'daily' ? startOfDay(date) :
                         selectedPeriod === 'weekly' ? startOfWeek(date) :
                         startOfMonth(date);
        const endDate = selectedPeriod === 'daily' ? endOfDay(date) :
                       selectedPeriod === 'weekly' ? endOfWeek(date) :
                       endOfMonth(date);
        data = await getMenuPerformanceReport(startDate, endDate);
      }

      setReportData(data || null);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate report when parameters change
  useEffect(() => {
    if (user?.role === 'canteen') {
      generateReportData();
    }
  }, [selectedPeriod, selectedReportType, selectedDate, user]);

  const getDateRange = () => {
    const date = new Date(selectedDate);

    switch (selectedPeriod) {
      case 'daily':
        return formatDateRange(startOfDay(date), endOfDay(date));
      case 'weekly':
        return formatDateRange(startOfWeek(date), endOfWeek(date));
      case 'monthly':
        return formatDateRange(startOfMonth(date), endOfMonth(date));
      default:
        return formatDateRange(date, date);
    }
  };

  const handleDownload = () => {
    setIsGenerating(false);
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
              <Link href="/canteen/orders/incoming" className="text-gray-700 hover:text-emerald-700">Orders</Link>
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
                {/* Report Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
                  <div className="space-y-2">
                    {reportTypes.map(type => (
                      <label key={type.id} className="flex items-center">
                        <input
                          type="radio"
                          name="reportType"
                          value={type.id}
                          checked={selectedReportType === type.id}
                          onChange={(e) => setSelectedReportType(e.target.value)}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-900">{type.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

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

                {/* Refresh Button */}
                <button
                  onClick={generateReportData}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            {reportData && 'summary' in reportData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Overview
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800">Total Orders</span>
                    <span className="font-semibold text-gray-900">{reportData.summary.totalOrders || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800">Total Revenue</span>
                    <span className="font-semibold text-emerald-600">{(reportData.summary.totalRevenue || 0).toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-800">Avg. Order Value</span>
                    <span className="font-semibold text-gray-900">{(reportData.summary.averageOrderValue || 0).toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading report data...</p>
                </div>
              </div>
            )}

            {!isLoading && !error && reportData && (
              <ReportTemplate
                reportType={selectedReportType === 'sales' ? selectedPeriod as 'daily' | 'weekly' | 'monthly' : 'menu-performance'}
                reportData={reportData}
                dateRange={getDateRange()}
                onDownload={handleDownload}
              />
            )}

            {!isLoading && !error && !reportData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600 mb-6">No data found for the selected period. Try a different date range.</p>
                  <button
                    onClick={generateReportData}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Available */}
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-2">PDF Report Features Available</h3>
              <p className="text-emerald-800 mb-4">
                Generate comprehensive PDF reports with real-time data from your canteen operations.
                All reports include professional formatting, charts, and detailed analytics.
              </p>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• ✅ Daily, weekly, and monthly sales reports</li>
                <li>• ✅ Menu performance analytics with charts</li>
                <li>• ✅ Revenue trends and order statistics</li>
                <li>• ✅ Professional PDF formatting with Karavan branding</li>
                <li>• ✅ Real-time data from Supabase database</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
