import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Order, LineItem, Budget, CategorySpending, MonthlySpending, VendorSpending, BudgetUsage } from '../types/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { useStore as useAuthStore } from './authStore';

interface DataState {
  orders: Order[];
  lineItems: LineItem[];
  budgets: Budget[];
  isLoading: {
    orders: boolean;
    lineItems: boolean;
    budgets: boolean;
  };
  error: string | null;
  
  fetchOrders: () => Promise<void>;
  fetchLineItems: (orderId?: string) => Promise<void>;
  fetchBudgets: () => Promise<void>;
  createBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Computed properties
  getCategorySpending: () => CategorySpending[];
  getMonthlySpending: () => MonthlySpending[];
  getVendorSpending: () => VendorSpending[];
  getBudgetUsage: () => BudgetUsage[];
}

export const useDataStore = create<DataState>((set, get) => ({
  orders: [],
  lineItems: [],
  budgets: [],
  isLoading: {
    orders: false,
    lineItems: false,
    budgets: false,
  },
  error: null,
  
  fetchOrders: async () => {
    try {
      set((state) => ({ 
        isLoading: { ...state.isLoading, orders: true },
        error: null 
      }));
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      set((state) => ({ 
        orders: data || [],
        isLoading: { ...state.isLoading, orders: false } 
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      set((state) => ({ 
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
        isLoading: { ...state.isLoading, orders: false } 
      }));
    }
  },
  
  fetchLineItems: async (orderId) => {
    try {
      set((state) => ({ 
        isLoading: { ...state.isLoading, lineItems: true },
        error: null 
      }));
      
      let query = supabase.from('line_items').select('*');
      
      if (orderId) {
        query = query.eq('order_id', orderId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      set((state) => ({ 
        lineItems: data || [],
        isLoading: { ...state.isLoading, lineItems: false } 
      }));
    } catch (error) {
      console.error('Error fetching line items:', error);
      set((state) => ({ 
        error: error instanceof Error ? error.message : 'Failed to fetch line items',
        isLoading: { ...state.isLoading, lineItems: false } 
      }));
    }
  },
  
  fetchBudgets: async () => {
    try {
      set((state) => ({ 
        isLoading: { ...state.isLoading, budgets: true },
        error: null 
      }));
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      set((state) => ({ 
        budgets: data || [],
        isLoading: { ...state.isLoading, budgets: false } 
      }));
    } catch (error) {
      console.error('Error fetching budgets:', error);
      set((state) => ({ 
        error: error instanceof Error ? error.message : 'Failed to fetch budgets',
        isLoading: { ...state.isLoading, budgets: false } 
      }));
    }
  },
  
  createBudget: async (budget) => {
    try {
      set({ error: null });
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: userData.user.id,
          period_type: budget.period_type,
          amount: budget.amount,
          start_date: budget.start_date,
          category: budget.category,
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      // Refresh budgets
      await get().fetchBudgets();
      
    } catch (error) {
      console.error('Error creating budget:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create budget',
      });
    }
  },
  
  updateBudget: async (id, updates) => {
    try {
      set({ error: null });
      
      const { error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh budgets
      await get().fetchBudgets();
      
    } catch (error) {
      console.error('Error updating budget:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update budget',
      });
    }
  },
  
  deleteBudget: async (id) => {
    try {
      set({ error: null });
      
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Refresh budgets
      await get().fetchBudgets();
      
    } catch (error) {
      console.error('Error deleting budget:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete budget',
      });
    }
  },
  
  // Computed properties
  getCategorySpending: () => {
    const { lineItems } = get();
    const { user } = useAuthStore.getState();
    
    // Calculate total spending
    const totalSpending = lineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Group by category
    const categories: Record<string, { amount: number; count: number }> = {};
    
    lineItems.forEach((item) => {
      const amount = item.price * item.quantity;
      
      if (!categories[item.category]) {
        categories[item.category] = { amount: 0, count: 0 };
      }
      
      categories[item.category].amount += amount;
      categories[item.category].count += 1;
    });
    
    // Convert to array and calculate percentages
    return Object.entries(categories).map(([category, { amount, count }]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      count,
    })).sort((a, b) => b.amount - a.amount);
  },
  
  getMonthlySpending: () => {
    const { orders } = get();
    const { user } = useAuthStore.getState();
    
    // Group by month/year
    const months: Record<string, { amount: number; year: number }> = {};
    
    orders.forEach((order) => {
      const date = parseISO(order.order_date);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM');
      const year = date.getFullYear();
      
      if (!months[monthKey]) {
        months[monthKey] = { amount: 0, year };
      }
      
      months[monthKey].amount += order.total_amount;
    });
    
    // Convert to array
    return Object.entries(months).map(([key, { amount, year }]) => ({
      month: format(parseISO(`${key}-01`), 'MMM'),
      year,
      amount,
    })).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month.localeCompare(b.month);
    });
  },
  
  getVendorSpending: () => {
    const { orders } = get();
    const { user } = useAuthStore.getState();
    
    // Group by vendor
    const vendors: Record<string, { amount: number; count: number }> = {};
    
    orders.forEach((order) => {
      if (!vendors[order.vendor_name]) {
        vendors[order.vendor_name] = { amount: 0, count: 0 };
      }
      
      vendors[order.vendor_name].amount += order.total_amount;
      vendors[order.vendor_name].count += 1;
    });
    
    // Convert to array
    return Object.entries(vendors).map(([vendor, { amount, count }]) => ({
      vendor,
      amount,
      count,
    })).sort((a, b) => b.amount - a.amount);
  },
  
  getBudgetUsage: () => {
    const { budgets, orders, lineItems } = get();
    const now = new Date();
    
    return budgets.map((budget) => {
      const startDate = parseISO(budget.start_date);
      let endDate;
      
      if (budget.period_type === 'monthly') {
        endDate = endOfMonth(startDate);
      } else { // weekly
        endDate = endOfWeek(startDate);
      }
      
      // Calculate total spent for this budget period
      let spent = 0;
      
      if (budget.category) {
        // Category-specific budget
        const relevantLineItems = lineItems.filter(item => {
          const order = orders.find(o => o.id === item.order_id);
          if (!order) return false;
          
          const orderDate = parseISO(order.order_date);
          return (
            item.category === budget.category &&
            isWithinInterval(orderDate, { start: startDate, end: endDate })
          );
        });
        
        spent = relevantLineItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      } else {
        // General budget (all categories)
        const relevantOrders = orders.filter(order => 
          isWithinInterval(parseISO(order.order_date), { start: startDate, end: endDate })
        );
        
        spent = relevantOrders.reduce((sum, order) => sum + order.total_amount, 0);
      }
      
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;
      
      return {
        budget,
        spent,
        remaining,
        percentage,
      };
    });
  },
}));