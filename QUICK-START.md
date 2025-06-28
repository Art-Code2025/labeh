# 🚀 تشغيل سريع - موقع لبيه

## 📋 نظرة عامة
موقع **لبيه** - منصة خدمات التوصيل والصيانة المنزلية
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Netlify Serverless Functions
- **Database**: Firebase Firestore
- **Hosting**: Netlify (جاهز للنشر)

---

## ⚡ تشغيل سريع (محلياً)

### 1. تثبيت التبعيات
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. تشغيل الموقع مع Netlify Dev
```bash
netlify dev
```

الموقع سيعمل على: **http://localhost:8888**

---

## 🌐 الروابط المهمة

### Local Development:
- **الموقع الرئيسي**: http://localhost:8888
- **API Categories**: http://localhost:8888/.netlify/functions/categories
- **API Services**: http://localhost:8888/.netlify/functions/services

### Production (بعد النشر):
- **API Categories**: https://your-site.netlify.app/.netlify/functions/categories
- **API Services**: https://your-site.netlify.app/.netlify/functions/services

---

## 📦 النشر على Netlify

### الطريقة الأولى: GitHub + Netlify Dashboard
1. ادفع الكود إلى **GitHub**
2. اربط المستودع بـ **Netlify**
3. Build Settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
   - **Functions directory**: `netlify/functions`

### الطريقة الثانية: Netlify CLI
```bash
# تسجيل الدخول
netlify login

# ربط المشروع
netlify init

# النشر
netlify deploy --prod
```

---

## 🔧 المميزات

### ✅ جاهز للاستخدام:
- ✅ Firebase متصل ويعمل
- ✅ Netlify Functions تعمل محلياً
- ✅ API يسترجع البيانات (3 فئات، 10 خدمات)
- ✅ واجهة مستخدم احترافية وسريعة الاستجابة
- ✅ تحسين محركات البحث (SEO)
- ✅ تجربة مستخدم ممتازة (UX)

### 🚀 الأداء:
- **سرعة التحميل**: محسن للسرعة
- **الاستجابة**: يعمل على جميع الشاشات
- **الأمان**: Firebase + Netlify Security
- **التوسع**: Auto-scaling مع Netlify

---

## 🛠️ البنية التقنية

```
mawasiem-main/
├── netlify/
│   └── functions/
│       ├── categories.js    # API للفئات
│       └── services.js      # API للخدمات
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx     # الصفحة الرئيسية
│   │   │   └── Categories.tsx
│   │   └── services/
│   │       └── api.ts       # API Client
│   └── dist/                # Build Output
├── netlify.toml            # إعدادات Netlify
└── firebase.config.js      # إعدادات Firebase
```

---

## 🔍 اختبار API

```bash
# اختبار Categories
curl http://localhost:8888/.netlify/functions/categories

# اختبار Services
curl http://localhost:8888/.netlify/functions/services

# اختبار Services لفئة معينة
curl "http://localhost:8888/.netlify/functions/services?category=daily_services"
```

---

## 📱 الصفحات المتاحة

- **الرئيسية**: `/` - عرض الخدمات والفئات
- **الفئات**: `/categories` - عرض جميع الفئات
- **الخدمات**: `/services/:categoryId` - خدمات فئة معينة
- **من نحن**: `/about`
- **اتصل بنا**: `/contact`

---

## 🎯 الحالة الحالية

### ✅ يعمل بشكل مثالي:
- [x] Firebase متصل
- [x] البيانات منقولة (3 فئات، 10 خدمات)
- [x] Netlify Functions تعمل
- [x] Frontend يسترجع البيانات
- [x] واجهة مستخدم كاملة
- [x] جاهز للنشر

### 🚀 جاهز للإنتاج:
الموقع **جاهز 100%** للنشر على Netlify بدون أي تعديلات إضافية!

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. تأكد من أن `netlify dev` يعمل
2. تحقق من Console للأخطاء
3. تأكد من اتصال الإنترنت (Firebase)
4. راجع Firebase Console للبيانات

---

**🎉 الموقع جاهز ويعمل بشكل مثالي! استمتع بالتطوير والنشر! 🎉** 