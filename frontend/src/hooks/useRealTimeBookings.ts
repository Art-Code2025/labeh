import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  serviceDetails: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  // بيانات إضافية حسب الفئة
  deliveryLocation?: string;
  urgentDelivery?: boolean;
  startLocation?: string;
  destination?: string;
  destinationType?: string;
  appointmentTime?: string;
  returnTrip?: boolean;
  passengers?: number;
  issueDescription?: string;
  urgencyLevel?: string;
  preferredTime?: string;
}

interface UseRealTimeBookingsProps {
  onNewBooking?: (booking: Booking) => void;
  soundEnabled?: boolean;
}

export const useRealTimeBookings = ({ onNewBooking, soundEnabled = false }: UseRealTimeBookingsProps = {}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastCount, setLastCount] = useState(0);
  const [newBookingAlert, setNewBookingAlert] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Initialize audio
  useEffect(() => {
    // Create a simple beep sound using Web Audio API as fallback
    try {
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 0.7;
    } catch (error) {
      console.log('Audio file not found, will use Web Audio API beep');
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle new bookings notifications
  const handleNewBookings = (newBookings: Booking[]) => {
    setNewBookingAlert(true);
    if (soundEnabled) {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(console.error);
    }
    if (onNewBooking) {
      newBookings.forEach(booking => onNewBooking(booking));
    }
  };

  useEffect(() => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsData: Booking[] = [];
        snapshot.forEach((doc) => {
          bookingsData.push({
            id: doc.id,
            ...doc.data()
          } as Booking);
        });
        setBookings(bookingsData);
        setLoading(false);
        if (lastCount > 0 && bookingsData.length > lastCount) {
          const newBookings = bookingsData.slice(0, bookingsData.length - lastCount);
          handleNewBookings(newBookings);
        }
        setLastCount(bookingsData.length);
      }, (err: Error) => {
        console.error('Error fetching bookings:', err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up real-time listener:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unknown error occurred'));
      }
      setLoading(false);
    }
  }, [lastCount, onNewBooking, soundEnabled]);

  return {
    bookings,
    loading,
    error,
    newBookingAlert,
    refetch: () => {
      // Implementation of refetch function if needed
    }
  };
}; 