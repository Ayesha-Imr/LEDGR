import React, { useEffect, useState } from 'react';
import { Wallet, Plus, Edit2, Trash2 } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { useStore } from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { format, parseISO } from 'date-fns';
import { getCurrencySymbol, formatCurrency } from '../utils/currency';
import type { Budget } from '../types/types';

const BudgetsPage: React.FC = () => {
  const { budgets, getBudgetUsage, fetchBudgets, createBudget, updateBudget, deleteBudget, isLoading } = useDataStore();
  const { user } = useStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // Form state
  const [periodType, setPeriodType] = useState<'monthly' | 'weekly'>('monthly');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [category, setCategory] = useState('');
  
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);
  
  const budgetUsage = getBudgetUsage();
  const currencySymbol = getCurrencySymbol(user?.preferred_currency || 'USD');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBudget) {
      // Update existing budget
      await updateBudget(editingBudget.id, {
        period_type: periodType,
        amount: parseFloat(amount),
        start_date: startDate,
        category: category || null,
      });
    } else {
      // Create new budget
      await createBudget({
        period_type: periodType,
        amount: parseFloat(amount),
        start_date: startDate,
        category: category || null,
      });
    }
    
    // Reset form
    resetForm();
  };
  
  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setPeriodType(budget.period_type);
    setAmount(budget.amount.toString());
    setStartDate(budget.start_date.substring(0, 10)); // Get YYYY-MM-DD part
    setCategory(budget.category || '');
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(id);
    }
  };
  
  const resetForm = () => {
    setEditingBudget(null);
    setPeriodType('monthly');
    setAmount('');
    setStartDate('');
    setCategory('');
    setShowForm(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
        
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Budget'}
        </Button>
      </div>
      
      {/* Budget Form */}
      {showForm && (
        <Card title={editingBudget ? 'Edit Budget' : 'Create New Budget'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="periodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period Type
                </label>
                <select
                  id="periodType"
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as 'monthly' | 'weekly')}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">{currencySymbol}</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Groceries, Entertainment"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for an overall budget across all categories
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={editingBudget ? 'secondary' : 'primary'}
                isLoading={isLoading.budgets}
              >
                {editingBudget ? 'Update Budget' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      {/* Budgets List */}
      {isLoading.budgets ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : budgetUsage.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Wallet className="w-full h-full" />}
            title="No budgets yet"
            description="Create your first budget to start tracking your spending against targets."
            action={
              <Button
                variant="primary"
                icon={<Plus size={18} />}
                onClick={() => setShowForm(true)}
              >
                Create Budget
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgetUsage.map(({ budget, spent, remaining, percentage }) => (
            <Card key={budget.id} className="relative">
              {/* Budget actions */}
              <div className="absolute top-4 right-4 flex space-x-1">
                <button
                  onClick={() => handleEdit(budget)}
                  className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Edit budget"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="p-1.5 rounded-full text-gray-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Delete budget"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {/* Budget header */}
              <div className="mb-4">
                <div className="flex items-center">
                  <Wallet className="w-5 h-5 text-emerald-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {budget.period_type.charAt(0).toUpperCase() + budget.period_type.slice(1)} Budget
                  </h3>
                </div>
                {budget.category && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Category: <span className="font-medium">{budget.category}</span>
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Starting {format(parseISO(budget.start_date), 'MMMM d, yyyy')}
                </p>
              </div>
              
              {/* Budget amount */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Budget:</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(budget.amount, user?.preferred_currency || 'USD')}
                </span>
              </div>
              
              {/* Spent amount */}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Spent:</span>
                <span className={`text-lg font-medium ${
                  percentage > 100 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {formatCurrency(spent, user?.preferred_currency || 'USD')}
                </span>
              </div>
              
              {/* Remaining amount */}
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Remaining:</span>
                <span className={`text-lg font-medium ${
                  remaining < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {formatCurrency(remaining, user?.preferred_currency || 'USD')}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      percentage > 100 
                        ? 'bg-red-600' 
                        : percentage > 85 
                          ? 'bg-yellow-500' 
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
                  <span className={`text-xs font-medium ${
                    percentage > 100 
                      ? 'text-red-600 dark:text-red-400' 
                      : percentage > 85 
                        ? 'text-yellow-600 dark:text-yellow-400' 
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;