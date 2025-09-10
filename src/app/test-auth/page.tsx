'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingLogin, setIsTestingLogin] = useState(false);
  const { login, user, signOut } = useAuth();

  const runAuthTests = async () => {
    setTestResults([]);
    setIsTestingLogin(true);
    const results: string[] = [];
    
    try {
      results.push('🔍 Starting Authentication Tests...');
      
      // Test 1: Check if AuthContext is available
      if (login && signOut) {
        results.push('✅ AuthContext functions available');
      } else {
        results.push('❌ AuthContext functions missing');
        setTestResults(results);
        setIsTestingLogin(false);
        return;
      }
      
      // Test 2: Test canteen staff login
      results.push('🔐 Testing canteen staff login...');
      const loginResult = await login('karavanstaff@sandfordschool.edu', 'KaravanStaff123');
      
      if (loginResult.success) {
        results.push('✅ Canteen staff login successful');
        
        // Wait for user state to update
        setTimeout(() => {
          if (user) {
            results.push(`✅ User state updated: ${user.name} (${user.role})`);
            if (user.role === 'canteen') {
              results.push('✅ Correct role assigned: canteen');
            } else {
              results.push(`❌ Wrong role assigned: ${user.role} (expected: canteen)`);
            }
          } else {
            results.push('❌ User state not updated after login');
          }
          setTestResults([...results]);
        }, 1000);
        
      } else {
        results.push(`❌ Canteen staff login failed: ${loginResult.error}`);
      }
      
      setTestResults(results);
      
    } catch (error) {
      results.push(`❌ Test error: ${error}`);
      setTestResults(results);
    } finally {
      setIsTestingLogin(false);
    }
  };

  const testLogout = async () => {
    try {
      await signOut();
      setTestResults(prev => [...prev, '✅ Logout successful']);
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Logout failed: ${error}`]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication System Test</h1>
          <p className="text-gray-600 mb-8">
            Test the canteen staff authentication system to ensure login functionality works correctly.
          </p>
          
          {/* Current User Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Current User Status:</h3>
            {user ? (
              <div className="text-sm text-blue-800">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Department:</strong> {user.department}</p>
              </div>
            ) : (
              <p className="text-sm text-blue-800">No user logged in</p>
            )}
          </div>
          
          {/* Test Controls */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={runAuthTests}
              disabled={isTestingLogin}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isTestingLogin ? 'Testing...' : 'Test Canteen Staff Login'}
            </button>
            
            {user && (
              <button
                onClick={testLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Test Logout
              </button>
            )}
          </div>
          
          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Test Results:</h3>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Test Instructions:</h3>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Click "Test Canteen Staff Login" to test authentication</li>
              <li>Verify that login succeeds and user role is set to "canteen"</li>
              <li>If logged in, test logout functionality</li>
              <li>Check browser console for detailed logs</li>
              <li>If tests pass, try accessing <a href="/canteen/reports" className="underline">Reports Page</a></li>
            </ol>
          </div>
          
          {/* Navigation Links */}
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Quick Links:</h3>
            <div className="space-y-2 text-sm">
              <div><a href="/login" className="text-green-700 underline">Login Page</a></div>
              <div><a href="/canteen/dashboard" className="text-green-700 underline">Canteen Dashboard</a></div>
              <div><a href="/canteen/reports" className="text-green-700 underline">Reports Page</a></div>
              <div><a href="/test-pdf" className="text-green-700 underline">Test PDF Generation</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
