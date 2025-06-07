// This is a simplified type definition for the Supabase database
// In a real project, you would generate these types using Supabase CLI

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      budgets: {
        Row: {
          id: string
          user_id: string
          period_type: 'monthly' | 'weekly'
          amount: number
          start_date: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          period_type: 'monthly' | 'weekly'
          amount: number
          start_date: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          period_type?: 'monthly' | 'weekly'
          amount?: number
          start_date?: string
          category?: string | null
          created_at?: string
        }
      }
      forwarded_emails: {
        Row: {
          id: string
          user_id: string
          raw_email: Json
          status: 'pending_parsing' | 'processed' | 'parsing_failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          raw_email: Json
          status?: 'pending_parsing' | 'processed' | 'parsing_failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          raw_email?: Json
          status?: 'pending_parsing' | 'processed' | 'parsing_failed'
          created_at?: string
        }
      }
      line_items: {
        Row: {
          id: string
          order_id: string
          name: string
          price: number
          quantity: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          name: string
          price: number
          quantity: number
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          name?: string
          price?: number
          quantity?: number
          category?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          forwarded_email_id: string
          vendor_name: string
          order_date: string
          total_amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          forwarded_email_id: string
          vendor_name: string
          order_date: string
          total_amount: number
          currency: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          forwarded_email_id?: string
          vendor_name?: string
          order_date?: string
          total_amount?: number
          currency?: string
          created_at?: string
        }
      }
    }
  }
}