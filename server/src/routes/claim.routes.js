import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

const createNotification = async (userId, type, message, data = {}) => {
  console.log('Creating notification:', { userId, type, message });
  const { error } = await supabaseAdmin.from('notifications').insert({ user_id: userId, type, message, data });
  if (error) console.error('Notification insert error:', error);
};

// POST /api/claims/:postId - submit a claim
router.post('/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Sign in to claim' });
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    const { data: post } = await supabaseAdmin
      .from('posts').select('id, user_id, title').eq('id', postId).maybeSingle();

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.user_id) return res.status(400).json({ error: 'This post has no owner to notify' });
    if (post.user_id === userId) return res.status(400).json({ error: 'Cannot claim your own post' });

    const { data: existing } = await supabaseAdmin
      .from('claims').select('id').eq('user_id', userId).eq('post_id', postId).maybeSingle();
    if (existing) return res.status(400).json({ error: 'You already submitted a claim for this item' });

    const { data: claim, error } = await supabaseAdmin
      .from('claims')
      .insert({ user_id: userId, post_id: postId, message, status: 'pending' })
      .select().single();

    if (error) return res.status(500).json({ error: 'Failed to submit claim: ' + error.message });

    // Notify the post owner
    const { data: claimer } = await supabaseAdmin
      .from('users').select('name').eq('id', userId).maybeSingle();

    await createNotification(
      post.user_id,
      'new_claim',
      `${claimer?.name || 'Someone'} claimed your item "${post.title}"`,
      { post_id: postId, claim_id: claim.id }
    );

    res.status(201).json({ success: true, claim });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/claims/post/:postId - get claims for a post (owner only)
router.get('/post/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const { data: post } = await supabaseAdmin
      .from('posts').select('user_id').eq('id', postId).maybeSingle();

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });

    const { data: claims, error } = await supabaseAdmin
      .from('claims').select('*, user:users(id, name, email, avatar_url)')
      .eq('post_id', postId).order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/claims/:claimId - approve or reject a claim
router.put('/:claimId', authenticate, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const userId = req.user?.id;

    const { data: claim } = await supabaseAdmin
      .from('claims').select('*, post:posts(id, title, user_id)').eq('id', claimId).maybeSingle();

    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (claim.post.user_id !== userId) return res.status(403).json({ error: 'Not authorized' });

    const { data: updated, error } = await supabaseAdmin
      .from('claims').update({ status }).eq('id', claimId).select().single();

    if (error) return res.status(500).json({ error: error.message });

    // Notify the claimer
    const msg = status === 'approved'
      ? `Your claim on "${claim.post.title}" was approved! Contact the poster to collect it.`
      : `Your claim on "${claim.post.title}" was rejected.`;

    await createNotification(claim.user_id, `claim_${status}`, msg, {
      post_id: claim.post_id,
      claim_id: claimId
    });

    res.json({ success: true, claim: updated });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
