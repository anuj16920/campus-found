import { useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import PostCard from './PostCard'
import { postService } from '../services/post.service'
import { usePostStore } from '../stores/post.store'
import EmptyState from './EmptyState'

export default function Feed({ type = 'all' }) {
  const { filters, setPosts, appendPosts, setHasMoreFeed } = usePostStore()
  const observerRef = useRef()

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', filters, type],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await postService.getPosts({
        page: pageParam,
        limit: 20,
        ...filters,
      })
      return response
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_more) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })

  // Update store when data changes
  useEffect(() => {
    if (data?.pages) {
      const allPosts = data.pages.flatMap((page) => page.posts)
      setPosts(allPosts)
      setHasMoreFeed(data.pages[data.pages.length - 1]?.pagination?.has_more || false)
    }
  }, [data])

  // Infinite scroll observer
  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })

      if (node) {
        observerRef.current.observe(node)
      }
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <p className="text-dark-400">Loading posts...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Something went wrong"
        description={error?.message || 'Failed to load posts. Please try again.'}
      />
    )
  }

  const posts = data?.pages.flatMap((page) => page.posts) || []

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Be the first to post a lost or found item!"
        actionLabel="Create Post"
        actionLink="/create"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <div
            key={post.id}
            ref={index === posts.length - 1 ? lastPostRef : null}
          >
            <PostCard post={post} />
          </div>
        ))}
      </div>

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          <span className="ml-2 text-dark-400">Loading more...</span>
        </motion.div>
      )}

      {/* End of results */}
      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-dark-500 py-8">
          You've reached the end • {posts.length} posts
        </p>
      )}
    </div>
  )
}
