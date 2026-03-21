import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, X, MapPin, Calendar, Image as ImageIcon } from 'lucide-react'
import { postService, uploadService } from '../services/post.service'
import { useAuthStore } from '../stores/auth.store'
import toast from 'react-hot-toast'

const categories = [
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

export default function CreatePostPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date_found: new Date().toISOString().split('T')[0],
    type: 'found',
    contact_method: 'in-app',
  })

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload image
    setIsUploading(true)
    try {
      const { public_url } = await uploadService.uploadImage(file)
      setFormData((prev) => ({ ...prev, image_url: public_url }))
      toast.success('Image uploaded!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image. Please try again.')
      // Keep preview since FileReader data URL is still valid
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    
    if (!formData.category) {
      toast.error('Please select a category')
      return
    }
    
    if (!formData.location.trim()) {
      toast.error('Please enter a location')
      return
    }

    setIsSubmitting(true)
    try {
      const post = await postService.createPost({
        ...formData,
        user_id: user.id,
      })
      toast.success('Post created successfully!')
      navigate(`/post/${post.id}`)
    } catch (error) {
      console.error('Create post error:', error)
      toast.error(error.response?.data?.error || 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">Report an Item</h1>
        <p className="text-dark-400 mb-8">
          Help reunite lost items with their owners by posting details here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="label">Item Photo</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-video bg-dark-800 border-2 border-dashed border-dark-600 rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-primary-500 ${
                preview ? '' : 'flex items-center justify-center'
              }`}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  {isUploading ? (
                    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  ) : (
                    <Upload className="w-10 h-10 text-dark-400 mx-auto mb-3" />
                  )}
                  <p className="text-dark-400">Click to upload an image</p>
                  <p className="text-dark-500 text-sm mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              {preview && !isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreview(null)
                    setFormData((prev) => ({ ...prev, image_url: null }))
                  }}
                  className="absolute top-3 right-3 p-2 bg-dark-900/80 rounded-full text-white hover:bg-dark-900"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'found' }))}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  formData.type === 'found'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-dark-600 text-dark-300 hover:border-dark-500'
                }`}
              >
                <div className="text-2xl mb-1">✨</div>
                <div className="font-medium">I Found This</div>
                <div className="text-sm opacity-70">Found an item</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'lost' }))}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  formData.type === 'lost'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-dark-600 text-dark-300 hover:border-dark-500'
                }`}
              >
                <div className="text-2xl mb-1">🔍</div>
                <div className="font-medium">I Lost This</div>
                <div className="text-sm opacity-70">Looking for item</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Black iPhone 14 Pro"
              className="input"
              maxLength={255}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Any distinguishing features, brand, color, etc."
              className="input min-h-[100px] resize-y"
              maxLength={2000}
            />
          </div>

          {/* Location */}
          <div>
            <label className="label">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Library, Building A, Cafeteria"
                className="input pl-10"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="date"
                name="date_found"
                value={formData.date_found}
                onChange={handleChange}
                className="input pl-10"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !formData.image_url}
              className="btn-primary flex-1"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Post Item'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
