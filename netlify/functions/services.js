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
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    const services = [];
    
    snapshot.forEach((doc) => {
      services.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(services)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function getDefaultImage(categoryId) {
  const images = {
    'internal_delivery': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500',
    'external_trips': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
    'home_maintenance': 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=500'
  };
  return images[categoryId] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500';
}

function getDefaultPrice(categoryId) {
  const prices = {
    'internal_delivery': '20 ريال',
    'external_trips': '250-300 ريال',
    'home_maintenance': 'حسب نوع الخدمة'
  };
  return prices[categoryId] || 'حسب المتطلبات';
}

function getDefaultDuration(categoryId) {
  const durations = {
    'internal_delivery': '30-60 دقيقة',
    'external_trips': 'حتى 9 ساعات',
    'home_maintenance': '1-3 ساعات'
  };
  return durations[categoryId] || '1-2 ساعة';
}

function getDefaultFeatures(categoryId) {
  const features = {
    'internal_delivery': [
      'توصيل سريع داخل المدينة',
      'خدمة متاحة 24/7',
      'أسعار مناسبة ومنافسة',
      'إمكانية التوصيل العاجل'
    ],
    'external_trips': [
      'رحلات آمنة ومريحة',
      'سائقون محترفون',
      'مركبات حديثة',
      'حد أقصى 9 ساعات'
    ],
    'home_maintenance': [
      'فنيون مهرة ومتخصصون',
      'قطع غيار أصلية',
      'ضمان على الخدمة',
      'استشارة مجانية'
    ]
  };
  return features[categoryId] || ['خدمة احترافية', 'جودة عالية', 'أسعار منافسة'];
}

function getDetailedDescription(categoryId) {
  const descriptions = {
    'internal_delivery': `خدمات التوصيل الداخلي السريع والموثوق داخل المدينة. نوفر لك حلول التوصيل لجميع احتياجاتك اليومية بسرعة وكفاءة عالية.

خدماتنا تشمل:
• توصيل الأدوية والمستلزمات الطبية
• توصيل المشتريات والبقالة
• توصيل الوجبات والطعام
• المشاوير السريعة والطارئة
• توصيل الوثائق المهمة

مع فريق متخصص وأساليب حديثة لضمان وصول طلبك بأمان وفي الوقت المحدد.`,

    'external_trips': `رحلات خارجية مريحة وآمنة إلى خميس مشيط وأبها والمناطق المجاورة. خدماتنا مصممة لتلبية احتياجاتك في الرحلات الطبية والعائلية والتجارية.

خدماتنا تشمل:
• رحلات إلى خميس مشيط (250 ريال)
• رحلات إلى أبها (300 ريال)
• رحلات المستشفيات والعيادات
• رحلات المناسبات العائلية
• رحلات العمل والتجارة
• إمكانية الذهاب والإياب

مع سائقين محترفين ومركبات مريحة لضمان رحلة آمنة وممتعة.`,

    'home_maintenance': `خدمات الصيانة المنزلية الشاملة على يد فنيين متخصصين. نحل جميع مشاكل منزلك من السباكة والكهرباء إلى الدهانات والترميم.

خدماتنا تشمل:
• السباكة وإصلاح التسريبات
• الأعمال الكهربائية والإضاءة
• الدهانات والديكور
• صيانة الأجهزة المنزلية
• أعمال البلاط والسيراميك
• إصلاح النوافذ والأبواب

فريق متخصص يستخدم قطع غيار أصلية مع ضمان شامل على جميع الأعمال.`
  };
  
  return descriptions[categoryId] || 'خدمة متخصصة بأعلى معايير الجودة والاحترافية.';
} 