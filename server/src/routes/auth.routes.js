import { Router } from 'express';

const router = Router();

// Verify Firebase token and get/create user
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Dynamic import to avoid errors if firebase not available
    const { getAuth } = await import('../config/firebase.js');
    
    let auth;
    try {
      auth = getAuth();
    } catch (firebaseError) {
      console.error('Firebase not available:', firebaseError.message);
      return res.status(500).json({ 
        error: 'Firebase not configured',
        message: 'Server Firebase configuration is missing. Please check .env file.' 
      });
    }
    
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Get or create user in Supabase (if available)
    const { getUserByFirebaseUid, createUser } = await import('../config/supabase.js');
    
    let user;
    try {
      user = await getUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        user = await createUser({
          firebase_uid: decodedToken.uid,
          email: decodedToken.email || `${decodedToken.uid}@firebase.local`,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
          avatar_url: decodedToken.picture || null
        });
      }
    } catch (dbError) {
      // If database is not available, just return basic user info
      console.warn('Database not available:', dbError.message);
      return res.json({
        success: true,
        user: {
          id: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || 'User',
          avatar_url: decodedToken.picture
        },
        warning: 'Database not connected - user data not persisted'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const { getAuth } = await import('../config/firebase.js');
    
    let auth;
    try {
      auth = getAuth();
    } catch {
      return res.status(500).json({ error: 'Firebase not configured' });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    
    const { getUserByFirebaseUid } = await import('../config/supabase.js');
    const user = await getUserByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      phone: user.phone,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
});

// Refresh user data from Firebase
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const { getAuth } = await import('../config/firebase.js');
    
    let auth;
    try {
      auth = getAuth();
    } catch {
      return res.status(500).json({ error: 'Firebase not configured' });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    
    const { getUserByFirebaseUid, createUser, updateUser } = await import('../config/supabase.js');
    let user = await getUserByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      user = await createUser({
        firebase_uid: decodedToken.uid,
        email: decodedToken.email || `${decodedToken.uid}@firebase.local`,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        avatar_url: decodedToken.picture || null
      });
    } else {
      // Update with latest Firebase data
      user = await updateUser(user.id, {
        name: decodedToken.name || user.name,
        avatar_url: decodedToken.picture || user.avatar_url
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Auth refresh error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
});

export default router;
