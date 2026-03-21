import { create } from 'zustand'

export const usePostStore = create((set, get) => ({
  // Feed state
  posts: [],
  isLoadingFeed: false,
  feedError: null,
  feedPage: 1,
  hasMoreFeed: true,

  // Filters
  filters: {
    category: null,
    location: null,
    search: null,
    type: null,
    sort: 'latest',
  },

  // Selected post
  selectedPost: null,
  isLoadingPost: false,

  // Actions
  setPosts: (posts) => set({ posts }),
  
  appendPosts: (newPosts) => set((state) => ({
    posts: [...state.posts, ...newPosts]
  })),

  setLoadingFeed: (isLoadingFeed) => set({ isLoadingFeed }),
  setFeedError: (feedError) => set({ feedError }),
  
  setFeedPage: (feedPage) => set({ feedPage }),
  setHasMoreFeed: (hasMoreFeed) => set({ hasMoreFeed }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
    posts: [], // Reset posts when filters change
    feedPage: 1,
    hasMoreFeed: true,
  })),

  resetFilters: () => set({
    filters: {
      category: null,
      location: null,
      search: null,
      type: null,
      sort: 'latest',
    },
    posts: [],
    feedPage: 1,
    hasMoreFeed: true,
  }),

  setSelectedPost: (selectedPost) => set({ selectedPost }),
  setLoadingPost: (isLoadingPost) => set({ isLoadingPost }),

  updatePostInFeed: (postId, updates) => set((state) => ({
    posts: state.posts.map((post) =>
      post.id === postId ? { ...post, ...updates } : post
    ),
    selectedPost: state.selectedPost?.id === postId
      ? { ...state.selectedPost, ...updates }
      : state.selectedPost,
  })),

  removePostFromFeed: (postId) => set((state) => ({
    posts: state.posts.filter((post) => post.id !== postId),
  })),

  addPost: (post) => set((state) => ({
    posts: [post, ...state.posts],
  })),

  clearFeed: () => set({
    posts: [],
    feedPage: 1,
    hasMoreFeed: true,
  }),
}))
