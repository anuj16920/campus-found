import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/auth.service'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      error: null,

      setUser: (user) => set({ user, isLoading: false, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error, isLoading: false }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.loginWithEmail(email, password)
          set({ user, isLoading: false })
          return user
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.loginWithGoogle()
          set({ user, isLoading: false })
          return user
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.registerWithEmail(email, password, name)
          set({ user, isLoading: false })
          return user
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({ user: null, isLoading: false })
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      verifyAuth: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.verifyAuth()
          set({ user, isLoading: false })
          return user
        } catch (error) {
          set({ user: null, isLoading: false })
          return null
        }
      },

      updateProfile: async (updates) => {
        const currentUser = get().user
        if (!currentUser) throw new Error('Not authenticated')
        
        try {
          const updatedUser = await authService.updateProfile(updates)
          set({ user: { ...currentUser, ...updatedUser } })
          return updatedUser
        } catch (error) {
          set({ error: error.message })
          throw error
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'campusfind-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
