'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    // Calculate estimated pickup time (15-25 minutes from now)
    const now = new Date();
    const pickupTime = new Date(now.getTime() + 20 * 60000); // 20 minutes from now
    setEstimatedTime(pickupTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We&apos;re preparing your delicious meal!
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Ready Time:</span>
                <span className="font-medium text-green-600">{estimatedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Location:</span>
                <span className="font-medium text-gray-900">Main Canteen</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-800 font-medium">Order is being prepared</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href={`/orders/${orderId}`}
              className="btn-primary w-full text-center block"
            >
              Track Order
            </Link>
            <Link 
              href="/menu"
              className="btn-secondary w-full text-center block"
            >
              Order More Items
            </Link>
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm block"
            >
              Back to Home
            </Link>
          </div>

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h3>
            <ul className="text-xs text-yellow-700 space-y-1 text-left">
              <li>• Please bring your order confirmation</li>
              <li>• Payment will be collected at pickup</li>
              <li>• Contact us if you need to modify your order</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
