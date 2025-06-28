// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
  authDomain: "lbeh-81936.firebaseapp.com",
  projectId: "lbeh-81936",
  storageBucket: "lbeh-81936.firebasestorage.app",
  messagingSenderId: "225834423678",
  appId: "1:225834423678:web:5955d5664e2a4793c40f2f"
};

// Helper function to initialize Firebase app with error handling
export const getFirebaseApp = async () => {
  try {
    const { initializeApp } = await import('firebase/app');
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

// Helper function to get Firestore instance
export const getFirestore = async () => {
  try {
    const app = await getFirebaseApp();
    const { getFirestore } = await import('firebase/firestore');
    return getFirestore(app);
  } catch (error) {
    console.error('Error getting Firestore:', error);
    throw error;
  }
}; 