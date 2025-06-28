import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

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
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const bookingsRef = collection(db, 'bookings');
    const path = event.path.replace('/.netlify/functions/bookings', '');
    const segments = path.split('/').filter(Boolean);

    switch (event.httpMethod) {
      case 'GET':
        if (segments[0] === 'stats') {
          // Get booking statistics
          const snapshot = await getDocs(bookingsRef);
          const bookings = [];
          snapshot.forEach((doc) => {
            bookings.push(doc.data());
          });

          const stats = {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            inProgress: bookings.filter(b => b.status === 'in_progress').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            byCategory: {},
            byService: {},
            categoryStats: [],
            dailyStats: []
          };

          // Calculate category and service stats
          bookings.forEach(booking => {
            if (booking.serviceCategory) {
              stats.byCategory[booking.serviceCategory] = (stats.byCategory[booking.serviceCategory] || 0) + 1;
            }
            if (booking.serviceName) {
              stats.byService[booking.serviceName] = (stats.byService[booking.serviceName] || 0) + 1;
            }
          });

          const categoryCount = {};
          const dailyCount = {};

          bookings.forEach((booking) => {
            // Count by category
            const category = booking.category || 'أخرى';
            categoryCount[category] = (categoryCount[category] || 0) + 1;
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
            
            // Count by day
            const date = new Date(booking.createdAt).toISOString().split('T')[0];
            dailyCount[date] = (dailyCount[date] || 0) + 1;
          });

          // Convert to arrays for charts
          stats.categoryStats = Object.entries(categoryCount).map(([category, count]) => ({
            category,
            count
          }));

          stats.dailyStats = Object.entries(dailyCount).map(([date, count]) => ({
            date,
            count
          }));

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(stats)
          };
        } else {
          // Get all bookings
          const q = query(bookingsRef, orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          const bookings = [];
          snapshot.forEach((doc) => {
            bookings.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(bookings)
          };
        }

      case 'POST':
        const newBooking = JSON.parse(event.body);
        const docRef = await addDoc(bookingsRef, {
          ...newBooking,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            id: docRef.id, 
            message: 'Booking created successfully' 
          })
        };

      case 'PUT':
        const { id, ...updateData } = JSON.parse(event.body);
        const bookingDoc = doc(db, 'bookings', id);
        await updateDoc(bookingDoc, {
          ...updateData,
          updatedAt: new Date().toISOString()
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Booking updated successfully' })
        };

      case 'DELETE':
        const deleteId = event.queryStringParameters.id;
        const deleteDocRef = doc(db, 'bookings', deleteId);
        await deleteDoc(deleteDocRef);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Booking deleted successfully' })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error in bookings function:', error);
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