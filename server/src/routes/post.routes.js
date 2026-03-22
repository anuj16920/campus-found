import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Get all posts with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      location,
      search,
      sort = 'latest'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact' });

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

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Posts fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    res.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_more: offset + (posts?.length || 0) < count
      }
    });
  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Post fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { title, description, image_url, category, location, date_found, type, contact_method, poster_name, poster_email } = req.body;

    if (!title || !category || !location) {
      return res.status(400).json({ error: 'Title, category, and location are required' });
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        title,
        description,
        image_url,
        category,
        location,
        date_found: date_found || new Date().toISOString(),
        type: type || 'found',
        contact_method: contact_method || 'email',
        poster_name: poster_name || 'Anonymous',
        poster_email: poster_email,
      })
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return res.status(500).json({ error: 'Failed to create post: ' + error.message });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
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

export default router;
