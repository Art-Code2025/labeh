# 🔧 دليل حل مشاكل Cloudinary

## 🚨 **المشكلة الحالية: "Unknown API key"**

### الخطأ المعروض:
```
❌ Cloudinary API Error: {status: 401, statusText: 'Unauthorized', error: '{"error":{"message":"Unknown API key "}}'}
```

## 🎯 **الحلول المطلوبة:**

### 1. **التحقق من Upload Presets في Cloudinary Console**

#### الخطوات:
1. **اذهب إلى Cloudinary Console**: https://console.cloudinary.com/
2. **تسجيل الدخول** باستخدام حساب lbeh
3. **انتقل إلى Settings** (الإعدادات)
4. **اختر Upload** من القائمة الجانبية
5. **تحقق من وجود Upload Presets**

#### إذا لم تجد أي Upload Presets:
```bash
# إنشاء Upload Preset جديد:
1. انقر "Add upload preset"
2. اختر اسم: "unsigned_preset"
3. اختر Signing Mode: "Unsigned"
4. اختر Folder: "services" (اختياري)
5. فعل "Auto-create folders"
6. فعل "Unique filename"
7. احفظ الإعدادات
```

### 2. **التحقق من صحة الإعدادات**

#### الإعدادات الحالية:
```javascript
CLOUD_NAME: 'lbeh'
API_KEY: '357275813752554'
API_SECRET: '50gxhCM1Yidpw21FPVm81SyjomM'
```

#### للتحقق من صحة الإعدادات:
1. **اذهب إلى Dashboard** في Cloudinary Console
2. **تأكد من Cloud Name**: يجب أن يكون `lbeh`
3. **تأكد من API Key**: يجب أن يكون `357275813752554`
4. **تأكد من API Secret**: يجب أن يكون `50gxhCM1Yidpw21FPVm81SyjomM`

### 3. **اختبار مباشر للإعدادات**

#### استخدم الملف التجريبي:
```bash
# افتح الملف في المتصفح:
frontend/test-cloudinary.html
```

#### أو اختبر مباشرة في Console:
```javascript
// في Console المتصفح:
const testCloudinary = async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#4F46E5';
  ctx.fillRect(0, 0, 10, 10);
  
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'test.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/lbeh/image/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.text();
      console.log('Response:', response.status, result);
    } catch (error) {
      console.error('Error:', error);
    }
  });
};

testCloudinary();
```

## 🔍 **التشخيص المتقدم:**

### 1. **فحص الشبكة**
```bash
# تحقق من الوصول إلى Cloudinary API:
curl -X GET "https://api.cloudinary.com/v1_1/lbeh/image/list" \
  -H "Authorization: Basic $(echo -n '357275813752554:50gxhCM1Yidpw21FPVm81SyjomM' | base64)"
```

### 2. **فحص Upload Presets**
```bash
# الحصول على قائمة Upload Presets:
curl -X GET "https://api.cloudinary.com/v1_1/lbeh/upload_presets" \
  -H "Authorization: Basic $(echo -n '357275813752554:50gxhCM1Yidpw21FPVm81SyjomM' | base64)"
```

## 🛠️ **الحلول البديلة:**

### 1. **استخدام Signed Upload**
```javascript
// في backend (Node.js):
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'lbeh',
  api_key: '357275813752554',
  api_secret: '50gxhCM1Yidpw21FPVm81SyjomM'
});

// إنشاء signature للرفع
const signature = cloudinary.utils.api_sign_request(
  { timestamp: timestamp },
  '50gxhCM1Yidpw21FPVm81SyjomM'
);
```

### 2. **إنشاء Upload Preset جديد**
```javascript
// باستخدام Cloudinary Admin API:
const createUploadPreset = async () => {
  const response = await fetch('https://api.cloudinary.com/v1_1/lbeh/upload_presets', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa('357275813752554:50gxhCM1Yidpw21FPVm81SyjomM')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'unsigned_preset',
      unsigned: true,
      folder: 'services',
      auto_create_folder: true,
      unique_filename: true
    })
  });
  
  const result = await response.json();
  console.log('Upload Preset Created:', result);
};
```

## 📋 **قائمة التحقق:**

- [ ] **تأكد من صحة Cloud Name**: `lbeh`
- [ ] **تأكد من صحة API Key**: `357275813752554`
- [ ] **تأكد من وجود Upload Preset**: `ml_default` أو `unsigned_preset`
- [ ] **تأكد من أن Upload Preset غير موقع**: Unsigned = true
- [ ] **تأكد من عدم وجود قيود على الرفع**: No restrictions
- [ ] **اختبر الرفع مباشرة**: استخدم test-cloudinary.html

## 🎯 **الخطوات التالية:**

1. **افتح Cloudinary Console** وتحقق من الإعدادات
2. **أنشئ Upload Preset جديد** إذا لم يكن موجوداً
3. **اختبر الرفع** باستخدام الملف التجريبي
4. **حدث الكود** إذا احتجت لتغيير Upload Preset

## 📞 **المساعدة:**

إذا استمرت المشكلة، يرجى:
1. **نسخ نتائج الاختبار** من test-cloudinary.html
2. **تصوير شاشة** من Cloudinary Console (Upload Presets)
3. **إرسال تفاصيل الخطأ** كاملة

---

**ملاحظة**: هذا الدليل يغطي جميع الحلول الممكنة لمشكلة "Unknown API key" في Cloudinary. 