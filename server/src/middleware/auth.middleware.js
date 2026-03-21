import { verifyFirebaseToken, getAuth } from '../config/firebase.js';
import { getUserByFirebaseUid, createUser } from '../config/supabase.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(token);
    } catch (firebaseError) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      });
    }

    // Get or create user in Supabase
    let user = await getUserByFirebaseUid(decodedToken.uid);
    
    if (!user) {
      // Create new user
      user = await createUser({
        firebase_uid: decodedToken.uid,
        email: decodedToken.email || `${decodedToken.uid}@firebase.local`,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        avatar_url: decodedToken.picture || null
      });
    }

    req.user = user;
    req.firebaseUid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication failed' 
    });
  }
}

// Optional auth - doesn't fail if no token, just sets req.user to null
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await verifyFirebaseToken(token);
      const user = await getUserByFirebaseUid(decodedToken.uid);
      req.user = user;
      req.firebaseUid = decodedToken.uid;
    } catch (e) {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}
