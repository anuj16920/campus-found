# CampusFind - Lost & Found Platform

A high-performance Lost & Found web platform built for campus communities. Users can post, browse, search, claim, and interact with lost and found items in an Instagram-like feed.

![CampusFind](https://via.placeholder.com/1200x400/0f172a/0ea5e9?text=CampusFind)

## 🚀 Features

### Core Features
- 🔐 **Firebase Authentication** - Email/password and Google OAuth
- 📸 **Image Upload** - Supabase Storage for item photos
- 🏠 **Instagram-like Feed** - Infinite scroll, real-time updates
- 🔍 **Search & Filters** - Category, location, type, and keyword search
- ❤️ **Interactions** - Like, save/bookmark posts
- 📩 **Claim System** - Request ownership with messaging
- 👤 **User Profiles** - View posts, saved items, claims

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Firebase Authentication
- **State**: Zustand + React Query

## 📁 Project Structure

```
campusfound/
├── client/                    # React frontend
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── PostCard.jsx
│   │   ├── config/           # Configuration
│   │   │   └── firebase.js
│   │   ├── pages/            # Page components
│   │   │   ├── AuthPage.jsx
│   │   │   ├── CreatePostPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── MyClaimsPage.jsx
│   │   │   ├── PostClaimsPage.jsx
│   │   │   ├── PostDetailPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── SavedPostsPage.jsx
│   │   ├── services/         # API services
│   │   │   ├── api.service.js
│   │   │   ├── auth.service.js
│   │   │   └── post.service.js
│   │   ├── stores/           # Zustand stores
│   │   │   ├── auth.store.js
│   │   │   └── post.store.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── config/           # Configuration
│   │   │   ├── env.js
│   │   │   ├── firebase.js
│   │   │   └── supabase.js
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── routes/           # API routes
│   │   │   ├── auth.routes.js
│   │   │   ├── claim.routes.js
│   │   │   ├── like.routes.js
│   │   │   ├── post.routes.js
│   │   │   ├── upload.routes.js
│   │   │   └── user.routes.js
│   │   └── index.js          # Server entry point
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase account
- Supabase account

### 1. Clone and Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Email/Password and Google providers
4. Get your web app config:
   - Project Settings → General → Your apps → SDK setup
   - Copy the config values

### 3. Supabase Setup

1. Go to [Supabase](https://supabase.com/) and create a project
2. Get your project credentials:
   - Settings → API → `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - Create a storage bucket named `campusfind-images`
3. Enable Row Level Security on your tables

### 4. Environment Variables

**Server (`.env`):**
```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
```

**Client (`.env`):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 5. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 🌐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/verify` | Verify Firebase token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh user data |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get posts (paginated, filterable) |
| GET | `/api/posts/:id` | Get single post |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |

### Interactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/:id/like` | Like post |
| DELETE | `/api/posts/:id/like` | Unlike post |
| POST | `/api/posts/:id/save` | Save post |
| DELETE | `/api/posts/:id/save` | Unsave post |

### Claims
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/:id/claim` | Create claim |
| GET | `/api/claims/user` | Get user's claims |
| GET | `/api/claims/post/:id` | Get post claims |
| PUT | `/api/claims/:id` | Update claim status |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user profile |
| GET | `/api/users/:id/posts` | Get user's posts |
| GET | `/api/users/me/saved` | Get saved posts |
| PUT | `/api/users/me` | Update profile |

## 📊 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date_found TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active',
  type VARCHAR(20) DEFAULT 'found',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

-- Claims table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved posts table
CREATE TABLE saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
vercel
```

### Backend (Railway/Render)
1. Connect your GitHub repo
2. Set environment variables
3. Deploy

### Database (Supabase)
- Hosted PostgreSQL - no deployment needed
- Just configure connection string

## 🎨 UI/UX Features

- **Dark mode** design with modern aesthetic
- **Responsive** - mobile-first approach
- **Smooth animations** with Framer Motion
- **Infinite scroll** for feed performance
- **Debounced search** for optimal UX
- **Optimistic updates** for likes/saves

## 🔒 Security

- Firebase JWT verification on all protected routes
- Supabase Row Level Security (RLS)
- Input validation with Zod
- Rate limiting on API endpoints
- Helmet.js for HTTP headers

## 📈 Performance Optimizations

- React Query for caching and background updates
- Infinite scroll pagination
- Image lazy loading
- Debounced search (300ms)
- Optimistic UI updates
- CDN-ready storage URLs

## 📝 License

MIT License - feel free to use this for your campus!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ for campus communities
