import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2, FileText, Clock, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { postService } from '../services/post.service'
import EmptyState from '../components/EmptyState'

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  approved: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  rejected: { icon: X, color: 'text-red-400', bg: 'bg-red-500/20' },
}

export default function MyClaimsPage() {
  const { data: claimsData, isLoading } = useQuery({
    queryKey: ['my-claims'],
    queryFn: () => postService.getMyClaims(),
  })

  const claims = claimsData?.claims || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">My Claims</h1>
        </div>
        <p className="text-dark-400 mb-8">
          Track the status of items you've claimed.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      ) : claims.length === 0 ? (
        <EmptyState
          title="No claims yet"
          description="When you claim an item, it will appear here."
          actionLabel="Browse Items"
          actionLink="/"
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
                className="card p-4"
              >
                <div className="flex gap-4">
                  {/* Post image */}
                  <Link to={`/post/${claim.post?.id}`} className="shrink-0">
                    <img
                      src={claim.post?.image_url}
                      alt={claim.post?.title}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        to={`/post/${claim.post?.id}`}
                        className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1"
                      >
                        {claim.post?.title || 'Unknown Item'}
                      </Link>
                      <span className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-dark-400 text-sm line-clamp-2 mb-2">
                      {claim.message}
                    </p>

                    <p className="text-dark-500 text-xs">
                      Claimed {formatDistanceToNow(new Date(claim.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
