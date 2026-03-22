import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import CreatePostPage from './pages/CreatePostPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import ConversationsPage from './pages/ConversationsPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<HomePage />} />
        <Route path="post/:id" element={<PostDetailPage />} />
        <Route path="create" element={<CreatePostPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="chat" element={<ConversationsPage />} />
        <Route path="chat/:id" element={<ChatPage />} />
      </Route>
    </Routes>
  )
}
