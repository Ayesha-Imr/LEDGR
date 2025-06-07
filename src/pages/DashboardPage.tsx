import React, { useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { useStore } from '../store/authStore';
import Card from '../components/common/Card';
import { formatCurrency } from '../utils/currency';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  PieChart, 
  Wallet,
  Calendar,
  Target,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { 
    orders, 
    lineItems, 
    budgets,
    fetchOrders, 
    fetchLineItems, 
    fetchBudgets,
    isLoading,
    getBudgetUsage,
    getCategorySpending,
    getVendorSpending
  } = useDataStore();
  const { user } = useStore();
  
  useEffect(() => {
    fetchOrders();
    fetchLineItems();
    fetchBudgets();
  }, [fetchOrders, fetchLineItems, fetchBudgets]);
  
  // Calculate key metrics
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  const currentMonthStart = startOfMonth(currentMonth);
  const currentMonthEnd = endOfMonth(currentMonth);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);
  
  // Current month spending
  const currentMonthOrders = orders.filter(order => 
    isWithinInterval(parseISO(order.order_date), { start: currentMonthStart, end: currentMonthEnd })
  );
  const currentMonthSpending = currentMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);
  
  // Last month spending
  const lastMonthOrders = orders.filter(order => 
    isWithinInterval(parseISO(order.order_date), { start: lastMonthStart, end: lastMonthEnd })
  );
  const lastMonthSpending = lastMonthOrders.reduce((sum, order) => sum + order.total_amount, 0);
  
  // Calculate percentage change
  const spendingChange = lastMonthSpending > 0 
    ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 
    : 0;
  
  // Total spending
  const totalSpending = orders.reduce((sum, order) => sum + order.total_amount, 0);
  
  // Recent orders (last 5)
  const recentOrders = orders.slice(0, 5);
  
  // Budget status
  const budgetUsage = getBudgetUsage();
  const overBudgetCount = budgetUsage.filter(usage => usage.percentage > 100).length;
  const nearBudgetCount = budgetUsage.filter(usage => usage.percentage > 85 && usage.percentage <= 100).length;
  
  // Top categories
  const categorySpending = getCategorySpending().slice(0, 3);
  
  // Top vendors
  const vendorSpending = getVendorSpending().slice(0, 3);
  
  const currencyCode = user?.preferred_currency || 'USD';
  
  if (isLoading.orders || isLoading.lineItems || isLoading.budgets) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your spending overview.
          </p>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* This Month Spending */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentMonthSpending, currencyCode)}
              </p>
              <div className="flex items-center mt-1">
                {spendingChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm ${spendingChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.abs(spendingChange).toFixed(1)}% vs last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>
        
        {/* Total Orders */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {currentMonthOrders.length} this month
              </p>
            </div>
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-full">
              <ShoppingCart className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </Card>
        
        {/* Active Budgets */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Budgets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{budgets.length}</p>
              {overBudgetCount > 0 && (
                <div className="flex items-center mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    {overBudgetCount} over budget
                  </span>
                </div>
              )}
              {overBudgetCount === 0 && nearBudgetCount > 0 && (
                <div className="flex items-center mt-1">
                  <Target className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    {nearBudgetCount} near limit
                  </span>
                </div>
              )}
              {overBudgetCount === 0 && nearBudgetCount === 0 && budgets.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">All on track</p>
              )}
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        
        {/* Total Spending */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalSpending, currencyCode)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card title="Recent Orders">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Forward an email to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/dashboard/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{order.vendor_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(parseISO(order.order_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(order.total_amount, currencyCode)}
                  </span>
                </Link>
              ))}
              <Link
                to="/dashboard/orders"
                className="block text-center py-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
              >
                View all orders →
              </Link>
            </div>
          )}
        </Card>
        
        {/* Top Categories */}
        <Card title="Top Categories">
          {categorySpending.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No categories yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categorySpending.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-emerald-500' : 
                      index === 1 ? 'bg-violet-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(category.amount, currencyCode)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
              <Link
                to="/dashboard/categories"
                className="block text-center py-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
              >
                View all categories →
              </Link>
            </div>
          )}
        </Card>
      </div>
      
      {/* Budget Alerts */}
      {(overBudgetCount > 0 || nearBudgetCount > 0) && (
        <Card title="Budget Alerts">
          <div className="space-y-3">
            {budgetUsage
              .filter(usage => usage.percentage > 85)
              .map(({ budget, spent, percentage }) => (
                <div 
                  key={budget.id} 
                  className={`p-4 rounded-lg border ${
                    percentage > 100 
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                      : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${
                        percentage > 100 ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {budget.period_type.charAt(0).toUpperCase() + budget.period_type.slice(1)} Budget
                        {budget.category && ` - ${budget.category}`}
                      </h4>
                      <p className={`text-sm ${
                        percentage > 100 ? 'text-red-600 dark:text-red-300' : 'text-yellow-600 dark:text-yellow-300'
                      }`}>
                        {formatCurrency(spent, currencyCode)} of {formatCurrency(budget.amount, currencyCode)} spent
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        percentage > 100 ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            <Link
              to="/dashboard/budgets"
              className="block text-center py-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-sm font-medium"
            >
              Manage budgets →
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;