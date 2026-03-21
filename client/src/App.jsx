import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/auth.store'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import CreatePostPage from './pages/CreatePostPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage from './pages/ProfilePage'
import SavedPostsPage from './pages/SavedPostsPage'
import MyClaimsPage from './pages/MyClaimsPage'
import PostClaimsPage from './pages/PostClaimsPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  return children
}

function PublicRoute({ children }) {
  const { user, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<HomePage />} />
          <Route path="post/:id" element={<PostDetailPage />} />
          
          {/* Protected Routes */}
          <Route path="create" element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          } />
          <Route path="profile/:id?" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="saved" element={
            <ProtectedRoute>
              <SavedPostsPage />
            </ProtectedRoute>
          } />
          <Route path="claims" element={
            <ProtectedRoute>
              <MyClaimsPage />
            </ProtectedRoute>
          } />
          <Route path="post/:id/claims" element={
            <ProtectedRoute>
              <PostClaimsPage />
            </ProtectedRoute>
          } />
          
          {/* Public Routes */}
          <Route path="auth" element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } />
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}
