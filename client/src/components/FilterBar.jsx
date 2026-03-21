import { useState, useEffect } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { usePostStore } from '../stores/post.store'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'documents', label: 'Documents' },
  { value: 'bags', label: 'Bags & Luggage' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'keys', label: 'Keys' },
  { value: 'phones', label: 'Phones' },
  { value: 'wallets', label: 'Wallets' },
  { value: 'other', label: 'Other' },
]

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
]

export default function FilterBar() {
  const { filters, setFilters } = usePostStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isExpanded, setIsExpanded] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  // Sync with URL params
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setFilters({ search })
      setLocalSearch(search)
    }
  }, [searchParams])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilters({ search: localSearch || null })
        if (localSearch) {
          setSearchParams({ search: localSearch })
        } else {
          setSearchParams({})
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch])

  const handleCategoryChange = (e) => {
    setFilters({ category: e.target.value || null })
  }

  const handleSortChange = (e) => {
    setFilters({ sort: e.target.value })
  }

  const handleTypeChange = (type) => {
    setFilters({ type: filters.type === type ? null : type })
  }

  const clearFilters = () => {
    setFilters({})
    setLocalSearch('')
    setSearchParams({})
  }

  const hasActiveFilters = filters.category || filters.type || filters.search

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {localSearch && (
            <button
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`btn-outline ${isExpanded ? 'bg-dark-700' : ''}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </button>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-dark-800 border border-dark-600 rounded-xl space-y-4">
              {/* Type filters */}
              <div>
                <label className="label">Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTypeChange('found')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.type === 'found'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:text-white'
                    }`}
                  >
                    Found
                  </button>
                  <button
                    onClick={() => handleTypeChange('lost')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.type === 'lost'
                        ? 'bg-amber-500 text-white'
                        : 'bg-dark-700 text-dark-300 hover:text-white'
                    }`}
                  >
                    Lost
                  </button>
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label className="label">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={handleCategoryChange}
                  className="input"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort filter */}
              <div>
                <label className="label">Sort By</label>
                <select
                  value={filters.sort || 'latest'}
                  onChange={handleSortChange}
                  className="input"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-ghost w-full">
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
