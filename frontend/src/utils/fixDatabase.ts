import { db } from '../firebase.config';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

// Flexible categories that can be edited/deleted
const flexibleCategories = [
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

// Create a completely flexible database structure
export const createFlexibleDatabase = async () => {
  console.log('🔄 Creating completely flexible database structure...');
  
  try {
    // Step 1: Clear ALL existing categories (including hardcoded ones)
    console.log('🗑️ Removing all existing categories...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    for (const docSnapshot of categoriesSnapshot.docs) {
      await deleteDoc(doc(db, 'categories', docSnapshot.id));
      console.log(`   Deleted category: ${docSnapshot.id}`);
    }

    // Step 2: Clear ALL existing services
    console.log('🗑️ Removing all existing services...');
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    for (const docSnapshot of servicesSnapshot.docs) {
      await deleteDoc(doc(db, 'services', docSnapshot.id));
      console.log(`   Deleted service: ${docSnapshot.id}`);
    }

    // Step 3: Create new categories with AUTO-GENERATED IDs (no hardcoding)
    console.log('✨ Creating new flexible categories...');
    const categoryIds: string[] = [];
    
    for (const category of flexibleCategories) {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date().toISOString()
      });
      categoryIds.push(docRef.id);
      console.log(`   Created category: ${category.name} with ID: ${docRef.id}`);
    }

    // Step 4: Create new services with references to the new category IDs
    console.log('✨ Creating new flexible services...');
    const services = [
      {
        name: 'توصيل طلبات',
        categoryId: categoryIds[0], // Reference to first category
        categoryName: flexibleCategories[0].name,
        homeShortDescription: 'خدمة توصيل الطلبات والمشتريات',
        price: 'حسب المسافة',
        duration: 'حسب الموقع',
      },
      {
        name: 'رحلات بين المدن',
        categoryId: categoryIds[1], // Reference to second category
        categoryName: flexibleCategories[1].name,
        homeShortDescription: 'رحلات آمنة ومريحة بين المدن',
        price: 'حسب المسافة',
        duration: 'حسب الوجهة',
      },
      {
        name: 'صيانة عامة',
        categoryId: categoryIds[2], // Reference to third category
        categoryName: flexibleCategories[2].name,
        homeShortDescription: 'خدمات الصيانة المنزلية المتنوعة',
        price: 'حسب نوع الخدمة',
        duration: 'حسب العمل المطلوب',
      }
    ];

    for (const service of services) {
      const docRef = await addDoc(collection(db, 'services'), {
        ...service,
        description: service.homeShortDescription,
        features: [],
        detailedImages: [],
        imageDetails: [],
        availability: '24/7',
        createdAt: new Date().toISOString()
      });
      console.log(`   Created service: ${service.name} with ID: ${docRef.id}`);
    }

    console.log('🎉 Flexible database structure created successfully!');
    
    return {
      categories: flexibleCategories.length,
      services: services.length,
      message: 'Flexible database created - all categories are now fully editable and deletable'
    };
  } catch (error) {
    console.error('❌ Error creating flexible database:', error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const fixCategoriesStructure = async () => {
  console.log('⚠️ Using legacy fix - consider using createFlexibleDatabase instead');
  return await createFlexibleDatabase();
};

// New function to completely reset and rebuild database
export const completelyResetDatabase = async () => {
  console.log('🔄 Completely resetting database to flexible structure...');
  return await createFlexibleDatabase();
};

export const checkDatabaseStructure = async () => {
  console.log('🔍 Checking database structure...');
  
  try {
    const [categoriesSnapshot, servicesSnapshot] = await Promise.all([
      getDocs(collection(db, 'categories')),
      getDocs(collection(db, 'services'))
    ]);

    console.log('📊 Current categories:');
    categoriesSnapshot.forEach(doc => {
      console.log(`  - ID: ${doc.id}, Name: ${doc.data().name}`);
    });

    console.log('📊 Current services:');
    servicesSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ID: ${doc.id}, Name: ${data.name}, CategoryID: ${data.categoryId || data.category}`);
    });

    return {
      categories: categoriesSnapshot.size,
      services: servicesSnapshot.size
    };
  } catch (error) {
    console.error('❌ Error checking database structure:', error);
    throw error;
  }
}; 