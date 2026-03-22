import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/notifications - get my notifications
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.user.id);
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    console.log('Notifications result:', { data, error });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ notifications: data || [] });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read - mark all as read
router.put('/read', authenticate, async (req, res) => {
  try {
    await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
