import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'bookings'),
            (snapshot) => {
                const bookingsList = snapshot.docs.map(doc => {
                    const data = { id: doc.id, ...doc.data() };
                    console.log('📋 [Dashboard] بيانات الحجز:', {
                        id: data.id,
                        serviceName: data.serviceName,
                        price: data.price,
                        selectedDestination: data.selectedDestination,
                        startLocation: data.startLocation,
                        endLocation: data.endLocation,
                        fullData: data
                    });
                    return data;
                });
                console.log('📊 [Dashboard] إجمالي الحجوزات:', bookingsList.length);
                setBookings(bookingsList);
                setLoading(false);
            },
            (error) => {
                console.error('❌ [Dashboard] خطأ في قراءة الحجوزات:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <div>
            {/* Render your component content here */}
        </div>
    );
};

export default Dashboard; 