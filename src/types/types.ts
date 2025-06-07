export interface User {
  id: string;
  email: string;
  preferred_currency: string;
}

export interface Order {
  id: string;
  user_id: string;
  forwarded_email_id: string;
  vendor_name: string;
  order_date: string;
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface LineItem {
  id: string;
  order_id: string;
  user_id: string;
  item_name: string;
  price: number;
  quantity: number;
  category: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  period_type: 'monthly' | 'weekly';
  amount: number;
  start_date: string;
  category: string | null;
  created_at: string;
}

export interface BudgetUsage {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlySpending {
  month: string;
  year: number;
  amount: number;
}

export interface VendorSpending {
  vendor: string;
  amount: number;
  count: number;
}