import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDbyJCaaM_9KYB30w_XqbbbUO7aqKzY61Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aeon-ecommerece.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aeon-ecommerece",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aeon-ecommerece.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "551264000359",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:551264000359:web:7d6c125759d2ea6be337c2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H0B48J9DZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
