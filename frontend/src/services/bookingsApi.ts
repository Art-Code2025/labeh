import { db } from '../firebase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8888/.netlify/functions';

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  categoryName?: string;
  price?: string;
  // Customer info - supporting both old and new field names
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
  bookingDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  customAnswers?: Record<string, any>;
  customAnswersWithQuestions?: Record<string, { question: string; answer: any; type: string }>;
  
  // Additional fields for different service types
  startLocation?: string;
  endLocation?: string;
  destination?: string;
  selectedDestination?: string;
  tripDuration?: string;
  issueDescription?: string;
  preferredTime?: string;
  deliveryLocation?: string;
  urgentDelivery?: boolean;
  serviceDetails?: string;
  tripDetails?: {
    destination: string;
    price: string;
    duration: string;
    startLocation: string;
    endLocation: string;
  };
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  byCategory: Record<string, number>;
  byService: Record<string, number>;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    count: number;
  }>;
}

// Enhanced API call function with better error handling
async function makeApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        
        // Get response text first to check content
        const responseText = await response.text();
        
        // Check if response starts with HTML (common error indicator)
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error('API endpoint not available');
        }
        
        // Check if response is empty
        if (!responseText.trim()) {
            throw new Error('Empty response from server');
        }
        
        // Try to parse JSON
        let jsonData: T;
        try {
            jsonData = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error('Invalid JSON response');
        }
        
        // Check HTTP status after parsing
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return jsonData;
    } catch (error) {
        // Only log detailed errors in development
        if (process.env.NODE_ENV === 'development') {
            console.debug(`API fallback to Firebase for ${endpoint}`);
        }
        throw error;
    }
}

