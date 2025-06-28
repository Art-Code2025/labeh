import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
  authDomain: "lbeh-81936.firebaseapp.com",
  projectId: "lbeh-81936",
  storageBucket: "lbeh-81936.firebasestorage.app",
  messagingSenderId: "225834423678",
  appId: "1:225834423678:web:5955d5664e2a4793c40f2f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  enabled: boolean;
  soundEnabled: boolean;
  onNewBooking?: (booking: Booking) => void;
}

export const useRealTimeBookings = ({ 
  enabled, 
  soundEnabled, 
  onNewBooking 
}: UseRealTimeBookingsProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastCount, setLastCount] = useState(0);
  const [newBookingAlert, setNewBookingAlert] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch bookings function using Firebase directly
  const fetchBookings = async () => {
    try {
      // جلب الحجوزات من Firebase مباشرة
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const data: Booking[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        } as Booking);
      });

      // Check for new bookings
      if (lastCount > 0 && data.length > lastCount) {
        const newBookings = data.slice(0, data.length - lastCount);
        handleNewBookings(newBookings);
      }

      setBookings(data);
      setLastCount(data.length);
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Handle new bookings notifications
  const handleNewBookings = (newBookings: Booking[]) => {
    newBookings.forEach((booking: Booking) => {
      toast.success(
        `🔔 طلب جديد: ${booking.serviceName} من ${booking.fullName}`,
        {
          position: "top-right",
          autoClose: 8000,
          className: 'rtl',
          style: { direction: 'rtl' }
        }
      );
      
      if (onNewBooking) {
        onNewBooking(booking);
      }
    });

    // Play sound notification
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show visual alert
    setNewBookingAlert(true);
    setTimeout(() => setNewBookingAlert(false), 3000);
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Fallback: create beep sound using Web Audio API
          createBeepSound();
        });
      } else {
        createBeepSound();
      }
    } catch (error) {
      console.log('Could not play notification sound');
    }
  };

  // Create beep sound using Web Audio API
  const createBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Web Audio API not supported');
    }
  };

  // Set up real-time polling
  useEffect(() => {
    if (enabled) {
      // Initial fetch
      fetchBookings();
      
      // Set up polling every 5 seconds
      intervalRef.current = setInterval(fetchBookings, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, soundEnabled, lastCount]);

  return {
    bookings,
    newBookingAlert,
    refetch: fetchBookings
  };
}; 