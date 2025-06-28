// Firebase Environment Variables Setup
// نسخ هذه المتغيرات إلى .env في المشروع أو Netlify Environment Variables

export const firebaseEnvVars = `
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio
FIREBASE_AUTH_DOMAIN=lbeh-81936.firebaseapp.com
FIREBASE_PROJECT_ID=lbeh-81936
FIREBASE_STORAGE_BUCKET=lbeh-81936.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=225834423678
FIREBASE_APP_ID=1:225834423678:web:5955d5664e2a4793c40f2f

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=lbeh
CLOUDINARY_API_KEY=357275813752554
CLOUDINARY_API_SECRET=50gxhCM1Yidpw21FPVm81SyjomM

# React App Firebase Configuration (for frontend)
REACT_APP_FIREBASE_API_KEY=AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio
REACT_APP_FIREBASE_AUTH_DOMAIN=lbeh-81936.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=lbeh-81936
REACT_APP_FIREBASE_STORAGE_BUCKET=lbeh-81936.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=225834423678
REACT_APP_FIREBASE_APP_ID=1:225834423678:web:5955d5664e2a4793c40f2f
`;

console.log('🔥 Firebase & Cloudinary Environment Variables:');
console.log(firebaseEnvVars); 