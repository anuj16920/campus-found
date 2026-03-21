import { Link } from 'react-router-dom'
import { Heart, Bookmark, MapPin, Calendar, MessageCircle, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuthStore } from '../stores/auth.store'
import { postService } from '../services/post.service'
import { usePostStore } from '../stores/post.store'
import toast from 'react-hot-toast'

const categoryLabels = {
  electronics: 'Electronics',
  documents: 'Documents',
  bags: 'Bags & Luggage',
  jewelry: 'Jewelry',
  clothing: 'Clothing',
  keys: 'Keys',
  phones: 'Phones',
  wallets: 'Wallets',
  other: 'Other',
}

export default function PostCard({ post, onDelete }) {
  const { user } = useAuthStore()
  const { updatePostInFeed } = usePostStore()
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isOwner = user?.id === post.user_id

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please sign in to like posts')
      return
    }
    
    if (isLiking) return
    setIsLiking(true)

    try {
      const wasLiked = post.is_liked
      // Optimistic update
      updatePostInFeed(post.id, { 
        is_liked: !wasLiked, 
        likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1 
      })

      if (wasLiked) {
        await postService.unlikePost(post.id)
      } else {
        await postService.likePost(post.id)
      }
    } catch (error) {
      // Revert on error
      updatePostInFeed(post.id, { 
        is_liked: post.is_liked, 
        likes_count: post.likes_count 
      })
      toast.error('Failed to update like')
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please sign in to save posts')
      return
    }
    
    if (isSaving) return
    setIsSaving(true)

    try {
      const wasSaved = post.is_saved
      // Optimistic update
      updatePostInFeed(post.id, { is_saved: !wasSaved })

      if (wasSaved) {
        await postService.unsavePost(post.id)
        toast.success('Removed from saved')
      } else {
        await postService.savePost(post.id)
        toast.success('Saved for later')
      }
    } catch (error) {
      // Revert on error
      updatePostInFeed(post.id, { is_saved: post.is_saved })
      toast.error('Failed to update save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      await postService.deletePost(post.id)
      toast.success('Post deleted')
      onDelete?.(post.id)
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card card-hover"
    >
      <Link to={`/post/${post.id}`} className="block">
        {/* Image */}
        <div className="aspect-[4/3] bg-dark-700 overflow-hidden relative">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.querySelector('.image-placeholder').style.display = 'flex'
              }}
            />
          ) : null}
          <div 
            className="image-placeholder absolute inset-0 flex items-center justify-center bg-dark-700"
            style={{ display: post.image_url ? 'none' : 'flex' }}
          >
            <div className="text-center text-dark-500">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">No image</div>
            </div>
          </div>
          
          {/* Type badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
            post.type === 'found' 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-amber-500/90 text-white'
          }`}>
            {post.type === 'found' ? 'Found' : 'Lost'}
          </div>

          {/* Category badge */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-dark-900/80 text-white backdrop-blur-sm">
            {categoryLabels[post.category] || post.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white line-clamp-2 mb-2">
            {post.title}
          </h3>

          {post.description && (
            <p className="text-dark-300 text-sm line-clamp-2 mb-3">
              {post.description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-sm text-dark-400 mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {post.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDistanceToNow(new Date(post.date_found || post.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* User info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={post.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {post.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm text-dark-300">
                {post.user?.name || 'Anonymous'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`btn-ghost p-2 rounded-full ${
                  post.is_liked ? 'text-red-500' : 'text-dark-400'
                }`}
              >
                <Heart 
                  className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} 
                />
                <span className="text-sm">{post.likes_count || 0}</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`btn-ghost p-2 rounded-full ${
                  post.is_saved ? 'text-primary-500' : 'text-dark-400'
                }`}
              >
                <Bookmark 
                  className={`w-5 h-5 ${post.is_saved ? 'fill-current' : ''}`} 
                />
              </button>

              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="btn-ghost p-2 rounded-full text-dark-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
