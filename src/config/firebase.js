import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:demo"
};

let app, auth, db;

try {
  // Initialize Firebase only if we have valid config
  if (process.env.REACT_APP_FIREBASE_API_KEY && process.env.REACT_APP_FIREBASE_API_KEY !== "demo-api-key") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    // Mock Firebase for development
    console.warn('Firebase not configured. Using mock authentication.');
    auth = null;
    db = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  auth = null;
  db = null;
}

export { auth, db };
export default app;