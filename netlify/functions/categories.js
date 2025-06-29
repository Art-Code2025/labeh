import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config/firebase.config.js';

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