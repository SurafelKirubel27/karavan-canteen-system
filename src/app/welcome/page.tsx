'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KaravanLogo from '@/components/KaravanLogo';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomePage() {
  const [selectedType, setSelectedType] = useState<'teacher' | 'canteen' | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect authenticated users to their appropriate dashboard
      if (user.role === 'teacher') {
        router.push('/teacher/dashboard');
      } else if (user.role === 'canteen' || user.role === 'admin') {
        router.push('/canteen/orders/incoming');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <KaravanLogo size="xl" className="justify-center mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-emerald-700">KARAVAN</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get food from your own canteen delivered to your desired location on campus
          </p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Teacher Card */}
          <div
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              selectedType === 'teacher'
                ? 'border-emerald-700 bg-emerald-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedType('teacher')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Teacher</h3>
              <p className="text-gray-600 mb-6">
                Order delicious food and have it delivered to your location on campus
              </p>
            </div>
            {selectedType === 'teacher' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-emerald-700 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Canteen Staff Card */}
          <div
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
              selectedType === 'canteen'
                ? 'border-emerald-700 bg-emerald-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedType('canteen')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Canteen Staff</h3>
              <p className="text-gray-600 mb-6">
                Manage orders, prepare food, and coordinate deliveries for teachers
              </p>
            </div>
            {selectedType === 'canteen' && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-emerald-700 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        {selectedType && (
          <div className="text-center mt-12">
            <Link
              href={selectedType === 'teacher' ? '/teacher/login' : '/canteen/login'}
              className="bg-emerald-700 hover:bg-emerald-800 text-white inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Continue as {selectedType === 'teacher' ? 'Teacher' : 'Canteen Staff'}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">Get your food delivered in 15-25 minutes anywhere on campus</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fresh Food</h3>
            <p className="text-gray-600 text-sm">All meals are prepared fresh in our Sandford School canteen</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Campus Delivery</h3>
            <p className="text-gray-600 text-sm">Delivered directly to your classroom, office, or any campus location</p>
          </div>
        </div>
      </div>
    </div>
  );
}
