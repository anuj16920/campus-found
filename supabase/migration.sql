-- Run this in Supabase SQL Editor to migrate from Supabase auth to custom auth

-- Drop old trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Add password_hash column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make supabase_user_id nullable (so new users don't need it)
ALTER TABLE users ALTER COLUMN supabase_user_id DROP NOT NULL;

-- Disable RLS so server-side service key can do everything
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE claims DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts DISABLE ROW LEVEL SECURITY;
