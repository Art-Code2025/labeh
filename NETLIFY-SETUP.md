# 🚀 دليل إعداد Netlify للمشروع

## 📋 المتطلبات الأساسية

### 1. متغيرات البيئة في Netlify

يجب إضافة هذه المتغيرات في **Site Settings** > **Environment Variables** في Netlify:

#### Firebase Configuration:
```
FIREBASE_API_KEY=AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio
FIREBASE_AUTH_DOMAIN=lbeh-81936.firebaseapp.com
FIREBASE_PROJECT_ID=lbeh-81936
FIREBASE_STORAGE_BUCKET=lbeh-81936.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=225834423678
FIREBASE_APP_ID=1:225834423678:web:5955d5664e2a4793c40f2f
```

#### Cloudinary Configuration (اختيارية للصور):
```
CLOUDINARY_CLOUD_NAME=lbeh
CLOUDINARY_API_KEY=357275813752554
CLOUDINARY_API_SECRET=50gxhCM1Yidpw21FPVm81SyjomM
```

### 2. إعدادات Build في Netlify

```toml
# Build command
npm ci && npm run build

# Publish directory
frontend/dist

# Functions directory
frontend/netlify/functions
```

### 3. إعدادات Redirects

هذه الإعدادات موجودة بالفعل في `netlify.toml`:

```toml
[[redirects]]
  from = "/.netlify/functions/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔧 خطوات التنفيذ

### الخطوة 1: رفع البيانات الأولية لـ Firebase
```bash
npm run seed-firebase
```

### الخطوة 2: التأكد من تسمية الـ Functions
يجب أن تكون الملفات في `frontend/netlify/functions/`:
- `services.js` - إدارة الخدمات
- `categories.js` - إدارة الفئات  
- `bookings.js` - إدارة الحجوزات
- `booking-stats.js` - إحصائيات الحجوزات

### الخطوة 3: Deploy إلى Netlify
1. ادفع التغييرات إلى Git
2. Netlify سيقوم بـ build وdeploy تلقائياً
3. تأكد من وجود الـ Functions في لوحة Netlify

## 🐛 حل المشاكل الشائعة

### مشكلة: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**السبب**: الـ Netlify Functions غير متاحة أو فيها خطأ

**الحل**:
1. تأكد من وجود المتغيرات في Netlify Environment Variables
2. تأكد من مسار الـ Functions في `netlify.toml`
3. تحقق من الـ Firebase Database أن فيه بيانات

### مشكلة: Functions لا تعمل

**الحل**:
1. تحقق من Netlify Function logs
2. تأكد من صحة Firebase config
3. تأكد من وجود البيانات في Firebase

### مشكلة: صفحة الخدمة فاضية

**الحل**:
1. تأكد من وجود البيانات في Firebase
2. تحقق من أن `services` function تدعم `/services/:id`
3. تأكد من Firebase Security Rules

## 📊 Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
      allow write: if true; // للتطوير فقط - يجب تقييدها لاحقاً
    }
  }
}
```

## ✅ التحقق من نجاح Setup

1. **الداش بورد**: `https://your-site.netlify.app/dashboard`
2. **API Functions**: `https://your-site.netlify.app/.netlify/functions/services`
3. **صفحة الخدمة**: `https://your-site.netlify.app/service/:id`

إذا كل شيء يعمل صح، الداش بورد هيعرض البيانات وصفحات الخدمات هتشتغل طبيعي! 🎉 