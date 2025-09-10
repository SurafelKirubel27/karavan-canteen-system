'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {
  createRevenueTrendChart,
  createOrderVolumeChart,
  createPopularItemsChart,
  createCategoryPerformanceChart,
  createHourlyTrendsChart
} from '@/lib/chart-config';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SalesReportChartProps {
  type: 'revenue-trend' | 'order-volume' | 'popular-items' | 'category-performance' | 'hourly-trends';
  data: any;
  onChartReady?: (canvas: HTMLCanvasElement) => void;
}

export default function SalesReportChart({ type, data, onChartReady }: SalesReportChartProps) {
  const chartRef = useRef<ChartJS | null>(null);

  // Safety check for data
  if (!data) {
    return (
      <div className="w-full h-64 md:h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No chart data available</p>
      </div>
    );
  }

  useEffect(() => {
    if (chartRef.current && onChartReady) {
      const canvas = chartRef.current.canvas;
      if (canvas) {
        onChartReady(canvas);
      }
    }
  }, [onChartReady]);

  const getChartConfig = () => {
    try {
      switch (type) {
        case 'revenue-trend':
          return createRevenueTrendChart(data);
        case 'order-volume':
          return createOrderVolumeChart(data);
        case 'popular-items':
          return createPopularItemsChart(data);
        case 'category-performance':
          return createCategoryPerformanceChart(data);
        case 'hourly-trends':
          return createHourlyTrendsChart(data);
        default:
          return createRevenueTrendChart(data);
      }
    } catch (error) {
      console.error('Error creating chart config:', error);
      // Return a basic chart configuration as fallback
      return {
        type: 'line' as const,
        data: {
          labels: [],
          datasets: []
        },
        options: {}
      };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="w-full h-64 md:h-80">
      <Chart
        ref={chartRef}
        type={chartConfig.type as any}
        data={chartConfig.data}
        options={chartConfig.options || {}}
      />
    </div>
  );
}
