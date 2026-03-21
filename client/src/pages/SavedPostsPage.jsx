import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2, Bookmark } from 'lucide-react'
import { userService } from '../services/post.service'
import PostCard from '../components/PostCard'
import EmptyState from '../components/EmptyState'

export default function SavedPostsPage() {
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['saved-posts'],
    queryFn: () => userService.getSavedPosts(),
  })

  const posts = postsData?.posts || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-white">Saved Posts</h1>
        </div>
        <p className="text-dark-400 mb-8">
          Items you've saved for later reference.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No saved posts"
          description="Items you save will appear here."
          actionLabel="Browse Items"
          actionLink="/"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
