import { create } from 'zustand';
import { authService } from '../services/auth.service';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initialize: () => {
    const user = authService.getSession();
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  register: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.register(email, password, name);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
