import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
  authDomain: "lbeh-81936.firebaseapp.com",
  projectId: "lbeh-81936",
  storageBucket: "lbeh-81936.firebasestorage.app",
  messagingSenderId: "225834423678",
  appId: "1:225834423678:web:5955d5664e2a4793c40f2f"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific settings
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Configure Firestore
const firestoreSettings = {
  experimentalForceLongPolling: true, // This can help with CORS issues
  useFetchStreams: false, // Disable streaming
  merge: true // Enable document field merging
};

// @ts-ignore
db.settings(firestoreSettings);

export { db, storage, auth };
export default app; 