import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "lbeh-81936.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "lbeh-81936",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "lbeh-81936.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "225834423678",
  appId: process.env.FIREBASE_APP_ID || "1:225834423678:web:5955d5664e2a4793c40f2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const categoriesRef = collection(db, 'categories');

    switch (event.httpMethod) {
      case 'GET':
        const snapshot = await getDocs(categoriesRef);
        const categories = [];
        snapshot.forEach((doc) => {
          categories.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(categories)
        };

      case 'POST':
        const newCategory = JSON.parse(event.body);
        const docRef = await addDoc(categoriesRef, {
          ...newCategory,
          createdAt: new Date().toISOString()
        });
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            id: docRef.id, 
            message: 'Category created successfully' 
          })
        };

      case 'PUT':
        const { id, ...updateData } = JSON.parse(event.body);
        const categoryDoc = doc(db, 'categories', id);
        await updateDoc(categoryDoc, {
          ...updateData,
          updatedAt: new Date().toISOString()
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Category updated successfully' })
        };

      case 'DELETE':
        const deleteId = event.queryStringParameters.id;
        const deleteDocRef = doc(db, 'categories', deleteId);
        await deleteDoc(deleteDocRef);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Category deleted successfully' })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
}; 