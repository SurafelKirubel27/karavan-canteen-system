'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import KaravanLogo from '@/components/KaravanLogo';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const location = searchParams.get('location');
  const [estimatedTime] = useState('15-25 minutes');

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
              <Link href="/teacher/orders/ongoing" className="text-gray-700 hover:text-emerald-700">Track Order</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 mb-2">Thank you for your order. We're preparing your food now.</p>
          <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-900">{orderId}</span></p>
        </div>

        {/* Important Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">📞 You will receive a call</h3>
              <p className="text-emerald-700">
                Our delivery team will call you at <strong>+251 911 234 567</strong> when your order is ready for delivery. 
                Please keep your phone nearby and ensure you're available at your specified location.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Delivery Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Delivery Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Delivery Location:</span>
                <p className="font-medium text-gray-900">{location || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Estimated Delivery Time:</span>
                <p className="font-medium text-gray-900">{estimatedTime}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Contact Number:</span>
                <p className="font-medium text-gray-900">+251 911 234 567</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Order Status</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-900">Order received and confirmed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-500">Kitchen preparing your food</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-500">Ready for delivery</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-500">Delivered to your location</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Kitchen Preparation</h3>
              <p className="text-sm text-gray-600">Our kitchen team will start preparing your fresh food order</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">We'll Call You</h3>
              <p className="text-sm text-gray-600">You'll receive a call when your order is ready for delivery</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Delivery</h3>
              <p className="text-sm text-gray-600">Your food will be delivered to your specified campus location</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/teacher/orders/ongoing"
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
          >
            Track Your Order
          </Link>
          <Link 
            href="/teacher/dashboard"
            className="bg-white hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors border border-gray-300 text-center"
          >
            Order More Food
          </Link>
        </div>

        {/* Support Information */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help with your order?</p>
          <p className="text-sm text-emerald-600 font-medium">
            Contact us: +251 911 234 567 | support@karavan.edu
          </p>
        </div>
      </div>
    </div>
  );
}
