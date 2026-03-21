import { verifyToken } from '../config/supabase.js';

/**
 * Verify Supabase JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get or create user in database
    const user = await getOrCreateUser(decoded);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.supabaseUser = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Get or create user in the users table
 */
export const getOrCreateUser = async (supabaseUser) => {
  const { supabaseAdmin } = await import('../config/supabase.js');
  
  try {
    // Try to find existing user by supabase_user_id
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('supabase_user_id', supabaseUser.sub)
      .single();
    
    if (existingUser) {
      return existingUser;
    }
    
    // User doesn't exist, check if we should create them
    // Only create if we have required user metadata
    if (!supabaseUser.email) {
      console.error('No email in token to create user');
      return null;
    }
    
    // Create new user record
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        supabase_user_id: supabaseUser.sub,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || 
              supabaseUser.user_metadata?.name || 
              supabaseUser.email.split('@')[0],
        avatar_url: supabaseUser.user_metadata?.avatar_url || null
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      return null;
    }
    
    return newUser;
  } catch (error) {
    console.error('getOrCreateUser error:', error);
    return null;
  }
};

/**
 * Optional auth - tries to verify token but doesn't fail if missing
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);
    
    if (decoded) {
      const user = await getOrCreateUser(decoded);
      req.user = user;
      req.supabaseUser = decoded;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // Auth failed, but continue without user
    req.user = null;
    next();
  }
};

export default { authenticate, getOrCreateUser, optionalAuth };
