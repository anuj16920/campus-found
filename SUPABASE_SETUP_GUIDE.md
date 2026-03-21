# Supabase Setup Guide for CampusFind

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **New Project**
3. Name it "CampusFind"
4. Set a strong database password (SAVE THIS!)
5. Select closest region
6. Click **Create new project**

## 2. Get API Keys

Go to **Settings > API** and copy:
- `Project URL`: `https://xxxxx.supabase.co`
- `anon/public key`: `eyJhbGcOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `service_role key`: `eyJhbGcOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Run Database Schema

1. Go to **SQL Editor** in left sidebar
2. Copy contents of `supabase/schema.sql`
3. Paste and click **Run**

## 4. Enable Email Auth

1. Go to **Authentication > Providers**
2. Click on **Email**
3. Enable **Email** provider
4. (Optional) Disable "Confirm email" for dev testing
5. Save

## 5. Enable Google OAuth (Optional)

1. Go to **Authentication > Providers**
2. Click on **Google**
3. Enable it
4. Get credentials from [Google Cloud Console](https://console.cloud.google.com):
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://xxxxx.supabase.co/auth/v1/callback`
5. Paste Client ID and Client Secret
6. Save

## 6. Create Storage Bucket

1. Go to **Storage** in left sidebar
2. Click **New bucket**
3. Name: `post-images`
4. Set as **Public** bucket
5. Create

## 7. Environment Variables

### Server (.env):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGcOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CLIENT_URL=http://localhost:5173
```

### Client (.env):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGcOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Coolify Environment Variables:
```
# Server
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
CLIENT_URL=https://your-frontend-domain.com

# Client  
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend-domain.com/api
```

## Quick Reference Table

| Setting | Location | Purpose |
|---------|----------|---------|
| Project URL | Settings > API | Connection string |
| anon key | Settings > API | Client-side auth |
| service key | Settings > API | Server-side auth (SECRET!) |
| Schema | SQL Editor | Tables + RLS policies |
| Auth config | Authentication | User management |
| Storage | Storage | Image uploads |