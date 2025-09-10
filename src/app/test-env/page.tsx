'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestEnvPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runEnvironmentTests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Check environment variables
      results.push('🔍 Checking Environment Variables...');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl) {
        results.push(`✅ Supabase URL configured: ${supabaseUrl.substring(0, 30)}...`);
      } else {
        results.push('❌ Supabase URL not configured');
      }
      
      if (supabaseKey) {
        results.push(`✅ Supabase Key configured: ${supabaseKey.substring(0, 20)}...`);
      } else {
        results.push('❌ Supabase Key not configured');
      }
      
      // Test 2: Check Supabase connection
      results.push('🔗 Testing Supabase Connection...');
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) {
        results.push(`❌ Supabase connection failed: ${error.message}`);
      } else {
        results.push('✅ Supabase connection successful');
      }
      
      // Test 3: Check if users table exists
      results.push('📊 Testing Users Table...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        results.push(`❌ Users table error: ${usersError.message}`);
      } else {
        results.push('✅ Users table accessible');
        if (usersData && usersData.length > 0) {
          results.push(`✅ Found ${usersData.length} user(s) in database`);
        } else {
          results.push('⚠️ No users found in database');
        }
      }
      
      // Test 4: Check for canteen staff user
      results.push('👤 Checking for Canteen Staff User...');
      
      const { data: canteenUser, error: canteenError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'karavanstaff@sandfordschool.edu')
        .single();
      
      if (canteenError && canteenError.code !== 'PGRST116') {
        results.push(`❌ Error checking canteen user: ${canteenError.message}`);
      } else if (canteenUser) {
        results.push(`✅ Canteen staff user exists: ${canteenUser.name} (${canteenUser.role})`);
      } else {
        results.push('⚠️ Canteen staff user not found in database');
      }
      
      results.push('🎉 Environment tests completed!');
      
    } catch (error) {
      results.push(`❌ Test error: ${error}`);
    }
    
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Environment & Database Test</h1>
          <p className="text-gray-600 mb-8">
            Test environment variables and database connectivity for the authentication system.
          </p>
          
          <button
            onClick={runEnvironmentTests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-6"
          >
            Run Environment Tests
          </button>
          
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
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Run environment tests above</li>
              <li>2. If all tests pass, go to <a href="/test-auth" className="underline">Authentication Test</a></li>
              <li>3. Then try the <a href="/login" className="underline">Login Page</a></li>
              <li>4. Finally test <a href="/canteen/reports" className="underline">PDF Reports</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
