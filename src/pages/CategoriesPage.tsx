import React, { useEffect, useState } from 'react';
import { PieChart, Filter, Package } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useStore } from '../store/authStore';
import Card from '../components/common/Card';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/currency';

const CategoriesPage: React.FC = () => {
  const { lineItems, fetchLineItems, isLoading } = useDataStore();
  const { user } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'date' | 'name'>('price');
  
  useEffect(() => {
    // Fetch all line items (without orderId filter)
    fetchLineItems();
  }, [fetchLineItems]);
  
  // Get unique categories
  const categories = [...new Set(lineItems.map(item => item.category))].sort();
  
  // Group line items by category
  const itemsByCategory: Record<string, typeof lineItems> = {};
  
  categories.forEach(category => {
    itemsByCategory[category] = lineItems.filter(item => item.category === category);
  });
  
  // Sort items in the selected category
  const sortedItems = selectedCategory ? [...itemsByCategory[selectedCategory]].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (b.price * b.quantity) - (a.price * a.quantity);
      case 'name':
        return a.item_name.localeCompare(b.item_name);
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  }) : [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
      </div>
      
      {isLoading.lineItems ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PieChart className="w-full h-full" />}
            title="No categories yet"
            description="Forward an order-related email to your unique LEDGR email address to get started."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories list */}
          <div className="lg:col-span-1">
            <Card title="All Categories">
              <div className="space-y-2">
                {categories.map((category) => {
                  const itemCount = itemsByCategory[category].length;
                  const totalSpent = itemsByCategory[category].reduce(
                    (sum, item) => sum + (item.price * item.quantity), 
                    0
                  );
                  
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                        {formatCurrency(totalSpent, user?.preferred_currency || 'USD')} total spent
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
          
          {/* Category details */}
          <div className="lg:col-span-2">
            {selectedCategory ? (
              <Card title={`${selectedCategory} Items`}>
                <div className="mb-4 flex justify-end">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Filter size={16} />}
                      onClick={() => {
                        // Cycle through sort options
                        if (sortBy === 'price') setSortBy('name');
                        else if (sortBy === 'name') setSortBy('date');
                        else setSortBy('price');
                      }}
                    >
                      Sort by: {sortBy === 'price' ? 'Price' : sortBy === 'name' ? 'Name' : 'Date'}
                    </Button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedItems.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                              {item.item_name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price * item.quantity, user?.preferred_currency || 'USD')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card>
                <div className="py-12 text-center">
                  <PieChart size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Select a category
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a category from the list to see its items
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;