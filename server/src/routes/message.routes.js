import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/conversations — list all conversations for current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id, post_id, created_at,
        user1:users!conversations_user1_id_fkey(id, name, avatar_url),
        user2:users!conversations_user2_id_fkey(id, name, avatar_url),
        post:posts(id, title, image_url)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Attach last message to each conversation
    const convIds = (data || []).map(c => c.id);
    let lastMsgs = {};
    if (convIds.length > 0) {
      const { data: msgs } = await supabaseAdmin
        .from('messages')
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      (msgs || []).forEach(m => {
        if (!lastMsgs[m.conversation_id]) lastMsgs[m.conversation_id] = m;
      });
    }

    const result = (data || []).map(c => ({
      ...c,
      other_user: c.user1?.id === userId ? c.user2 : c.user1,
      last_message: lastMsgs[c.id] || null,
    }));

    res.json({ conversations: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conversations/:id/messages — get messages in a conversation
router.get('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify user is part of this conversation
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id, user1_id, user2_id, post:posts(id, title, image_url)')
      .eq('id', id)
      .maybeSingle();

    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (conv.user1_id !== userId && conv.user2_id !== userId)
      return res.status(403).json({ error: 'Not authorized' });

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*, sender:users(id, name, avatar_url)')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Mark messages as read
    await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', id)
      .neq('sender_id', userId);

    res.json({ messages: messages || [], conversation: conv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations/:id/messages — send a message
router.post('/conversations/:id/messages', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id, user1_id, user2_id')
      .eq('id', id)
      .maybeSingle();

    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (conv.user1_id !== userId && conv.user2_id !== userId)
      return res.status(403).json({ error: 'Not authorized' });

    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({ conversation_id: id, sender_id: userId, content: content.trim() })
      .select('*, sender:users(id, name, avatar_url)')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Update conversation updated_at
    await supabaseAdmin.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', id);

    // Notify the other user
    const otherId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
    const { data: sender } = await supabaseAdmin.from('users').select('name').eq('id', userId).maybeSingle();
    await supabaseAdmin.from('notifications').insert({
      user_id: otherId,
      type: 'new_message',
      message: `${sender?.name || 'Someone'} sent you a message`,
      data: { conversation_id: id },
    });

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations/start — start or get existing conversation
router.post('/conversations/start', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { other_user_id, post_id } = req.body;

    if (!other_user_id) return res.status(400).json({ error: 'other_user_id required' });
    if (other_user_id === userId) return res.status(400).json({ error: 'Cannot chat with yourself' });

    // Check if conversation already exists between these two users for this post
    const { data: existing } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${userId},user2_id.eq.${other_user_id}),and(user1_id.eq.${other_user_id},user2_id.eq.${userId})`)
      .eq('post_id', post_id || null)
      .maybeSingle();

    if (existing) return res.json({ conversation_id: existing.id });

    const { data: conv, error } = await supabaseAdmin
      .from('conversations')
      .insert({ user1_id: userId, user2_id: other_user_id, post_id: post_id || null })
      .select('id')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ conversation_id: conv.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
