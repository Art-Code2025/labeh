import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from './config/firebase.config.js';

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
    const bookingsRef = collection(db, 'bookings');
    const path = event.path.replace('/.netlify/functions/bookings', '');
    const segments = path.split('/').filter(Boolean);
    const bookingId = segments[0];

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