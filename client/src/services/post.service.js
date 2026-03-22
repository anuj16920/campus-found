import { api } from './api.service'

export const postService = {
  // Get posts with filters and pagination
  getPosts: async (params = {}) => {
    const response = await api.get('/posts', { params })
    return response.data
  },

  // Get single post
  getPost: async (id) => {
    const response = await api.get(`/posts/${id}`)
    return response.data
  },

  // Create post
  createPost: async (postData) => {
    const response = await api.post('/posts', postData)
    return response.data
  },

  // Update post
  updatePost: async (id, updates) => {
    const response = await api.put(`/posts/${id}`, updates)
    return response.data
  },

  // Delete post
  deletePost: async (id) => {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  },

  // Like post
  likePost: async (id) => {
    const response = await api.post(`/posts/${id}/like`)
    return response.data
  },

  // Unlike post
  unlikePost: async (id) => {
    const response = await api.delete(`/posts/${id}/like`)
    return response.data
  },

  // Save post
  savePost: async (id) => {
    const response = await api.post(`/posts/${id}/save`)
    return response.data
  },

  // Unsave post
  unsavePost: async (id) => {
    const response = await api.delete(`/posts/${id}/save`)
    return response.data
  },

  // Create claim
  createClaim: async (postId, message) => {
    const response = await api.post(`/claims/${postId}`, { message })
    return response.data
  },

  // Get user's claims
  getMyClaims: async (params = {}) => {
    const response = await api.get('/claims/user', { params })
    return response.data
  },

  // Get claims for a post (owner only)
  getPostClaims: async (postId) => {
    const response = await api.get(`/claims/post/${postId}`)
    return response.data
  },

  // Update claim status (owner only)
  updateClaim: async (claimId, status) => {
    const response = await api.put(`/claims/${claimId}`, { status })
    return response.data
  },

  // Get categories with counts
  getCategories: async () => {
    const response = await api.get('/posts/meta/categories')
    return response.data
  },
}

// User service
export const userService = {
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  getUserPosts: async (id, params = {}) => {
    const response = await api.get(`/users/${id}/posts`, { params })
    return response.data
  },

  getSavedPosts: async (params = {}) => {
    const response = await api.get('/users/me/saved', { params })
    return response.data
  },

  updateProfile: async (updates) => {
    const response = await api.put('/users/me', updates)
    return response.data
  },

  getUserStats: async (id) => {
    const response = await api.get(`/users/${id}/stats`)
    return response.data
  },
}

// Upload service - sends to backend which uploads to Supabase
export const uploadService = {
  uploadImage: async (file) => {
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file)
      
      const response = await api.post('/uploads/image', {
        image: base64,
        filename: file.name,
        contentType: file.type
      })

      return {
        key: response.data.key,
        public_url: response.data.public_url
      }
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  },

  deleteImage: async (key) => {
    try {
      const response = await api.delete(`/uploads/${encodeURIComponent(key)}`)
      return response.data
    } catch (error) {
      console.error('Delete image error:', error)
      throw error
    }
  },
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // Remove data URL prefix to get just base64
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
