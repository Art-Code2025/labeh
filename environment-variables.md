# Environment Variables Setup

## Firebase Configuration
قم بإنشاء مشروع Firebase جديد وأضف هذه المتغيرات:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_app_id_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# React App Firebase Configuration (for frontend)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
```

## خطوات الإعداد:

### 1. Firebase Setup:
1. اذهب إلى https://console.firebase.google.com/
2. أنشئ مشروع جديد
3. فعّل Firestore Database
4. أنشئ Web App واحصل على Configuration
5. أضف المتغيرات في Netlify Environment Variables

### 2. Cloudinary Setup:
1. اذهب إلى https://cloudinary.com/
2. أنشئ حساب جديد
3. احصل على Cloud Name, API Key, API Secret
4. أضف المتغيرات في Netlify Environment Variables

### 3. Netlify Deployment:
1. ادفع الكود إلى GitHub
2. اربط المستودع بـ Netlify
3. أضف Environment Variables في Netlify Dashboard
4. Deploy! 