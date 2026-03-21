import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { validate, schemas } from '../middleware/validation.middleware.js';

const router = Router();

// Create a claim
router.post('/:id/claim', validate(schemas.createClaim, 'body'), async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { message } = req.validatedBody || req.body;
    const userId = req.user.id;

    // Check if post exists
    const { data: post } = await supabase
      .from('posts')
      .select('id, user_id, status')
      .eq('id', postId)
      .single();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.status !== 'active') {
      return res.status(400).json({ error: 'This item is no longer available' });
    }

    // Can't claim own post
    if (post.user_id === userId) {
      return res.status(400).json({ error: 'Cannot claim your own post' });
    }

    // Check for existing pending claim
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('id, status')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('status', 'pending')
      .single();

    if (existingClaim) {
      return res.status(400).json({ error: 'You already have a pending claim on this item' });
    }

    // Create claim
    const { data: claim, error } = await supabase
      .from('claims')
      .insert({
        user_id: userId,
        post_id: postId,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Create claim error:', error);
      return res.status(500).json({ error: 'Failed to create claim' });
    }

    res.status(201).json({ success: true, claim });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's claims
router.get('/user', async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: claims, count, error } = await supabase
      .from('claims')
      .select(`
        *,
        post:posts(id, title, image_url, location, category, type, user:users(id, name, avatar_url)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get claims error:', error);
      return res.status(500).json({ error: 'Failed to fetch claims' });
    }

    res.json({
      claims,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get claims for a post (post owner only)
router.get('/post/:id', async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view claims' });
    }

    const { data: claims, error } = await supabase
      .from('claims')
      .select(`
        *,
        user:users(id, name, avatar_url, email, phone)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get post claims error:', error);
      return res.status(500).json({ error: 'Failed to fetch claims' });
    }

    res.json({ claims });
  } catch (error) {
    console.error('Get post claims error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update claim status (post owner only)
router.put('/:id', async (req, res) => {
  try {
    const { id: claimId } = req.params;
    const { status, post_id } = req.body;
    const userId = req.user.id;

    // Verify ownership of the post
    if (post_id) {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', post_id)
        .single();

      if (!post || post.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    const { data: claim, error } = await supabase
      .from('claims')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', claimId)
      .select()
      .single();

    if (error) {
      console.error('Update claim error:', error);
      return res.status(500).json({ error: 'Failed to update claim' });
    }

    // If claim is approved, close the post
    if (status === 'approved') {
      await supabase
        .from('posts')
        .update({ status: 'claimed', updated_at: new Date().toISOString() })
        .eq('id', claim.post_id);
    }

    res.json({ success: true, claim });
  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
