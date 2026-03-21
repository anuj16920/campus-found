import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// Like a post
router.post('/:id/like', async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already liked this post' });
    }

    // Add like
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        post_id: postId
      });

    if (error) {
      console.error('Like error:', error);
      return res.status(500).json({ error: 'Failed to like post' });
    }

    // Get updated count
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    res.json({ success: true, likes_count: count, is_liked: true });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlike a post
router.delete('/:id/like', async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Unlike error:', error);
      return res.status(500).json({ error: 'Failed to unlike post' });
    }

    // Get updated count
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    res.json({ success: true, likes_count: count, is_liked: false });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save a post
router.post('/:id/save', async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Already saved this post' });
    }

    const { error } = await supabase
      .from('saved_posts')
      .insert({
        user_id: userId,
        post_id: postId
      });

    if (error) {
      console.error('Save error:', error);
      return res.status(500).json({ error: 'Failed to save post' });
    }

    res.json({ success: true, is_saved: true });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsave a post
router.delete('/:id/save', async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Unsave error:', error);
      return res.status(500).json({ error: 'Failed to unsave post' });
    }

    res.json({ success: true, is_saved: false });
  } catch (error) {
    console.error('Unsave error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