// Firebase operations for bookings
async function getBookingsFromFirebase(): Promise<any[]> {
    try {
        const querySnapshot = await getDocs(collection(db, 'bookings'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Firebase read failed for bookings:', error);
        throw new Error('Failed to read bookings from database');
    }
}

async function addBookingToFirebase(data: any): Promise<{ id: string }> {
    try {
        console.log('🔥 [bookingsApi] البيانات الواردة لـ Firebase:', data);
        console.log('🔍 [bookingsApi] التحقق من البيانات المهمة:', {
            serviceName: data.serviceName,
            price: data.price,
            selectedDestination: data.selectedDestination,
            startLocation: data.startLocation,
            endLocation: data.endLocation
        });
        
        const finalData = {
            ...data,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('📦 [bookingsApi] البيانات النهائية للحفظ:', finalData);
        
        const docRef = await addDoc(collection(db, 'bookings'), finalData);
        
        console.log('✅ [bookingsApi] تم الحفظ بنجاح - Document ID:', docRef.id);
        
        return { id: docRef.id };
    } catch (error) {
        console.error('❌ [bookingsApi] فشل في الحفظ:', error);
        throw new Error('Failed to add booking to database');
    }
}

async function updateBookingInFirebase(id: string, data: any): Promise<{ message: string }> {
    try {
        await updateDoc(doc(db, 'bookings', id), {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { message: 'Updated successfully' };
    } catch (error) {
        console.error('Firebase update failed for bookings:', error);
        throw new Error('Failed to update booking in database');
    }
}

async function deleteBookingFromFirebase(id: string): Promise<{ message: string }> {
    try {
        await deleteDoc(doc(db, 'bookings', id));
        return { message: 'Deleted successfully' };
    } catch (error) {
        console.error('Firebase delete failed for bookings:', error);
        throw new Error('Failed to delete booking from database');
    }
}

// Main API functions
export const fetchBookings = async (): Promise<any[]> => {
    try {
        return await makeApiCall<any[]>('/bookings');
    } catch (error) {
        console.log('�� Using Firebase for bookings');
        return await getBookingsFromFirebase();
    }
};

export const createBooking = async (bookingData: any): Promise<{id: string}> => {
    try {
        return await makeApiCall('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    } catch (error) {
        console.log('🔄 Using Firebase for booking creation');
        return await addBookingToFirebase(bookingData);
    }
};

export const updateBooking = async (bookingId: string, status: Booking['status']) => {
  try {
    console.log(`🔄 [bookingsApi] تحديث حالة الحجز ${bookingId} إلى ${status}`);
    
    // التحقق من صحة البيانات
    if (!bookingId || !bookingId.trim()) {
      console.error('❌ [bookingsApi] معرف الحجز مطلوب');
      throw new Error('معرف الحجز مطلوب');
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'in_progress'];
    if (!validStatuses.includes(status)) {
      console.error('❌ [bookingsApi] حالة الحجز غير صحيحة:', status);
      throw new Error('حالة الحجز غير صحيحة');
    }

    const bookingRef = doc(db, 'bookings', bookingId);
    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };

    console.log(`📦 [bookingsApi] البيانات المراد تحديثها:`, updateData);

    // محاولة التحديث مع timeout
    const updatePromise = updateDoc(bookingRef, updateData);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('انتهت مهلة التحديث')), 10000); // 10 ثواني
    });

    await Promise.race([updatePromise, timeoutPromise]);

    console.log(`✅ [bookingsApi] تم تحديث الحجز بنجاح`);
    return true;
  } catch (error: any) {
    console.error('❌ [bookingsApi] خطأ في تحديث الحجز:', error);
    
    // معالجة أنواع الأخطاء المختلفة
    if (error.code === 'not-found') {
      console.error('❌ [bookingsApi] الحجز غير موجود');
    } else if (error.code === 'permission-denied') {
      console.error('❌ [bookingsApi] ليس لديك صلاحية لتحديث هذا الحجز');
    } else if (error.message?.includes('انتهت مهلة التحديث')) {
      console.error('❌ [bookingsApi] انتهت مهلة التحديث');
    } else {
      console.error('❌ [bookingsApi] خطأ غير متوقع:', error.message);
    }
    
    return false;
  }
};

export const deleteBooking = async (id: string): Promise<{message: string}> => {
    try {
        return await makeApiCall(`/bookings?id=${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.log('🔄 Using Firebase for booking deletion');
        return await deleteBookingFromFirebase(id);
    }
};

// Calculate stats from bookings data
function calculateStats(bookings: Booking[]): BookingStats {
  const stats: BookingStats = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    byCategory: {},
    byService: {},
    categoryStats: [],
    dailyStats: []
  };

  // Count by status
  bookings.forEach(booking => {
    switch (booking.status) {
      case 'pending': stats.pending++; break;
      case 'confirmed': stats.confirmed++; break;
      case 'in_progress': stats.inProgress++; break;
      case 'completed': stats.completed++; break;
      case 'cancelled': stats.cancelled++; break;
    }

    // Count by category
    const category = booking.serviceCategory || 'غير محدد';
    if (stats.byCategory[category]) {
      stats.byCategory[category]++;
    } else {
      stats.byCategory[category] = 1;
    }

    // Count by service
    if (stats.byService[booking.serviceName]) {
      stats.byService[booking.serviceName]++;
    } else {
      stats.byService[booking.serviceName] = 1;
    }
  });

  // Create category stats array
  stats.categoryStats = Object.entries(stats.byCategory).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / stats.total) * 100)
  }));

  // Calculate daily stats for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  stats.dailyStats = last7Days.map(date => ({
    date,
    count: bookings.filter(booking => 
      booking.createdAt && booking.createdAt.split('T')[0] === date
    ).length
  }));

  return stats;
}

// Bookings API
export const bookingsAPI = {
  async getAll(): Promise<Booking[]> {
    try {
      return await makeApiCall<Booking[]>('/bookings');
    } catch (error) {
      return await getBookingsFromFirebase();
    }
  },

  async getById(id: string): Promise<Booking | null> {
    try {
      return await makeApiCall<Booking>(`/bookings?id=${id}`);
    } catch (error) {
      const allBookings = await getBookingsFromFirebase();
      return allBookings.find(booking => booking.id === id) || null;
    }
  },

  async create(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string }> {
    try {
      return await makeApiCall('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          ...bookingData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
      });
    } catch (error) {
      return await addBookingToFirebase({
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  },

  async updateStatus(id: string, status: Booking['status']): Promise<{ message: string }> {
    try {
      return await makeApiCall(`/bookings?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, status }),
      });
    } catch (error) {
      return await updateBookingInFirebase(id, { status });
    }
  },

  async update(id: string, bookingData: Partial<Booking>): Promise<{ message: string }> {
    // مباشرة إلى Firebase لتجنب خطأ 405 من الـ API
    return await updateBookingInFirebase(id, bookingData);
  },

  async delete(id: string): Promise<{ message: string }> {
    try {
      return await makeApiCall(`/bookings?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return await deleteBookingFromFirebase(id);
    }
  },

  async getStats(): Promise<BookingStats> {
    try {
      return await makeApiCall<BookingStats>('/bookings/stats');
    } catch (error) {
      const bookings = await getBookingsFromFirebase();
      return calculateStats(bookings);
    }
  },

  async getByStatus(status: Booking['status']): Promise<Booking[]> {
    try {
      return await makeApiCall<Booking[]>(`/bookings?status=${status}`);
    } catch (error) {
      const allBookings = await getBookingsFromFirebase();
      return allBookings.filter(booking => booking.status === status);
    }
  }
}; 