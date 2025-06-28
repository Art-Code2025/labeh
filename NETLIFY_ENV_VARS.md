# متغيرات البيئة المطلوبة لـ Netlify

يجب إضافة هذه المتغيرات في لوحة تحكم Netlify:

## Firebase Configuration
```
REACT_APP_FIREBASE_API_KEY=AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio
REACT_APP_FIREBASE_AUTH_DOMAIN=lbeh-81936.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=lbeh-81936
REACT_APP_FIREBASE_STORAGE_BUCKET=lbeh-81936.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=225834423678
REACT_APP_FIREBASE_APP_ID=1:225834423678:web:5955d5664e2a4793c40f2f
```

## Cloudinary Configuration
```
REACT_APP_CLOUDINARY_CLOUD_NAME=djyduqnzj
REACT_APP_CLOUDINARY_UPLOAD_PRESET=unsigned_preset
```

## كيفية إضافة المتغيرات في Netlify:

1. اذهب إلى لوحة تحكم Netlify
2. اختر موقعك
3. اذهب إلى Site settings > Environment variables
4. أضف كل متغير بالاسم والقيمة المحددة أعلاه

## ملاحظة مهمة:
- جميع المتغيرات تبدأ بـ `REACT_APP_` لأن Vite يتطلب ذلك
- القيم الموجودة هنا هي القيم الافتراضية المستخدمة في الكود
- يمكن تشغيل الموقع بدون هذه المتغيرات لأن الكود يحتوي على قيم افتراضية 