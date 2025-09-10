'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDailySalesReport, getWeeklySalesReport, getMonthlySalesReport, getMenuPerformanceReport } from '@/lib/report-data';
import { formatCurrency } from '@/lib/pdf-generator';
import Link from 'next/link';

export default function TestReportsPage() {
  const { user, signIn } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const addTestResult = (test: string, status: 'pass' | 'fail' | 'info', message: string, data?: any) => {
    setTestResults(prev => [...prev, { 
      test, 
      status, 
      message, 
      data,
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testReportGeneration = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Authentication Check
    if (!user || user.role !== 'canteen') {
      addTestResult('Authentication', 'fail', 'Must be logged in as canteen staff to test reports');
      setIsRunning(false);
      return;
    }
    addTestResult('Authentication', 'pass', `Logged in as ${user.email}`);

    // Test 2: Daily Sales Report
    try {
      const today = new Date();
      const dailyReport = await getDailySalesReport(today);
      addTestResult('Daily Report', 'pass', `Generated daily report with ${dailyReport.summary.totalOrders} orders`, dailyReport);
      setReportData({ type: 'daily', data: dailyReport });
    } catch (error) {
      addTestResult('Daily Report', 'fail', `Daily report error: ${error}`);
    }

    // Test 3: Weekly Sales Report
    try {
      const today = new Date();
      const weeklyReport = await getWeeklySalesReport(today);
      addTestResult('Weekly Report', 'pass', `Generated weekly report with ${weeklyReport.summary.totalOrders} orders`, weeklyReport);
    } catch (error) {
      addTestResult('Weekly Report', 'fail', `Weekly report error: ${error}`);
    }

    // Test 4: Monthly Sales Report
    try {
      const today = new Date();
      const monthlyReport = await getMonthlySalesReport(today);
      addTestResult('Monthly Report', 'pass', `Generated monthly report with ${monthlyReport.summary.totalOrders} orders`, monthlyReport);
    } catch (error) {
      addTestResult('Monthly Report', 'fail', `Monthly report error: ${error}`);
    }

    // Test 5: Menu Performance Report
    try {
      const menuReport = await getMenuPerformanceReport();
      addTestResult('Menu Performance', 'pass', `Generated menu report with ${menuReport.totalItems} items`, menuReport);
    } catch (error) {
      addTestResult('Menu Performance', 'fail', `Menu report error: ${error}`);
    }

    // Test 6: Currency Formatting
    try {
      const testAmounts = [100, 0, undefined, null, 1234.56];
      testAmounts.forEach(amount => {
        const formatted = formatCurrency(amount);
        addTestResult('Currency Format', 'pass', `${amount} → ${formatted}`);
      });
    } catch (error) {
      addTestResult('Currency Format', 'fail', `Currency formatting error: ${error}`);
    }

    setIsRunning(false);
  };

  const loginAsCanteenStaff = async () => {
    try {
      const result = await signIn('karavanstaff@sandfordschool.edu', 'KaravanStaff123');
      if (result.success) {
        addTestResult('Canteen Login', 'pass', 'Successfully logged in as canteen staff');
      } else {
        addTestResult('Canteen Login', 'fail', `Login failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult('Canteen Login', 'fail', `Login error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">📊 PDF Reports System Test</h1>
          
          {/* Current Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">Current Status</h2>
            <div className="space-y-1 text-sm">
              <p><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'Not logged in'}</p>
              <p><strong>Can Test Reports:</strong> {user?.role === 'canteen' ? '✅ Yes' : '❌ No (need canteen staff login)'}</p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              {user?.role !== 'canteen' && (
                <button
                  onClick={loginAsCanteenStaff}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium"
                >
                  Login as Canteen Staff
                </button>
              )}
              
              <button
                onClick={testReportGeneration}
                disabled={isRunning || user?.role !== 'canteen'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
              >
                {isRunning ? 'Running Tests...' : 'Test All Reports'}
              </button>

              <Link
                href="/canteen/reports"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium inline-block"
              >
                Go to Reports Page
              </Link>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            {testResults.length === 0 ? (
              <p className="text-gray-500 italic">No tests run yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
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

          {/* Sample Report Data */}
          {reportData && (
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sample Report Data</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">{reportData.type.charAt(0).toUpperCase() + reportData.type.slice(1)} Sales Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="ml-2 font-medium">{reportData.data.summary.totalOrders || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="ml-2 font-medium">{formatCurrency(reportData.data.summary.totalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Order Value:</span>
                    <span className="ml-2 font-medium">{formatCurrency(reportData.data.summary.averageOrderValue)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Popular Items:</span>
                    <span className="ml-2 font-medium">{reportData.data.popularItems?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/canteen/reports" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-sm font-medium">Reports</div>
              </Link>
              <Link href="/test-pdf" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">📄</div>
                <div className="text-sm font-medium">Test PDF</div>
              </Link>
              <Link href="/system-test" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">🔧</div>
                <div className="text-sm font-medium">System Test</div>
              </Link>
              <Link href="/canteen/dashboard" className="text-center p-3 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                <div className="text-2xl mb-1">🏪</div>
                <div className="text-sm font-medium">Dashboard</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
