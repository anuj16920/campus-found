import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { updateUser } from '../config/supabase.js';
import { validate, schemas } from '../middleware/validation.middleware.js';

const router = Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get post counts
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)
      .eq('status', 'active');

    const { count: savedCount } = await supabase
      .from('saved_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    res.json({
      ...user,
      posts_count: postsCount || 0,
      saved_count: savedCount || 0
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user posts
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: posts, count, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, name, avatar_url),
        likes_count:likes(count)
      `, { count: 'exact' })
      .eq('user_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get user posts error:', error);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }

    const transformedPosts = posts?.map(post => ({
      ...post,
      likes_count: post.likes_count?.[0]?.count || 0
    })) || [];

    res.json({
      posts: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get saved posts
router.get('/me/saved', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: savedPosts, count, error } = await supabase
      .from('saved_posts')
      .select(`
        post:posts(
          *,
          user:users(id, name, avatar_url),
          likes_count:likes(count)
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get saved posts error:', error);
      return res.status(500).json({ error: 'Failed to fetch saved posts' });
    }

    const posts = savedPosts?.map(sp => ({
      ...sp.post,
      likes_count: sp.post?.likes_count?.[0]?.count || 0,
      is_saved: true
    })) || [];

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.put('/me', validate(schemas.updateUser, 'body'), async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.validatedBody || req.body;

    const { data: user, error } = await updateUser(userId, updates);

    if (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user stats
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const [postsRes, savedRes, likesRes, claimsRes] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('saved_posts').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('claims').select('*', { count: 'exact', head: true }).eq('user_id', id)
    ]);

    res.json({
      posts_count: postsRes.count || 0,
      saved_count: savedRes.count || 0,
      likes_count: likesRes.count || 0,
      claims_count: claimsRes.count || 0
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
