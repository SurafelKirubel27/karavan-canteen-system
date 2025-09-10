'use client';

import { useState } from 'react';

export default function VerifyPDFPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = async () => {
    const results: string[] = [];
    
    try {
      // Test 1: Check if jsPDF is available
      const jsPDF = (await import('jspdf')).default;
      results.push('✅ jsPDF library loaded successfully');
      
      // Test 2: Check if html2canvas is available
      const html2canvas = (await import('html2canvas')).default;
      results.push('✅ html2canvas library loaded successfully');
      
      // Test 3: Check if Chart.js is available
      const Chart = (await import('chart.js')).Chart;
      results.push('✅ Chart.js library loaded successfully');
      
      // Test 4: Check if date-fns is available
      const { format } = await import('date-fns');
      results.push('✅ date-fns library loaded successfully');
      
      // Test 5: Test basic PDF creation
      const doc = new jsPDF();
      doc.text('Test PDF', 20, 20);
      results.push('✅ Basic PDF creation works');
      
      // Test 6: Test date formatting
      const testDate = format(new Date(), 'MMM dd, yyyy');
      results.push(`✅ Date formatting works: ${testDate}`);
      
      results.push('🎉 All tests passed! PDF generation should work.');
      
    } catch (error) {
      results.push(`❌ Error: ${error}`);
    }
    
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">PDF System Verification</h1>
          <p className="text-gray-600 mb-8">
            Test if all PDF generation dependencies are working correctly.
          </p>
          
          <button
            onClick={runTests}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-6"
          >
            Run Verification Tests
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
              <li>1. Run verification tests above</li>
              <li>2. If all tests pass, go to <a href="/canteen/reports" className="underline">Reports Page</a></li>
              <li>3. Login as canteen staff (karavanstaff@sandfordschool.edu)</li>
              <li>4. Try generating a PDF report</li>
              <li>5. Test with sample data at <a href="/test-pdf" className="underline">Test PDF Page</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
