import { db } from '../firebase.config';

// Helper function to get Firestore instance
export const getFirestoreDb = () => {
  return db;
};

// Helper function to handle Firebase errors
export const handleFirebaseError = (error: any) => {
  console.error('Firebase error:', error);
  throw error;
}; 