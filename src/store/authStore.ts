import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { User } from '../types/types';

const main = 	'3a3515b0fde9bd62a7644b11a512933b'

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  emailForwardingAddress: string;
  
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (preferences: { preferred_currency: string }) => Promise<void>;
}

export const useStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  emailForwardingAddress: '',
  
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get user preferences
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('preferred_currency')
          .eq('user_id', session.user.id)
          .single();

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          preferred_currency: preferences?.preferred_currency || 'USD',
        };
        
        // Set the email forwarding address
        const forwardingDomain = import.meta.env.VITE_FORWARDING_EMAIL_DOMAIN || 'your-inbound-domain.com';
        const emailForwardingAddress = `${main}+${user.id}@${forwardingDomain}`;
        
        set({
          user,
          emailForwardingAddress,
          isLoading: false,
        });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({
        user: null,
        error: 'Failed to initialize authentication',
        isLoading: false,
      });
    }
  },
  
  updatePreferences: async (preferences) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferred_currency: preferences.preferred_currency,
        });

      if (error) throw error;

      set(state => ({
        user: state.user ? {
          ...state.user,
          preferred_currency: preferences.preferred_currency,
        } : null,
      }));
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Get user preferences
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('preferred_currency')
          .eq('user_id', data.user.id)
          .single();

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          preferred_currency: preferences?.preferred_currency || 'USD',
        };
        
        // Set the email forwarding address
        const forwardingDomain = import.meta.env.VITE_FORWARDING_EMAIL_DOMAIN || 'your-inbound-domain.com';
        const emailForwardingAddress = `${main}+${user.id}@${forwardingDomain}`;
        
        set({
          user,
          emailForwardingAddress,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to login',
        isLoading: false,
      });
    }
  },
  
  signup: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        // Create user preferences with default currency
        await supabase
          .from('user_preferences')
          .insert({
            user_id: data.user.id,
            preferred_currency: 'USD',
          });

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          preferred_currency: 'USD',
        };
        
        // Set the email forwarding address
        const forwardingDomain = import.meta.env.VITE_FORWARDING_EMAIL_DOMAIN || 'your-inbound-domain.com';
        const emailForwardingAddress = `${main}+${user.id}@${forwardingDomain}`;
        
        set({
          user,
          emailForwardingAddress,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to sign up',
        isLoading: false,
      });
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      set({
        user: null,
        emailForwardingAddress: '',
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to logout',
        isLoading: false,
      });
    }
  },
}));

// Initialize auth state when the store is created
useStore.getState().initialize();