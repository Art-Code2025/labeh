import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
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

// Initialize Firebase services with multi-tab persistence
const initializeFirestore = async () => {
  try {
    await enableMultiTabIndexedDbPersistence(getFirestore(app));
    console.log('Multi-tab persistence enabled successfully');
  } catch (err) {
    console.warn('Error enabling persistence:', err);
    // Fall back to memory-only mode
    return getFirestore(app);
  }
};

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Initialize persistence
initializeFirestore().catch(console.error);

export default app; 