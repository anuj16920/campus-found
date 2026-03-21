import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { initializeFirebase } from './config/firebase.js';
import { supabase, initializeDatabase } from './config/supabase.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import likeRoutes from './routes/like.routes.js';
import claimRoutes from './routes/claim.routes.js';
import userRoutes from './routes/user.routes.js';
import uploadRoutes from './routes/upload.routes.js';

// Middleware
import { authMiddleware } from './middleware/auth.middleware.js';

const app = express();

// 🔥 Security middleware
app.use(helmet());

// 🔥 FIXED CORS (IMPORTANT)
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      config.CLIENT_URL
    ];

    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // 🔥 allow anyway (for now)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 🔥 IMPORTANT: handle preflight manually
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// 🔥 EXTRA SAFETY (handles preflight requests)
app.options('*', cors());

// Rate limiting - general API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

// Rate limiting - uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many upload requests, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/uploads', uploadLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Protected routes
app.use('/api/posts', authMiddleware, likeRoutes);
app.use('/api/posts', authMiddleware, claimRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/uploads', authMiddleware, uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: err.details 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: err.message 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    initializeFirebase();
    console.log('✅ Firebase Admin initialized');

    await initializeDatabase();
    console.log('✅ Supabase connection established');

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📚 API Documentation: http://localhost:${config.PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
