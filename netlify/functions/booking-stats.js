import { collection, getDocs } from 'firebase/firestore';
import { db } from './config/firebase.config.js';

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