import axios from 'axios';
import { supabase } from '../config/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get session from Supabase
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session?.access_token) {
      config.headers.Authorization = `Bearer ${sessionData.session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - sign out
      await supabase.auth.signOut();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
