import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Create Supabase clients
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

export const supabaseAdmin = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function initializeDatabase() {
  try {
    console.log('🔄 Checking Supabase connection...');
    
    // Test connection - just try to query users table
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST204' || error.code === '42P01') {
        console.log('⚠️  Database tables not found.');
        console.log('📝 Please run the migration SQL in Supabase SQL Editor:');
        console.log('   File: server/supabase-migration.sql');
        console.log('');
        console.log('   Or go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
        console.log('');
        console.log('⚠️  Server will continue but database features will not work.');
        return; // Don't throw, just warn
      }
      console.log('⚠️  Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase connection verified');
    }
  } catch (error) {
    console.warn('⚠️  Database initialization warning:', error.message);
    // Don't throw - allow server to start even if DB isn't ready
  }
}

export async function getUserByFirebaseUid(firebaseUid) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();
    
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUser(userId, updates) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
