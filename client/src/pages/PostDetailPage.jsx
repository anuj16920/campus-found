import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Heart, Bookmark, MapPin, Calendar, ArrowLeft, User,
  MessageCircle, AlertTriangle, Check, Loader2
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { postService } from '../services/post.service'
import { useAuthStore } from '../stores/auth.store'
import { usePostStore } from '../stores/post.store'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'

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

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { updatePostInFeed } = usePostStore()
  const queryClient = useQueryClient()
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimMessage, setClaimMessage] = useState('')

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPost(id),
  })

  const likeMutation = useMutation({
    mutationFn: () => post?.is_liked 
      ? postService.unlikePost(id)
      : postService.likePost(id),
    onMutate: () => {
      updatePostInFeed(id, {
        is_liked: !post?.is_liked,
        likes_count: post?.is_liked ? post.likes_count - 1 : post.likes_count + 1
      })
    },
    onError: () => {
      updatePostInFeed(id, { is_liked: post?.is_liked, likes_count: post?.likes_count })
      toast.error('Failed to update like')
    }
  })

  const saveMutation = useMutation({
    mutationFn: () => post?.is_saved
      ? postService.unsavePost(id)
      : postService.savePost(id),
    onMutate: () => {
      updatePostInFeed(id, { is_saved: !post?.is_saved })
    },
    onSuccess: () => {
      toast.success(post?.is_saved ? 'Removed from saved' : 'Saved!')
    },
    onError: () => {
      updatePostInFeed(id, { is_saved: post?.is_saved })
      toast.error('Failed to update save')
    }
  })

  const claimMutation = useMutation({
    mutationFn: () => postService.createClaim(id, claimMessage),
    onSuccess: () => {
      toast.success('Claim submitted! The poster will be notified.')
      setShowClaimModal(false)
      setClaimMessage('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to submit claim')
    }
  })

  const handleLike = () => {
    if (!user) {
      toast.error('Please sign in first')
      return
    }
    likeMutation.mutate()
  }

  const handleSave = () => {
    if (!user) {
      toast.error('Please sign in first')
      return
    }
    saveMutation.mutate()
  }

  const handleClaim = () => {
    if (!user) {
      toast.error('Please sign in first')
      return
    }
    setShowClaimModal(true)
  }

  const submitClaim = () => {
    if (!claimMessage.trim()) {
      toast.error('Please describe why this is yours')
      return
    }
    claimMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <EmptyState
        title="Post not found"
        description="This post may have been deleted or doesn't exist."
        actionLabel="Go Home"
        actionLink="/"
      />
    )
  }

  const isOwner = user?.id === post.user_id
  const postDate = new Date(post.date_found || post.created_at)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aspect-square lg:aspect-auto lg:h-full bg-dark-800 rounded-2xl overflow-hidden"
        >
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              post.type === 'found' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {post.type === 'found' ? '✨ Found' : '🔍 Lost'}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-dark-700 text-white">
              {categoryLabels[post.category] || post.category}
            </span>
            {post.status !== 'active' && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-400">
                {post.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {post.title}
          </h1>

          {/* Description */}
          {post.description && (
            <p className="text-dark-300 leading-relaxed">
              {post.description}
            </p>
          )}

          {/* Meta info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-dark-300">
              <MapPin className="w-5 h-5 text-dark-400" />
              <span>{post.location}</span>
            </div>
            <div className="flex items-center gap-3 text-dark-300">
              <Calendar className="w-5 h-5 text-dark-400" />
              <span>
                {format(postDate, 'MMMM d, yyyy')}
                {' • '}
                {formatDistanceToNow(postDate, { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Poster info */}
          <Link
            to={`/profile/${post.user?.id}`}
            className="flex items-center gap-3 p-4 bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors"
          >
            {post.user?.avatar_url ? (
              <img
                src={post.user.avatar_url}
                alt={post.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white font-medium text-lg">
                  {post.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-white">{post.user?.name || 'Anonymous'}</p>
              <p className="text-sm text-dark-400">Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleLike}
              className={`btn-outline flex-1 ${post.is_liked ? 'text-red-500 border-red-500/50' : ''}`}
            >
              <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
              {post.likes_count || 0} likes
            </button>
            <button
              onClick={handleSave}
              className={`btn-outline flex-1 ${post.is_saved ? 'text-primary-500 border-primary-500/50' : ''}`}
            >
              <Bookmark className={`w-5 h-5 ${post.is_saved ? 'fill-current' : ''}`} />
              Save
            </button>
          </div>

          {/* Claim button - show for everyone except the owner */}
          {!isOwner && (
            <button
              onClick={handleClaim}
              className="btn-primary w-full py-4 text-lg"
            >
              <AlertTriangle className="w-5 h-5" />
              This is Mine!
            </button>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="p-4 bg-dark-800 rounded-xl">
              <p className="text-dark-400 text-sm mb-3">You posted this item</p>
              <Link
                to={`/post/${id}/claims`}
                className="btn-secondary w-full"
              >
                <MessageCircle className="w-5 h-5" />
                View Claims ({post.claims_count || 0})
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClaimModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-dark-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Claim This Item</h3>
            <p className="text-dark-400 mb-4">
              Please describe why this item belongs to you. The poster will review your claim.
            </p>
            <textarea
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              placeholder="Describe your item and any identifying features..."
              className="input min-h-[120px] resize-none mb-4"
              maxLength={1000}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowClaimModal(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={submitClaim}
                disabled={claimMutation.isPending}
                className="btn-primary flex-1"
              >
                {claimMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Submit Claim
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
