# 🔧 متغيرات البيئة - Environment Variables

## 📋 للتطوير المحلي

إنشاء ملف `.env` في الجذر:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Frontend Environment Variables (for React)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Development
NODE_ENV=development
```

## 🌐 للنشر على Netlify

في Netlify Dashboard > Site Settings > Environment Variables:

```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
NODE_ENV=production
```

## 🔥 الحصول على Firebase Keys

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك أو أنشئ مشروع جديد
3. اذهب إلى Project Settings
4. في تبويب "General" > "Your apps"
5. اختر Web App أو أنشئ واحد جديد
6. انسخ الـ Configuration

## ⚠️ ملاحظات مهمة

- **لا تشارك** هذه المفاتيح في الكود المصدري
- استخدم `.env` للتطوير المحلي
- استخدم Netlify Environment Variables للإنتاج
- تأكد من إضافة `.env` إلى `.gitignore`

## 🚀 الحالة الحالية

الموقع يعمل حالياً باستخدام Firebase Configuration المُعد مسبقاً:
- Project ID: `lbeh-81936`
- متصل ويعمل بشكل مثالي
- البيانات متاحة (3 فئات، 10 خدمات) 