import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { supabase } from './config/supabase';
import useAuthStore from './stores/auth.store';

// Initialize auth state listener
const initializeAuthListener = () => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const authStore = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session) {
      try {
        // Verify with backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: session.access_token }),
        });
        
        if (response.ok) {
          const data = await response.json();
          useAuthStore.setState({ 
            user: data.user, 
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          useAuthStore.setState({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        useAuthStore.setState({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false
        });
      }
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      });
    }
  });
};

// Initialize auth on app load
const initAuth = async () => {
  const authStore = useAuthStore.getState();
  await authStore.initialize();
  initializeAuthListener();
};

initAuth();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
