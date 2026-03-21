import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check for existing session
      const session = authService.getSession();
      
      if (session) {
        // Verify session with backend
        const user = await authService.verifyAuth();
        if (user) {
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } else {
          // Session exists but backend verification failed
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.message 
      });
    }
  },

  // Sign up
  register: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.registerWithEmail(email, password, name);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.message || 'Registration failed' 
      });
      throw error;
    }
  },

  // Login with email
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.loginWithEmail(email, password);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return user;
    } catch (error) {
      console.error('Login error:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: error.message || 'Login failed' 
      });
      throw error;
    }
  },

  // Login with Google
  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      const result = await authService.loginWithGoogle();
      // OAuth will redirect, so we just set loading false
      // The callback will handle the actual user update
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error('Google login error:', error);
      set({ 
        isLoading: false,
        error: error.message || 'Google login failed' 
      });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authService.logout();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        isLoading: false,
        error: error.message || 'Logout failed' 
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
