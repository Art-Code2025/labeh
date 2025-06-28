import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const bookingsRef = collection(db, 'bookings');
    const servicesRef = collection(db, 'services');
    
    // Get all bookings and services
    const [bookingsSnapshot, servicesSnapshot] = await Promise.all([
      getDocs(bookingsRef),
      getDocs(servicesRef)
    ]);

    const bookings = [];
    bookingsSnapshot.forEach((doc) => {
      bookings.push(doc.data());
    });

    const services = [];
    servicesSnapshot.forEach((doc) => {
      services.push(doc.data());
    });

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      inProgress: bookings.filter(b => b.status === 'in_progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      byCategory: {},
      byService: {}
    };

    // Calculate category stats based on services
    services.forEach(service => {
      const categoryBookings = bookings.filter(b => b.serviceCategory === service.category);
      if (categoryBookings.length > 0) {
        stats.byCategory[service.categoryName || service.category] = categoryBookings.length;
      }
    });

    // Calculate service stats
    services.forEach(service => {
      const serviceBookings = bookings.filter(b => b.serviceName === service.name);
      if (serviceBookings.length > 0) {
        stats.byService[service.name] = serviceBookings.length;
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats)
    };
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