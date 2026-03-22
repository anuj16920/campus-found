import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    req.user = jwt.verify(token, config.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    req.user = token ? jwt.verify(token, config.JWT_SECRET) : null;
  } catch {
    req.user = null;
  }
  next();
};

export default { authenticate, optionalAuth };
