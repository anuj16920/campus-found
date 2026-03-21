import { supabase } from '../config/supabase';
import { api } from './api.service';

export const authService = {
  // Sign up with email and password
  registerWithEmail: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });
    
    if (error) throw error;
    
    // Get session token
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      // Verify with backend
      const response = await api.post('/auth/verify', { 
        token: sessionData.session.access_token 
      });
      return response.data.user;
    }
    
    return data.user;
  },

  // Sign in with email and password
  loginWithEmail: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Get session token
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      // Verify with backend
      const response = await api.post('/auth/verify', { 
        token: sessionData.session.access_token 
      });
      return response.data.user;
    }
    
    return data.user;
  },

  // Sign in with Google OAuth
  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  },

  // Get current user
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  },

  // Verify auth with backend
  verifyAuth: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData?.session) {
      return null;
    }

    try {
      const response = await api.post('/auth/verify', { 
        token: sessionData.session.access_token 
      });
      return response.data.user;
    } catch (error) {
      console.error('Backend verification failed:', error);
      return null;
    }
  },

  // Listen to auth state changes
  onAuthChange: (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Verify with backend
        try {
          const response = await api.post('/auth/verify', { 
            token: session.access_token 
          });
          callback(event, response.data.user);
        } catch (error) {
          console.error('Backend verification failed:', error);
          callback(event, null);
        }
      } else if (event === 'SIGNED_OUT') {
        callback(event, null);
      } else {
        callback(event, session?.user || null);
      }
    });
    
    return () => subscription.unsubscribe();
  },

  // Get access token
  getAccessToken: async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      return sessionData.session.access_token;
    }
    return null;
  }
};

export default authService;
