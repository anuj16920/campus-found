import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase client for client-side operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase admin client for server-side operations (uses service key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Verify a Supabase JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} - The decoded token payload or null if invalid
 */
export const verifyToken = async (token) => {
  try {
    // Use Supabase Admin client to verify the token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token verification error:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Update user profile in the users table
 * @param {string} userId - The user's UUID from our users table
 * @param {object} updates - The fields to update
 * @returns {object} - The updated user data
 */
export const updateUser = async (userId, updates) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

export default supabaseAdmin;
