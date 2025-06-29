import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, signInAnonymously } from 'firebase/auth';

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

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Enable offline persistence
try {
  const settings = {
    cacheSizeBytes: 50000000, // 50 MB cache size
    experimentalForceLongPolling: true,
    useFetchStreams: false
  };
  
  // @ts-ignore
  db.settings(settings);
  
  console.log('Firestore settings applied successfully');
} catch (error) {
  console.error('Error applying Firestore settings:', error);
}

// Initialize anonymous authentication for public access
signInAnonymously(auth)
  .then(() => {
    console.log('Anonymous auth successful');
  })
  .catch((error) => {
    console.error('Anonymous auth failed:', error);
  });

export default app; 