import admin from 'firebase-admin';
import { config } from './env.js';

let firebaseInitialized = false;

export function initializeFirebase() {
  if (firebaseInitialized) return;

  // Check if we have the required config
  if (!config.FIREBASE_PROJECT_ID || !config.FIREBASE_PRIVATE_KEY || !config.FIREBASE_CLIENT_EMAIL) {
    console.log('⚠️  Firebase Admin configuration incomplete');
    console.log('   Please add to server/.env:');
    console.log('   - FIREBASE_PROJECT_ID');
    console.log('   - FIREBASE_PRIVATE_KEY');
    console.log('   - FIREBASE_CLIENT_EMAIL');
    console.log('   Auth features will use fallback mode');
    return;
  }

  try {
    const privateKey = config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
      }),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed:', error.message);
    console.warn('   Auth routes will use fallback mode');
  }
}

export function verifyFirebaseToken(token) {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized');
  }
  
  return admin.auth().verifyIdToken(token);
}

export function getAuth() {
  if (!firebaseInitialized) {
    throw new Error('Firebase not initialized - check your .env configuration');
  }
  return admin.auth();
}
