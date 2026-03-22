import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, Calendar, Tag, FileText, User, Mail } from 'lucide-react';
import { api } from '../services/api.service';

const CATEGORIES = [
  'ID Card',
  'Phone',
  'Laptop',
  'Bag',
  'Wallet',
  'Keys',
  'Book',
  'Clothing',
  'Other'
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date_found: '',
    type: 'found',
    contact_method: 'email',
    poster_name: '',
    poster_email: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (imagePreview) {
        const base64Data = imagePreview.split(',')[1];
        const contentType = imagePreview.split(';')[0].split(':')[1];
        
        const uploadRes = await api.post('/upload/image', {
          image: base64Data,
          filename: `post-${Date.now()}.jpg`,
          contentType
        });
        
        imageUrl = uploadRes.data.public_url;
      }

      // Create post
      const postData = {
        ...formData,
        image_url: imageUrl
      };

      await api.post('/posts', postData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Post a Found Item</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm text-dark-300 mb-2">Item Image</label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-2 right-2 p-1 bg-dark-900/80 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-dark-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
              <Upload className="w-10 h-10 text-dark-400 mb-2" />
              <span className="text-dark-400">Click to upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm text-dark-300 mb-1">
            <Tag className="w-4 h-4 inline mr-1" />
            Item Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input w-full"
            placeholder="e.g., Blue iPhone 14"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-dark-300 mb-1">
            <FileText className="w-4 h-4 inline mr-1" />
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input w-full h-24 resize-none"
            placeholder="Describe the item..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-dark-300 mb-1">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm text-dark-300 mb-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location Found *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input w-full"
            placeholder="e.g., Library, Room 201"
            required
          />
        </div>

        {/* Date Found */}
        <div>
          <label className="block text-sm text-dark-300 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Found
          </label>
          <input
            type="date"
            value={formData.date_found}
            onChange={(e) => setFormData({ ...formData, date_found: e.target.value })}
            className="input w-full"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm text-dark-300 mb-1">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="found"
                checked={formData.type === 'found'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <span className="text-white">Found</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="lost"
                checked={formData.type === 'lost'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
              <span className="text-white">Lost</span>
            </label>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Your Name
            </label>
            <input
              type="text"
              value={formData.poster_name}
              onChange={(e) => setFormData({ ...formData, poster_name: e.target.value })}
              className="input w-full"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Your Email
            </label>
            <input
              type="email"
              value={formData.poster_email}
              onChange={(e) => setFormData({ ...formData, poster_email: e.target.value })}
              className="input w-full"
              placeholder="your@email.com"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? 'Posting...' : 'Post Item'}
        </button>
      </form>
    </div>
  );
}
