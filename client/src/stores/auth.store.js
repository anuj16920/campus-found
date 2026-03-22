import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const user = authService.getSession();
    set({ user, isAuthenticated: !!user });
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(email, password, name);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
