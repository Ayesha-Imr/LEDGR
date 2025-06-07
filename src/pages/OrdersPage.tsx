import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight, Search, Calendar, ArrowUpDown } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useStore } from '../store/authStore';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../utils/currency';

type SortField = 'date' | 'vendor' | 'amount';
type SortDirection = 'asc' | 'desc';

const OrdersPage: React.FC = () => {
  const { orders, isLoading } = useDataStore();
  const { user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Filter orders by search term
  const filteredOrders = orders.filter(order => 
    order.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'date':
        return direction * (new Date(a.order_date).getTime() - new Date(b.order_date).getTime());
      case 'vendor':
        return direction * a.vendor_name.localeCompare(b.vendor_name);
      case 'amount':
        return direction * (a.total_amount - b.total_amount);
      default:
        return 0;
    }
  });
  
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>
      
      <Card>
        {isLoading.orders ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : sortedOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart className="w-full h-full" />}
            title="No orders yet"
            description="Forward a Shopify order confirmation email to your unique LEDGR email address to get started."
          />
        ) : (
          <div>
            {/* Sort controls */}
            <div className="flex items-center justify-end mb-4 text-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">Sort by:</span>
              <button
                onClick={() => toggleSort('date')}
                className={`flex items-center px-3 py-1 rounded mr-2 ${
                  sortField === 'date' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar size={14} className="mr-1" />
                Date
                {sortField === 'date' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                onClick={() => toggleSort('vendor')}
                className={`flex items-center px-3 py-1 rounded mr-2 ${
                  sortField === 'vendor' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ShoppingCart size={14} className="mr-1" />
                Vendor
                {sortField === 'vendor' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
              <button
                onClick={() => toggleSort('amount')}
                className={`flex items-center px-3 py-1 rounded ${
                  sortField === 'amount' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ArrowUpDown size={14} className="mr-1" />
                Amount
                {sortField === 'amount' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            </div>
            
            {/* Orders list */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/dashboard/orders/${order.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 -mx-6 px-6 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          {order.vendor_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(parseISO(order.order_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-gray-900 dark:text-white mr-2">
                        {formatCurrency(order.total_amount, user?.preferred_currency || 'USD')}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrdersPage;