import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCaKDPVyZD1SvJpPuPVaBdmx9gNNJY4hoo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "neuro-ai-9833c.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://neuro-ai-9833c-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "neuro-ai-9833c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "neuro-ai-9833c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "800072405128",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:800072405128:web:253513f6bf16fe3b25cf3d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QG8LFFT09Y"
};

const isValidConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY");

export const app = isValidConfig && !getApps().length ? initializeApp(firebaseConfig) : (getApps().length ? getApp() : null);
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
