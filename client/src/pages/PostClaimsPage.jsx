import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2, ArrowLeft, Check, X, Clock, Mail, Phone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { postService } from '../services/post.service'
import toast from 'react-hot-toast'
import EmptyState from '../components/EmptyState'

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pending' },
  approved: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Approved' },
  rejected: { icon: X, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Rejected' },
}

export default function PostClaimsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPost(id),
  })

  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['post-claims', id],
    queryFn: () => postService.getPostClaims(id),
  })

  const updateClaimMutation = useMutation({
    mutationFn: ({ claimId, status }) => postService.updateClaim(claimId, status),
    onSuccess: () => {
      toast.success('Claim updated!')
      queryClient.invalidateQueries(['post-claims', id])
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update claim')
    }
  })

  const handleUpdateClaim = (claimId, status) => {
    if (status === 'approved' && !confirm('Are you sure you want to approve this claim? This will mark the item as claimed and close the post.')) {
      return
    }
    updateClaimMutation.mutate({ claimId, status })
  }

  if (postLoading || claimsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        actionLabel="Go Back"
        actionLink="/"
      />
    )
  }

  const claims = claimsData?.claims || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => navigate(`/post/${id}`)}
        className="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Post
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-2">Claims for Your Post</h1>
        
        {/* Post preview */}
        <div className="flex gap-4 p-4 bg-dark-800 rounded-xl mt-4">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div>
            <h3 className="font-semibold text-white">{post.title}</h3>
            <p className="text-dark-400 text-sm">{post.location}</p>
          </div>
        </div>
      </motion.div>

      {/* Claims list */}
      {claims.length === 0 ? (
        <EmptyState
          title="No claims yet"
          description="When someone claims your item, it will appear here."
        />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const config = statusConfig[claim.status] || statusConfig.pending
            const StatusIcon = config.icon

            return (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    {claim.user?.avatar_url ? (
                      <img
                        src={claim.user.avatar_url}
                        alt={claim.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {claim.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{claim.user?.name || 'Anonymous'}</p>
                      <p className="text-dark-400 text-sm">
                        {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {config.label}
                  </span>
                </div>

                {/* Claim message */}
                <div className="p-4 bg-dark-700 rounded-xl mb-4">
                  <p className="text-dark-200">{claim.message}</p>
                </div>

                {/* Contact info */}
                <div className="flex flex-wrap gap-4 text-sm text-dark-400 mb-4">
                  {claim.user?.email && (
                    <a
                      href={`mailto:${claim.user.email}`}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {claim.user.email}
                    </a>
                  )}
                  {claim.user?.phone && (
                    <a
                      href={`tel:${claim.user.phone}`}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {claim.user.phone}
                    </a>
                  )}
                </div>

                {/* Actions */}
                {claim.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-dark-600">
                    <button
                      onClick={() => handleUpdateClaim(claim.id, 'approved')}
                      disabled={updateClaimMutation.isPending}
                      className="btn flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateClaim(claim.id, 'rejected')}
                      disabled={updateClaimMutation.isPending}
                      className="btn flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
