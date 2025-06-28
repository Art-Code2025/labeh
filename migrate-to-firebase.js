import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Firebase configuration مع البيانات الحقيقية
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "lbeh-81936.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "lbeh-81936",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "lbeh-81936.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "225834423678",
  appId: process.env.FIREBASE_APP_ID || "1:225834423678:web:5955d5664e2a4793c40f2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateData() {
  try {
    console.log('🚀 بدء عملية نقل البيانات إلى Firebase...');
    console.log('🔥 Project ID:', firebaseConfig.projectId);

    // قراءة بيانات الكاتيجوريز
    const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

    // قراءة بيانات الخدمات
    const servicesPath = path.join(process.cwd(), 'data', 'services.json');
    const servicesData = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));

    console.log(`📊 البيانات المحلية:`);
    console.log(`   - الكاتيجوريز: ${categoriesData.length}`);
    console.log(`   - الخدمات: ${servicesData.length}`);

    // التحقق من وجود البيانات في Firebase
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const servicesSnapshot = await getDocs(collection(db, 'services'));

    if (categoriesSnapshot.empty) {
      console.log('📁 نقل الكاتيجوريز...');
      for (const category of categoriesData) {
        await addDoc(collection(db, 'categories'), {
          ...category,
          createdAt: new Date().toISOString()
        });
        console.log(`✅ تم نقل الكاتيجوري: ${category.name}`);
      }
    } else {
      console.log('⚠️ الكاتيجوريز موجودة بالفعل في Firebase');
    }

    if (servicesSnapshot.empty) {
      console.log('🛠️ نقل الخدمات...');
      for (const service of servicesData) {
        await addDoc(collection(db, 'services'), {
          ...service,
          createdAt: new Date().toISOString()
        });
        console.log(`✅ تم نقل الخدمة: ${service.name}`);
      }
    } else {
      console.log('⚠️ الخدمات موجودة بالفعل في Firebase');
    }

    console.log('🎉 تم نقل البيانات بنجاح!');
    
    // إحصائيات
    const finalCategoriesSnapshot = await getDocs(collection(db, 'categories'));
    const finalServicesSnapshot = await getDocs(collection(db, 'services'));
    
    console.log(`📊 الإحصائيات النهائية:`);
    console.log(`   - الكاتيجوريز: ${finalCategoriesSnapshot.size}`);
    console.log(`   - الخدمات: ${finalServicesSnapshot.size}`);

  } catch (error) {
    console.error('❌ خطأ في نقل البيانات:', error);
    console.error('تفاصيل الخطأ:', error.message);
  }
}

// تشغيل النقل
migrateData(); 