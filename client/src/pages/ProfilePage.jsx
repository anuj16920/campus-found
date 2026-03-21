import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Loader2, Settings, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { userService } from '../services/post.service'
import { useAuthStore } from '../stores/auth.store'
import PostCard from '../components/PostCard'
import EmptyState from '../components/EmptyState'

export default function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuthStore()
  const profileId = id || currentUser?.id
  const isOwn = !id || id === currentUser?.id

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => userService.getUser(profileId),
    enabled: !!profileId,
  })

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', profileId],
    queryFn: () => userService.getUserPosts(profileId),
    enabled: !!profileId,
  })

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <EmptyState
        title="User not found"
        description="This user may not exist."
        actionLabel="Go Home"
        actionLink="/"
      />
    )
  }

  const posts = postsData?.posts || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white mb-1">
              {profile.name || 'Anonymous'}
            </h1>
            <p className="text-dark-400 mb-4">{profile.email}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-dark-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
              </span>
            </div>
          </div>

          {/* Actions */}
          {isOwn && (
            <div className="flex gap-2">
              <button className="btn-outline">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-600">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{profile.posts_count || 0}</p>
            <p className="text-sm text-dark-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{profile.saved_count || 0}</p>
            <p className="text-sm text-dark-400">Saved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
            </p>
            <p className="text-sm text-dark-400">Likes</p>
          </div>
        </div>
      </motion.div>

      {/* User's Posts */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">Posts</h2>
        
        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description={isOwn ? "You haven't posted any items yet." : "This user hasn't posted any items yet."}
            actionLabel={isOwn ? "Post an Item" : null}
            actionLink={isOwn ? "/create" : null}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
