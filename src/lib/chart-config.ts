import { ChartConfiguration } from 'chart.js';

// Karavan brand colors
export const COLORS = {
  primary: '#10b981', // emerald-600
  secondary: '#f97316', // orange-500
  accent: '#8b5cf6', // violet-500
  success: '#22c55e', // green-500
  warning: '#eab308', // yellow-500
  error: '#ef4444', // red-500
  gray: '#6b7280', // gray-500
  lightGray: '#f3f4f6', // gray-100
  darkGray: '#374151' // gray-700
};

// Color palette for charts
export const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f59e0b', // amber-500
  '#ec4899'  // pink-500
];

// Common chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, system-ui, sans-serif'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: COLORS.primary,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: COLORS.gray
      }
    },
    y: {
      grid: {
        color: COLORS.lightGray,
        borderDash: [2, 2]
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: COLORS.gray
      }
    }
  }
};

// Revenue trend line chart configuration
export function createRevenueTrendChart(data: { labels: string[]; revenue: number[]; } | null | undefined): ChartConfiguration<'line'> {
  const safeData = data || { labels: [], revenue: [] };

  return {
    type: 'line',
    data: {
      labels: safeData.labels || [],
      datasets: [
        {
          label: 'Revenue (ETB)',
          data: safeData.revenue || [],
          borderColor: COLORS.primary,
          backgroundColor: `${COLORS.primary}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: COLORS.primary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ]
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: 'Revenue Trend',
          font: {
            size: 16,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif'
          },
          color: COLORS.darkGray,
          padding: 20
        }
      },
      scales: {
        ...commonOptions.scales,
        y: {
          ...commonOptions.scales?.y,
          ticks: {
            ...commonOptions.scales?.y?.ticks,
            callback: function(value) {
              return `${value} ETB`;
            }
          }
        }
      }
    }
  };
}

// Order volume bar chart configuration
export function createOrderVolumeChart(data: { labels: string[]; orders: number[]; } | null | undefined): ChartConfiguration<'bar'> {
  const safeData = data || { labels: [], orders: [] };

  return {
    type: 'bar',
    data: {
      labels: safeData.labels || [],
      datasets: [
        {
          label: 'Orders',
          data: safeData.orders || [],
          backgroundColor: COLORS.secondary,
          borderColor: COLORS.secondary,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: 'Order Volume',
          font: {
            size: 16,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif'
          },
          color: COLORS.darkGray,
          padding: 20
        }
      }
    }
  };
}

// Popular items horizontal bar chart configuration
export function createPopularItemsChart(data: { labels: string[]; quantities: number[]; } | null | undefined): ChartConfiguration<'bar'> {
  const safeData = data || { labels: [], quantities: [] };

  return {
    type: 'bar',
    data: {
      labels: safeData.labels || [],
      datasets: [
        {
          label: 'Quantity Sold',
          data: safeData.quantities || [],
          backgroundColor: CHART_COLORS.slice(0, data.labels.length),
          borderColor: CHART_COLORS.slice(0, data.labels.length),
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }
      ]
    },
    options: {
      ...commonOptions,
      indexAxis: 'y' as const,
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: 'Most Popular Items',
          font: {
            size: 16,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif'
          },
          color: COLORS.darkGray,
          padding: 20
        }
      },
      scales: {
        x: {
          grid: {
            color: COLORS.lightGray,
            borderDash: [2, 2]
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            color: COLORS.gray
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            color: COLORS.gray
          }
        }
      }
    }
  };
}

// Category performance pie chart configuration
export function createCategoryPerformanceChart(data: { labels: string[]; revenue: number[]; } | null | undefined): ChartConfiguration<'pie'> {
  const safeData = data || { labels: [], revenue: [] };

  return {
    type: 'pie',
    data: {
      labels: safeData.labels || [],
      datasets: [
        {
          data: safeData.revenue || [],
          backgroundColor: CHART_COLORS.slice(0, (safeData.labels || []).length),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              family: 'Inter, system-ui, sans-serif'
            }
          }
        },
        title: {
          display: true,
          text: 'Revenue by Category',
          font: {
            size: 16,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif'
          },
          color: COLORS.darkGray,
          padding: 20
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: COLORS.primary,
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} ETB (${percentage}%)`;
            }
          }
        }
      }
    }
  };
}

// Hourly trends chart configuration
export function createHourlyTrendsChart(data: { hours: number[]; orders: number[]; revenue: number[]; } | null | undefined): ChartConfiguration<'line'> {
  const safeData = data || { hours: [], orders: [], revenue: [] };

  return {
    type: 'line',
    data: {
      labels: (safeData.hours || []).map(h => `${h}:00`),
      datasets: [
        {
          label: 'Orders',
          data: safeData.orders || [],
          borderColor: COLORS.secondary,
          backgroundColor: `${COLORS.secondary}20`,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: 'Revenue (ETB)',
          data: safeData.revenue || [],
          borderColor: COLORS.primary,
          backgroundColor: `${COLORS.primary}20`,
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...commonOptions.plugins,
        title: {
          display: true,
          text: 'Hourly Order & Revenue Trends',
          font: {
            size: 16,
            weight: 'bold',
            family: 'Inter, system-ui, sans-serif'
          },
          color: COLORS.darkGray,
          padding: 20
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            color: COLORS.gray
          }
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          grid: {
            color: COLORS.lightGray,
            borderDash: [2, 2]
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            color: COLORS.gray
          }
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            color: COLORS.gray,
            callback: function(value) {
              return `${value} ETB`;
            }
          }
        }
      }
    }
  };
}
