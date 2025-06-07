import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingBag, Tag } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useStore } from '../store/authStore';
import Card from '../components/common/Card';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from '../utils/currency';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, lineItems, fetchLineItems, isLoading } = useDataStore();
  const { user } = useStore();
  const [order, setOrder] = useState<any>(null);
  
  // Find the order by ID
  useEffect(() => {
    if (orderId) {
      const foundOrder = orders.find(o => o.id === orderId);
      setOrder(foundOrder);
      
      // Fetch line items for this order
      fetchLineItems(orderId);
    }
  }, [orderId, orders, fetchLineItems]);
  
  // Filter line items for this order
  const orderLineItems = orderId ? lineItems.filter(item => item.order_id === orderId) : [];
  
  if (isLoading.lineItems) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link to="/dashboard" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mr-2">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order not found</h1>
        </div>
        <Card>
          <p className="text-gray-600 dark:text-gray-400">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link 
            to="/dashboard"
            className="inline-block mt-4 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Back to dashboard
          </Link>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link to="/dashboard" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mr-2">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.vendor_name}</h1>
      </div>
      
      {/* Order summary */}
      <Card>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Order Summary</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Order processed on {format(parseISO(order.order_date), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-md">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Total Amount</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(order.total_amount, user?.preferred_currency || 'USD')}
            </p>
          </div>
        </div>
      </Card>
      
      {/* Line items */}
      <Card title="Items">
        {orderLineItems.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No items found for this order.</p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {orderLineItems.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {item.item_name}
                      </h3>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200">
                          <Tag size={12} className="mr-1" />
                          {item.category}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          <ShoppingBag size={12} className="inline mr-1" />
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity, user?.preferred_currency || 'USD')}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.price, user?.preferred_currency || 'USD')} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrderDetailPage;