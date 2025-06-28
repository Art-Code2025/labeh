import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, query, where } from 'firebase/firestore';

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
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const providersRef = collection(db, 'providers');
    const path = event.path.replace('/.netlify/functions/providers', '');
    const segments = path.split('/').filter(Boolean);
    const providerId = segments[0];

    switch (event.httpMethod) {
      case 'GET':
        if (providerId) {
          // Get single provider
          const providerDoc = doc(db, 'providers', providerId);
          const providerSnapshot = await getDoc(providerDoc);
          
          if (!providerSnapshot.exists()) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Provider not found' }) };
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ id: providerSnapshot.id, ...providerSnapshot.data() })
          };
        } else {
          // Get all providers or filtered by category
          const { category } = event.queryStringParameters || {};
          
          let providersQuery = providersRef;
          if (category) {
            providersQuery = query(providersRef, where('category', '==', category));
          }

          const snapshot = await getDocs(providersQuery);
          const providers = [];
          snapshot.forEach((doc) => {
            providers.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // فلترة المقدمين المتاحين فقط للاستعلامات العامة
          const availableProviders = category ? 
            providers.filter(provider => provider.available === true) : 
            providers;

          return { statusCode: 200, headers, body: JSON.stringify(availableProviders) };
        }

      case 'POST':
        // Add new provider
        const newProvider = JSON.parse(event.body);
        const docRef = await addDoc(providersRef, {
          ...newProvider,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            id: docRef.id, 
            message: 'تم إضافة مقدم الخدمة بنجاح'
          })
        };

      case 'PUT':
        // Update provider
        if (!providerId) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Provider ID required' }) };
        }
        
        const updateData = JSON.parse(event.body);
        const providerDoc = doc(db, 'providers', providerId);
        
        await updateDoc(providerDoc, {
          ...updateData,
          updatedAt: new Date().toISOString()
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم تحديث مقدم الخدمة بنجاح' })
        };

      case 'DELETE':
        // Delete provider
        if (!providerId) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Provider ID required' }) };
        }
        
        const providerDocToDelete = doc(db, 'providers', providerId);
        await deleteDoc(providerDocToDelete);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'تم حذف مقدم الخدمة بنجاح' })
        };

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
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