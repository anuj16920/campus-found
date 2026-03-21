import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { api } from './api.service'

const googleProvider = new GoogleAuthProvider()

export const authService = {
  // Firebase Auth methods
  loginWithEmail: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const idToken = await userCredential.user.getIdToken()
    
    // Verify with backend
    const response = await api.post('/auth/verify', { idToken })
    return response.data.user
  },

  registerWithEmail: async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName: name })
    await userCredential.user.reload()
    
    const idToken = await userCredential.user.getIdToken()
    
    // Verify with backend
    const response = await api.post('/auth/verify', { idToken })
    return response.data.user
  },

  loginWithGoogle: async () => {
    const userCredential = await signInWithPopup(auth, googleProvider)
    const idToken = await userCredential.user.getIdToken()
    
    // Verify with backend
    const response = await api.post('/auth/verify', { idToken })
    return response.data.user
  },

  logout: async () => {
    await signOut(auth)
  },

  verifyAuth: async () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe()
        
        if (!firebaseUser) {
          resolve(null)
          return
        }

        try {
          const idToken = await firebaseUser.getIdToken()
          const response = await api.post('/auth/verify', { idToken })
          resolve(response.data.user)
        } catch (error) {
          resolve(null)
        }
      }, reject)
    })
  },

  getCurrentUser: () => auth.currentUser,

  onAuthChange: (callback) => {
    return onAuthStateChanged(auth, callback)
  },

  async getIdToken() {
    const user = auth.currentUser
    if (user) {
      return await user.getIdToken()
    }
    return null
  }
}
