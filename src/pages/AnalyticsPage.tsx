import React, { useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { useStore } from '../store/authStore';
import Card from '../components/common/Card';
import { getCurrencySymbol } from '../utils/currency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, PieChart, BarChart } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage: React.FC = () => {
  const { 
    fetchOrders, 
    fetchLineItems, 
    isLoading,
    getMonthlySpending,
    getCategorySpending,
    getVendorSpending
  } = useDataStore();
  const { user } = useStore();
  
  useEffect(() => {
    // Fetch necessary data
    fetchOrders();
    fetchLineItems();
  }, [fetchOrders, fetchLineItems]);
  
  // Get analytics data
  const monthlySpending = getMonthlySpending();
  const categorySpending = getCategorySpending();
  const vendorSpending = getVendorSpending();
  
  // Take top 5 vendors
  const topVendors = vendorSpending.slice(0, 5);
  
  // Chart colors
  const chartColors = [
    'rgba(16, 185, 129, 0.7)',   // Emerald
    'rgba(139, 92, 246, 0.7)',   // Violet
    'rgba(59, 130, 246, 0.7)',   // Blue
    'rgba(249, 115, 22, 0.7)',   // Orange
    'rgba(236, 72, 153, 0.7)',   // Pink
    'rgba(234, 179, 8, 0.7)',    // Yellow
    'rgba(168, 85, 247, 0.7)',   // Purple
    'rgba(14, 165, 233, 0.7)',   // Sky
  ];
  
  const currencySymbol = getCurrencySymbol(user?.preferred_currency || 'USD');
  
  // Monthly spending chart data
  const monthlyChartData = {
    labels: monthlySpending.map(item => `${item.month} ${item.year}`),
    datasets: [
      {
        label: 'Monthly Spending',
        data: monthlySpending.map(item => item.amount),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  // Category spending chart data
  const categoryChartData = {
    labels: categorySpending.map(item => item.category),
    datasets: [
      {
        label: 'Spending by Category',
        data: categorySpending.map(item => item.amount),
        backgroundColor: chartColors.slice(0, categorySpending.length),
        borderWidth: 1,
      },
    ],
  };
  
  // Vendor spending chart data
  const vendorChartData = {
    labels: topVendors.map(item => item.vendor),
    datasets: [
      {
        label: 'Spending by Vendor',
        data: topVendors.map(item => item.amount),
        backgroundColor: chartColors.slice(0, topVendors.length),
      },
    ],
  };
  
  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${currencySymbol}${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return currencySymbol + value;
          }
        }
      }
    }
  };
  
  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${currencySymbol}${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };
  
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${currencySymbol}${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return currencySymbol + value;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };
  
  if (isLoading.orders || isLoading.lineItems) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <Card className="lg:col-span-2">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Monthly Spending Trend</h2>
          </div>
          
          {monthlySpending.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No spending data available yet
            </div>
          ) : (
            <div className="h-72">
              <Line data={monthlyChartData} options={lineChartOptions} />
            </div>
          )}
        </Card>
        
        {/* Category Breakdown */}
        <Card>
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-violet-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Spending by Category</h2>
          </div>
          
          {categorySpending.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No category data available yet
            </div>
          ) : (
            <div className="h-80">
              <Doughnut data={categoryChartData} options={doughnutChartOptions} />
            </div>
          )}
        </Card>
        
        {/* Vendor Spending */}
        <Card>
          <div className="flex items-center mb-4">
            <BarChart className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Top Vendors</h2>
          </div>
          
          {vendorSpending.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No vendor data available yet
            </div>
          ) : (
            <div className="h-80">
              <Bar data={vendorChartData} options={barChartOptions} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;