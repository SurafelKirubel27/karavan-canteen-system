'use client';

import { useState } from 'react';
import { PDFGenerator, formatCurrency } from '@/lib/pdf-generator';

export default function TestPDFPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTestPDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new PDFGenerator();
      
      // Test report data
      const reportData = {
        title: 'Test Sales Report',
        period: 'daily',
        dateRange: 'December 9, 2024',
        generatedAt: new Date().toLocaleDateString(),
        data: {}
      };

      // Add header and metadata
      pdf.addHeader(reportData.title, 'Karavan Canteen Management System');
      pdf.addMetadata(reportData);

      // Add summary statistics
      pdf.addSummaryStats([
        { label: 'Total Revenue', value: formatCurrency(12450) },
        { label: 'Total Orders', value: '45' },
        { label: 'Average Order Value', value: formatCurrency(276.67) },
        { label: 'Success Rate', value: '95.6%' }
      ]);

      // Add test table
      const headers = ['Item Name', 'Quantity Sold', 'Revenue', 'Orders'];
      const rows = [
        ['Grilled Chicken', '25', formatCurrency(8000), '12'],
        ['Caesar Salad', '18', formatCurrency(3960), '10'],
        ['Pizza Margherita', '15', formatCurrency(5700), '8'],
        ['Ethiopian Coffee', '32', formatCurrency(2560), '15']
      ];
      pdf.addTable(headers, rows, 'Most Popular Items');

      // Add another section
      pdf.addSectionHeader('Category Performance');
      const categoryHeaders = ['Category', 'Revenue', 'Orders', 'Avg Price'];
      const categoryRows = [
        ['Lunch', formatCurrency(8500), '20', formatCurrency(425)],
        ['Drinks', formatCurrency(2560), '15', formatCurrency(170.67)],
        ['Dinner', formatCurrency(1390), '10', formatCurrency(139)]
      ];
      pdf.addTable(categoryHeaders, categoryRows);

      // Download the PDF
      pdf.download('karavan-test-report.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">PDF Generator Test</h1>
          <p className="text-gray-600 mb-8">
            Test the PDF generation functionality with sample data.
          </p>
          
          <button
            onClick={generateTestPDF}
            disabled={isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate Test PDF</span>
              </>
            )}
          </button>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Test Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Karavan branding and header</li>
              <li>• Report metadata section</li>
              <li>• Summary statistics cards</li>
              <li>• Data tables with formatting</li>
              <li>• Professional PDF layout</li>
              <li>• Ethiopian Birr currency formatting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
