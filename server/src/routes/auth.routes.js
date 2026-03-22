import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Check existing
    const { data: existing } = await supabaseAdmin
      .from('users').select('id').eq('email', email).single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ email, password_hash, name: name || email.split('@')[0] })
      .select('id, email, name, avatar_url, created_at')
      .single();

    if (error) {
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { data: user, error } = await supabaseAdmin
      .from('users').select('*').eq('email', email).single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const { password_hash, ...safeUser } = user;
    res.json({ token: signToken(safeUser), user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me  (requires Bearer token)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, avatar_url, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) return res.status(401).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
