import axios from 'axios'
import { authService } from './auth.service'

// 🔥 FIXED: remove fallback, force correct API URL
const BASE_URL = import.meta.env.VITE_API_URL

// 🔥 Optional debug (you can remove later)
console.log("API URL:", BASE_URL)

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 🔐 Request interceptor to add Firebase token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await authService.getIdToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      // Ignore token errors
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ⚠️ Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api
