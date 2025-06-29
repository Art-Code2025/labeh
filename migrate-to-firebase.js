import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './netlify/functions/config/firebase.config.js';
import fs from 'fs';
import path from 'path';

async function migrateData() {
  try {
    console.log('🚀 بدء عملية نقل البيانات إلى Firebase...');

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