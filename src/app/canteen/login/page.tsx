'use client';

import Link from 'next/link';
import { useState } from 'react';
import KaravanLogo from '@/components/KaravanLogo';

export default function CanteenLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login for canteen staff
    if (formData.email === 'staff@sandfordschool.edu' && formData.password === 'canteen123') {
      window.location.href = '/canteen/dashboard';
    } else {
      alert('Invalid credentials. Use: staff@sandfordschool.edu / canteen123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/welcome">
            <KaravanLogo size="xl" className="justify-center mb-6" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Canteen Staff Sign In</h2>
          <p className="text-gray-600">Access your canteen management dashboard</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          {/* Demo Credentials */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-emerald-800 mb-2">Demo Credentials</h3>
            <div className="text-xs text-emerald-700 space-y-1">
              <p><strong>Email:</strong> staff@sandfordschool.edu</p>
              <p><strong>Password:</strong> canteen123</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Staff Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="staff@sandfordschool.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/canteen/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Sign in to Canteen Dashboard
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Features Coming Soon</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Order Management Dashboard
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Kitchen Display System
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Delivery Coordination
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Menu Management
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/welcome" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
            ← Back to welcome page
          </Link>
        </div>
      </div>
    </div>
  );
}
