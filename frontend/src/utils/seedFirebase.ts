import { db } from '../firebase.config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Real categories data
const realCategories = [
  {
    name: 'التوصيل والمشاوير الداخلية',
    description: 'خدمات التوصيل والمشاوير داخل المدينة',
    icon: '🚚',
    color: 'blue',
  },
  {
    name: 'المشاوير الخارجية',
    description: 'الرحلات والمشاوير بين المدن',
    icon: '🗺️',
    color: 'green',
  },
  {
    name: 'الصيانة المنزلية',
    description: 'خدمات الصيانة والإصلاح المنزلي',
    icon: '🔧',
    color: 'orange',
  }
];

// Real services data
const realServices = [
  {
    name: 'توصيل طلبات',
    category: 'internal_delivery',
    categoryName: 'التوصيل والمشاوير الداخلية',
    homeShortDescription: 'خدمة توصيل الطلبات والمشتريات',
    price: 'حسب المسافة',
    duration: 'حسب الموقع',
  },
  {
    name: 'رحلات بين المدن',
    category: 'external_trips',
    categoryName: 'المشاوير الخارجية',
    homeShortDescription: 'رحلات آمنة ومريحة بين المدن',
    price: 'حسب المسافة',
    duration: 'حسب الوجهة',
  },
  {
    name: 'صيانة عامة',
    category: 'home_maintenance',
    categoryName: 'الصيانة المنزلية',
    homeShortDescription: 'خدمات الصيانة المنزلية المتنوعة',
    price: 'حسب نوع الخدمة',
    duration: 'حسب العمل المطلوب',
  }
];

// Real providers data with authentic Arabic names and phone numbers
const realProviders = [
  {
    name: 'محمد عبدالله الأحمد',
    category: 'internal_delivery',
    whatsapp: '+966550123456',
    services: ['توصيل طلبات'],
    rating: 4.5,
    available: true,
    specialties: ['التوصيل السريع'],
    destinations: ['الرياض', 'الدمام', 'جدة'],
  },
  {
    name: 'عبدالعزيز سعد المطيري',
    category: 'external_trips',
    whatsapp: '+966551234567',
    services: ['رحلات بين المدن'],
    rating: 4.7,
    available: true,
    specialties: ['الرحلات الطويلة'],
    destinations: ['جميع مناطق المملكة'],
  },
  {
    name: 'أحمد فهد الشهري',
    category: 'home_maintenance',
    whatsapp: '+966552345678',
    services: ['صيانة عامة'],
    rating: 4.3,
    available: true,
    specialties: ['الصيانة المنزلية'],
    destinations: ['المنطقة الشرقية'],
  }
];

export const clearAllCollections = async () => {
  console.log('🗑️ Clearing all collections...');
  
  try {
    // Clear categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    for (const docSnapshot of categoriesSnapshot.docs) {
      await deleteDoc(doc(db, 'categories', docSnapshot.id));
    }

    // Clear services
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    for (const docSnapshot of servicesSnapshot.docs) {
      await deleteDoc(doc(db, 'services', docSnapshot.id));
    }

    // Clear providers
    const providersSnapshot = await getDocs(collection(db, 'providers'));
    for (const docSnapshot of providersSnapshot.docs) {
      await deleteDoc(doc(db, 'providers', docSnapshot.id));
    }

    // Clear bookings
    const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
    for (const docSnapshot of bookingsSnapshot.docs) {
      await deleteDoc(doc(db, 'bookings', docSnapshot.id));
    }

    console.log('✅ All collections cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing collections:', error);
    throw error;
  }
};

export const seedFirebaseData = async () => {
  console.log('🌱 Starting to seed Firebase with real data...');
  
  try {
    // Add categories
    console.log('📁 Adding categories...');
    for (const category of realCategories) {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${realCategories.length} categories`);

    // Add services
    console.log('🛠️ Adding services...');
    for (const service of realServices) {
      await addDoc(collection(db, 'services'), {
        ...service,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${realServices.length} services`);

    // Add providers
    console.log('👥 Adding providers...');
    for (const provider of realProviders) {
      await addDoc(collection(db, 'providers'), {
        ...provider,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`✅ Added ${realProviders.length} providers`);

    console.log('🎉 Firebase real data seeding completed successfully!');
    
    return {
      categories: realCategories.length,
      services: realServices.length,
      providers: realProviders.length,
      bookings: 0
    };
  } catch (error) {
    console.error('❌ Error seeding Firebase data:', error);
    throw error;
  }
};

export const seedOnlyMissingData = async () => {
  console.log('🔍 Checking for missing data...');
  
  try {
    // Check what's already in Firebase
    const [categoriesSnapshot, servicesSnapshot, providersSnapshot] = await Promise.all([
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'providers'))
    ]);

    const counts = {
      categories: categoriesSnapshot.size,
      services: servicesSnapshot.size,
      providers: providersSnapshot.size,
      bookings: 0 // Bookings will be added by real users only
    };

    console.log('📊 Current data counts:', counts);

    // Add categories if missing
    if (counts.categories === 0) {
      console.log('📁 Adding categories (missing)...');
      for (const category of realCategories) {
        await addDoc(collection(db, 'categories'), {
          ...category,
          createdAt: new Date().toISOString()
        });
      }
      console.log(`✅ Added ${realCategories.length} categories`);
    }

    // Add services if missing
    if (counts.services === 0) {
      console.log('🛠️ Adding services (missing)...');
      for (const service of realServices) {
        await addDoc(collection(db, 'services'), {
          ...service,
          createdAt: new Date().toISOString()
        });
      }
      console.log(`✅ Added ${realServices.length} services`);
    }

    // Add providers if missing
    if (counts.providers === 0) {
      console.log('👥 Adding providers (missing)...');
      for (const provider of realProviders) {
        await addDoc(collection(db, 'providers'), {
          ...provider,
          createdAt: new Date().toISOString()
        });
      }
      console.log(`✅ Added ${realProviders.length} providers`);
    }

    console.log('✅ Missing data check completed!');
    return counts;
  } catch (error) {
    console.error('❌ Error checking/adding missing data:', error);
    throw error;
  }
}; 