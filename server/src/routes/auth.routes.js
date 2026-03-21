import express from 'express';
import { verifyToken } from '../config/supabase.js';
import { getOrCreateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Verify token and get user
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Get or create user in database
    const user = await getOrCreateUser(decoded);
    
    res.json({ user });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
