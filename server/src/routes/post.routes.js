import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { validate, schemas } from '../middleware/validation.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { config } from '../config/env.js';

const router = Router();

// Get all posts with filters and pagination
router.get('/', optionalAuth, validate(schemas.postQuery, 'query'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = config.DEFAULT_PAGE_SIZE,
      category,
      location,
      search,
      type,
      sort = 'latest',
      user_id
    } = req.validatedQuery || req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users(id, name, avatar_url, email),
        likes_count:likes(count),
        claims:claims(count)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'popular':
        query = query.order('created_at', { ascending: false });
        break;
      default: // latest
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Posts fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    // Check if current user has liked/saved each post
    let userLikes = [];
    let userSaves = [];
    
    if (req.user) {
      const postIds = posts?.map(p => p.id) || [];
      
      const [likesRes, savesRes] = await Promise.all([
        supabase.from('likes').select('post_id').eq('user_id', req.user.id).in('post_id', postIds),
        supabase.from('saved_posts').select('post_id').eq('user_id', req.user.id).in('post_id', postIds)
      ]);
      
      userLikes = likesRes.data?.map(l => l.post_id) || [];
      userSaves = savesRes.data?.map(s => s.post_id) || [];
    }

    // Transform posts with additional info
    const transformedPosts = posts?.map(post => ({
      ...post,
      likes_count: post.likes_count?.[0]?.count || 0,
      claims_count: post.claims?.[0]?.count || 0,
      is_liked: userLikes.includes(post.id),
      is_saved: userSaves.includes(post.id),
      user: post.user
    })) || [];

    res.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_more: offset + posts?.length < count
      }
    });
  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, name, avatar_url, email),
        likes_count:likes(count),
        claims:claims(count)
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if current user has liked/saved
    let isLiked = false;
    let isSaved = false;
    
    if (req.user) {
      const [likeRes, saveRes] = await Promise.all([
        supabase.from('likes').select('id').eq('user_id', req.user.id).eq('post_id', id).single(),
        supabase.from('saved_posts').select('id').eq('user_id', req.user.id).eq('post_id', id).single()
      ]);
      
      isLiked = !!likeRes.data;
      isSaved = !!saveRes.data;
    }

    res.json({
      ...post,
      likes_count: post.likes_count?.[0]?.count || 0,
      claims_count: post.claims?.[0]?.count || 0,
      is_liked: isLiked,
      is_saved: isSaved
    });
  } catch (error) {
    console.error('Post fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { title, description, image_url, category, location, date_found, type, contact_method } = req.body;
    const userId = req.user?.id || req.body.user_id;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        title,
        description,
        image_url,
        category,
        location,
        date_found: date_found || new Date().toISOString(),
        type: type || 'found',
        contact_method: contact_method || 'in-app',
        status: 'active'
      })
      .select(`
        *,
        user:users(id, name, avatar_url, email)
      `)
      .single();

    if (error) {
      console.error('Create post error:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    res.status(201).json({
      ...post,
      likes_count: 0,
      claims_count: 0,
      is_liked: false,
      is_saved: false
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        user:users(id, name, avatar_url, email)
      `)
      .single();

    if (error) {
      console.error('Update post error:', error);
      return res.status(500).json({ error: 'Failed to update post' });
    }

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.user_id !== req.user?.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete post error:', error);
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories with counts
router.get('/meta/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .eq('status', 'active');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    // Count by category
    const counts = data.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {});

    res.json(counts);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
