# CampusFind - Lost & Found Platform

A production-ready Lost & Found web application for college campuses. Built with React, Node.js, and Supabase.

## Features

- 🔐 **Authentication**: Email/Password and Google OAuth via Supabase Auth
- 📱 **Instagram-like Feed**: Scroll through found/lost items with infinite scroll
- 📤 **Post Creation**: Upload images with item details
- 🔍 **Search & Filters**: Find items by category, location, or keywords
- ❤️ **Interactions**: Like and save posts
- 📩 **Claim System**: Request ownership of found items
- 👤 **User Profiles**: View your posts and saved items

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

## Project Structure

```
campus-found/
├── client/                 # React frontend
│   ├── src/
│   │   ├── config/        # Supabase & API config
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & auth services
│   │   ├── stores/        # Zustand state stores
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # Server configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── ...
└── supabase/              # Database schema
```

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (for server)
   - `SUPABASE_ANON_KEY` (for client)

3. Run the database schema:
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy the contents of `supabase/schema.sql`
   - Execute the SQL

4. Enable Auth Providers (optional - for Google OAuth):
   - Go to **Authentication > Providers**
   - Enable Google and configure with your OAuth credentials

5. Create Storage Bucket:
   - Go to **Storage** in Supabase Dashboard
   - Create a new bucket called `post-images`
   - Set as public bucket

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
CLIENT_URL=http://localhost:5173
```

Run development server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run development server:

```bash
npm run dev
```

## Environment Variables

### Server (.env)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `CLIENT_URL` | Frontend URL for CORS |

### Client (.env)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Supabase token

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/:id/like` - Like/unlike post (protected)
- `POST /api/posts/:id/save` - Save/unsave post (protected)

### Users
- `GET /api/users/me` - Get current user profile (protected)
- `PUT /api/users/me` - Update profile (protected)
- `GET /api/users/:id/posts` - Get user's posts

### Claims
- `POST /api/posts/:id/claim` - Submit claim (protected)
- `GET /api/claims/user` - Get user's claims (protected)
- `GET /api/claims/post/:id` - Get claims for post (protected)
- `PUT /api/claims/:id` - Update claim status (protected)

## Database Schema

The app uses the following tables:

- **users**: User profiles
- **posts**: Lost/found item posts
- **likes**: Post likes
- **claims**: Ownership claims
- **saved_posts**: Bookmarked posts

See `supabase/schema.sql` for complete schema with RLS policies.

## Deployment

### Backend (Coolify/Railway/Render)

1. Push your code to GitHub
2. Connect repository to your deployment platform
3. Set environment variables
4. Deploy

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

## Performance Optimizations

- Lazy loading images with Intersection Observer
- Pagination with cursor-based navigation
- Debounced search (300ms delay)
- Optimized database queries with indexes
- CDN for static assets (Supabase Storage)

## Security

- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- Input validation with Zod
- Rate limiting (1000 requests/15min)
- Helmet.js security headers
- CORS protection

## License

MIT
