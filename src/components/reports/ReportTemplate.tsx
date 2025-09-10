'use client';

import { useRef, useState } from 'react';
import { PDFGenerator, ReportData, formatCurrency, formatReportDate } from '@/lib/pdf-generator';
import SalesReportChart from './SalesReportChart';
import { DailySalesReport, WeeklySalesReport, MonthlySalesReport, MenuPerformanceReport } from '@/lib/report-data';

interface ReportTemplateProps {
  reportType: 'daily' | 'weekly' | 'monthly' | 'menu-performance';
  reportData: DailySalesReport | WeeklySalesReport | MonthlySalesReport | MenuPerformanceReport;
  dateRange: string;
  onDownload?: () => void;
}

export default function ReportTemplate({ reportType, reportData, dateRange, onDownload }: ReportTemplateProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const chartRefs = useRef<{ [key: string]: HTMLCanvasElement }>({});

  // Safety check for reportData
  if (!reportData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Data</h3>
          <p className="text-gray-600">Unable to load report data. Please try again.</p>
        </div>
      </div>
    );
  }

  const handleChartReady = (chartType: string, canvas: HTMLCanvasElement) => {
    chartRefs.current[chartType] = canvas;
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new PDFGenerator();
      
      // Report metadata
      const metadata: ReportData = {
        title: getReportTitle(),
        period: reportType,
        dateRange,
        generatedAt: formatReportDate(new Date()),
        data: reportData
      };

      // Add header and metadata
      pdf.addHeader(metadata.title, 'Karavan Canteen Management System');
      pdf.addMetadata(metadata);

      // Add content based on report type
      if (reportType === 'daily' && 'summary' in reportData) {
        await generateDailySalesReport(pdf, reportData as DailySalesReport);
      } else if (reportType === 'weekly' && 'summary' in reportData) {
        await generateWeeklySalesReport(pdf, reportData as WeeklySalesReport);
      } else if (reportType === 'monthly' && 'summary' in reportData) {
        await generateMonthlySalesReport(pdf, reportData as MonthlySalesReport);
      } else if (reportType === 'menu-performance') {
        await generateMenuPerformanceReport(pdf, reportData as MenuPerformanceReport);
      }

      // Download the PDF
      const filename = `karavan-${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.download(filename);
      
      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'daily': return 'Daily Sales Report';
      case 'weekly': return 'Weekly Sales Report';
      case 'monthly': return 'Monthly Sales Report';
      case 'menu-performance': return 'Menu Performance Report';
      default: return 'Sales Report';
    }
  };

  const generateDailySalesReport = async (pdf: PDFGenerator, data: DailySalesReport) => {
    // Summary statistics
    pdf.addSummaryStats([
      { label: 'Total Revenue', value: formatCurrency(data.summary.totalRevenue) },
      { label: 'Total Orders', value: data.summary.totalOrders.toString() },
      { label: 'Average Order Value', value: formatCurrency(data.summary.averageOrderValue) },
      { label: 'Delivered Orders', value: data.summary.deliveredOrders.toString() },
      { label: 'Cancelled Orders', value: data.summary.cancelledOrders.toString() },
      { label: 'Success Rate', value: `${((data.summary.deliveredOrders / data.summary.totalOrders) * 100).toFixed(1)}%` }
    ]);

    // Popular items table
    if (data.popularItems.length > 0) {
      const headers = ['Item Name', 'Quantity Sold', 'Revenue', 'Orders'];
      const rows = data.popularItems.map(item => [
        item.name,
        item.quantitySold.toString(),
        formatCurrency(item.revenue),
        item.orderCount.toString()
      ]);
      pdf.addTable(headers, rows, 'Most Popular Items');
    }

    // Category performance table
    if (data.categoryPerformance.length > 0) {
      const headers = ['Category', 'Revenue', 'Orders', 'Items Sold', 'Avg Price'];
      const rows = data.categoryPerformance.map(cat => [
        cat.category,
        formatCurrency(cat.revenue),
        cat.orderCount.toString(),
        cat.itemCount.toString(),
        formatCurrency(cat.averagePrice)
      ]);
      pdf.addTable(headers, rows, 'Category Performance');
    }

    // Add charts if available
    if (chartRefs.current['popular-items']) {
      await pdf.addChart(chartRefs.current['popular-items'], 'Popular Items Chart');
    }
    
    if (chartRefs.current['hourly-trends']) {
      await pdf.addChart(chartRefs.current['hourly-trends'], 'Hourly Trends');
    }
  };

  const generateWeeklySalesReport = async (pdf: PDFGenerator, data: WeeklySalesReport) => {
    // Summary statistics
    pdf.addSummaryStats([
      { label: 'Total Revenue', value: formatCurrency(data.summary.totalRevenue) },
      { label: 'Total Orders', value: data.summary.totalOrders.toString() },
      { label: 'Average Order Value', value: formatCurrency(data.summary.averageOrderValue) },
      { label: 'Growth vs Previous Week', value: `${data.summary.growthFromPreviousWeek.toFixed(1)}%` }
    ]);

    // Daily trends table
    if (data.dailyTrends.length > 0) {
      const headers = ['Date', 'Revenue', 'Orders', 'Avg Order Value'];
      const rows = data.dailyTrends.map(day => [
        new Date(day.date).toLocaleDateString(),
        formatCurrency(day.revenue),
        day.orderCount.toString(),
        formatCurrency(day.averageOrderValue)
      ]);
      pdf.addTable(headers, rows, 'Daily Performance');
    }

    // Popular items table
    if (data.popularItems.length > 0) {
      const headers = ['Item Name', 'Quantity Sold', 'Revenue', 'Orders'];
      const rows = data.popularItems.slice(0, 10).map(item => [
        item.name,
        item.quantitySold.toString(),
        formatCurrency(item.revenue),
        item.orderCount.toString()
      ]);
      pdf.addTable(headers, rows, 'Top 10 Popular Items');
    }

    // Peak days table
    if (data.peakDays.length > 0) {
      const headers = ['Day', 'Revenue', 'Orders'];
      const rows = data.peakDays.map(day => [
        day.day,
        formatCurrency(day.revenue),
        day.orders.toString()
      ]);
      pdf.addTable(headers, rows, 'Peak Performance Days');
    }

    // Add charts
    if (chartRefs.current['revenue-trend']) {
      await pdf.addChart(chartRefs.current['revenue-trend'], 'Weekly Revenue Trend');
    }
  };

  const generateMonthlySalesReport = async (pdf: PDFGenerator, data: MonthlySalesReport) => {
    // Summary statistics
    pdf.addSummaryStats([
      { label: 'Total Revenue', value: formatCurrency(data.summary.totalRevenue) },
      { label: 'Total Orders', value: data.summary.totalOrders.toString() },
      { label: 'Average Order Value', value: formatCurrency(data.summary.averageOrderValue) },
      { label: 'Growth vs Previous Month', value: `${data.summary.growthFromPreviousMonth.toFixed(1)}%` }
    ]);

    // Weekly trends table
    if (data.weeklyTrends.length > 0) {
      const headers = ['Week', 'Revenue', 'Orders', 'Avg Order Value'];
      const rows = data.weeklyTrends.map(week => [
        week.date,
        formatCurrency(week.revenue),
        week.orderCount.toString(),
        formatCurrency(week.averageOrderValue)
      ]);
      pdf.addTable(headers, rows, 'Weekly Performance');
    }

    // Top days table
    if (data.topDays.length > 0) {
      const headers = ['Date', 'Revenue', 'Orders'];
      const rows = data.topDays.map(day => [
        new Date(day.date).toLocaleDateString(),
        formatCurrency(day.revenue),
        day.orders.toString()
      ]);
      pdf.addTable(headers, rows, 'Top Performing Days');
    }

    // Popular items table
    if (data.popularItems.length > 0) {
      const headers = ['Item Name', 'Quantity Sold', 'Revenue', 'Orders'];
      const rows = data.popularItems.slice(0, 15).map(item => [
        item.name,
        item.quantitySold.toString(),
        formatCurrency(item.revenue),
        item.orderCount.toString()
      ]);
      pdf.addTable(headers, rows, 'Top 15 Popular Items');
    }

    // Category performance table
    if (data.categoryPerformance.length > 0) {
      const headers = ['Category', 'Revenue', 'Orders', 'Items Sold', 'Avg Price'];
      const rows = data.categoryPerformance.map(cat => [
        cat.category,
        formatCurrency(cat.revenue),
        cat.orderCount.toString(),
        cat.itemCount.toString(),
        formatCurrency(cat.averagePrice)
      ]);
      pdf.addTable(headers, rows, 'Category Performance');
    }

    // Add charts
    if (chartRefs.current['revenue-trend']) {
      await pdf.addChart(chartRefs.current['revenue-trend'], 'Monthly Revenue Trend');
    }
    
    if (chartRefs.current['category-performance']) {
      await pdf.addChart(chartRefs.current['category-performance'], 'Revenue by Category');
    }
  };

  const generateMenuPerformanceReport = async (pdf: PDFGenerator, data: MenuPerformanceReport) => {
    // Summary statistics
    pdf.addSummaryStats([
      { label: 'Total Menu Items', value: data.summary.totalMenuItems.toString() },
      { label: 'Active Items', value: data.summary.activeItems.toString() },
      { label: 'Total Revenue', value: formatCurrency(data.summary.totalRevenue) },
      { label: 'Total Items Sold', value: data.summary.totalOrderItems.toString() }
    ]);

    // Popular items table
    if (data.popularItems.length > 0) {
      const headers = ['Item Name', 'Quantity Sold', 'Revenue', 'Orders'];
      const rows = data.popularItems.map(item => [
        item.name,
        item.quantitySold.toString(),
        formatCurrency(item.revenue),
        item.orderCount.toString()
      ]);
      pdf.addTable(headers, rows, 'Most Popular Items');
    }

    // Category analysis table
    if (data.categoryAnalysis.length > 0) {
      const headers = ['Category', 'Revenue', 'Orders', 'Items Sold', 'Avg Price'];
      const rows = data.categoryAnalysis.map(cat => [
        cat.category,
        formatCurrency(cat.revenue),
        cat.orderCount.toString(),
        cat.itemCount.toString(),
        formatCurrency(cat.averagePrice)
      ]);
      pdf.addTable(headers, rows, 'Category Analysis');
    }

    // Low performing items table
    if (data.lowPerformingItems.length > 0) {
      const headers = ['Item Name', 'Quantity Sold', 'Revenue', 'Orders'];
      const rows = data.lowPerformingItems.map(item => [
        item.name,
        item.quantitySold.toString(),
        formatCurrency(item.revenue),
        item.orderCount.toString()
      ]);
      pdf.addTable(headers, rows, 'Low Performing Items');
    }

    // Revenue by category table
    if (data.revenueByCategory.length > 0) {
      const headers = ['Category', 'Revenue', 'Percentage'];
      const rows = data.revenueByCategory.map(cat => [
        cat.category,
        formatCurrency(cat.revenue),
        `${cat.percentage.toFixed(1)}%`
      ]);
      pdf.addTable(headers, rows, 'Revenue Distribution by Category');
    }

    // Add charts
    if (chartRefs.current['popular-items']) {
      await pdf.addChart(chartRefs.current['popular-items'], 'Popular Items Chart');
    }
    
    if (chartRefs.current['category-performance']) {
      await pdf.addChart(chartRefs.current['category-performance'], 'Revenue by Category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Preview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{getReportTitle()}</h2>
            <p className="text-gray-600">{dateRange}</p>
          </div>
          <button
            onClick={generatePDF}
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
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Charts for PDF generation (hidden) */}
        <div className="hidden">
          {reportType !== 'menu-performance' && 'popularItems' in reportData && reportData.popularItems.length > 0 && (
            <SalesReportChart
              type="popular-items"
              data={{
                labels: reportData.popularItems.slice(0, 10).map(item => item.name),
                quantities: reportData.popularItems.slice(0, 10).map(item => item.quantitySold)
              }}
              onChartReady={(canvas) => handleChartReady('popular-items', canvas)}
            />
          )}
          
          {(reportType === 'weekly' || reportType === 'monthly') && 'summary' in reportData && (
            <SalesReportChart
              type="revenue-trend"
              data={{
                labels: reportType === 'weekly' 
                  ? (reportData as WeeklySalesReport).dailyTrends.map(d => new Date(d.date).toLocaleDateString())
                  : (reportData as MonthlySalesReport).weeklyTrends.map(w => w.date),
                revenue: reportType === 'weekly'
                  ? (reportData as WeeklySalesReport).dailyTrends.map(d => d.revenue)
                  : (reportData as MonthlySalesReport).weeklyTrends.map(w => w.revenue)
              }}
              onChartReady={(canvas) => handleChartReady('revenue-trend', canvas)}
            />
          )}

          {reportType === 'daily' && 'hourlyTrends' in reportData && (
            <SalesReportChart
              type="hourly-trends"
              data={{
                hours: reportData.hourlyTrends.map(h => h.hour),
                orders: reportData.hourlyTrends.map(h => h.orders),
                revenue: reportData.hourlyTrends.map(h => h.revenue)
              }}
              onChartReady={(canvas) => handleChartReady('hourly-trends', canvas)}
            />
          )}

          {((reportType === 'monthly' && 'categoryPerformance' in reportData) || 
            (reportType === 'menu-performance' && 'revenueByCategory' in reportData)) && (
            <SalesReportChart
              type="category-performance"
              data={{
                labels: reportType === 'monthly'
                  ? (reportData as MonthlySalesReport).categoryPerformance.map(c => c.category)
                  : (reportData as MenuPerformanceReport).revenueByCategory.map(c => c.category),
                revenue: reportType === 'monthly'
                  ? (reportData as MonthlySalesReport).categoryPerformance.map(c => c.revenue)
                  : (reportData as MenuPerformanceReport).revenueByCategory.map(c => c.revenue)
              }}
              onChartReady={(canvas) => handleChartReady('category-performance', canvas)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
