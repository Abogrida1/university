# 🚀 دليل النشر على Render - خطوة بخطوة

## 📋 المتطلبات المسبقة

### 1. حساب GitHub
- ✅ حساب GitHub نشط
- ✅ المشروع محفوظ في repository

### 2. حساب Render
- ✅ حساب Render (يمكن التسجيل بـ GitHub)

### 3. إعداد Supabase
- ✅ مشروع Supabase نشط
- ✅ مفاتيح API جاهزة

---

## 🔧 الخطوة 1: إعداد المشروع

### 1.1 تحقق من الملفات المطلوبة
تأكد من وجود هذه الملفات:
```
✅ package.json
✅ next.config.js
✅ render.yaml
✅ .gitignore
✅ src/ (مجلد الكود)
```

### 1.2 اختبار البناء محلياً
```bash
npm install
npm run build
npm start
```

---

## 🌐 الخطوة 2: رفع المشروع على GitHub

### 2.1 إنشاء Repository جديد (إذا لم يكن موجود)
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2.2 التأكد من الرفع
- اذهب لـ GitHub
- تأكد من رؤية جميع الملفات
- تأكد من عدم وجود ملفات `.env` أو `.env.local`

---

## 🚀 الخطوة 3: النشر على Render

### 3.1 تسجيل الدخول لـ Render
1. اذهب لـ [render.com](https://render.com)
2. اضغط "Sign Up"
3. اختر "Continue with GitHub"
4. امنح الصلاحيات المطلوبة

### 3.2 إنشاء مشروع جديد
1. اضغط "New +"
2. اختر "Web Service"
3. اضغط "Connect GitHub repository"
4. اختر repository الخاص بك: `Abogrida1/university`

### 3.3 إعداد المشروع
1. **Name**: `university-materials`
2. **Environment**: `Node`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Plan**: `Free`

### 3.4 إعداد Environment Variables
في قسم "Environment Variables"، أضف:

```
NEXT_PUBLIC_SUPABASE_URL
https://cuhztjuphamulkgfhchcp.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1aHp0anVwaGFtdWxrZ2ZoaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODM1MTgsImV4cCI6MjA3NTM1OTUxOH0.SCSNk7jvn13sBkv5458m52z4f1962dbl85eUFFylTaE

NODE_ENV
production
```

### 3.5 النشر
1. اضغط "Create Web Service"
2. انتظر انتهاء البناء (5-10 دقائق)
3. ستحصل على رابط مثل: `your-app-name.onrender.com`

---

## ✅ الخطوة 4: التحقق من النشر

### 4.1 اختبار الموقع
- ✅ افتح الرابط
- ✅ تأكد من تحميل الصفحة الرئيسية
- ✅ اختبر اختيار البرنامج والسنة
- ✅ تأكد من تحميل المواد
- ✅ اختبر فتح مادة
- ✅ تأكد من عمل PDFs والفيديوهات

### 4.2 اختبار الوظائف
- ✅ التنقل بين الصفحات
- ✅ البحث في المواد
- ✅ فتح الملفات
- ✅ مشاهدة الفيديوهات

---

## 🔧 الخطوة 5: إعدادات إضافية

### 5.1 Domain مخصص (اختياري)
1. اذهب لـ Service Settings
2. اضغط "Custom Domains"
3. أضف domain الخاص بك
4. اتبع التعليمات لإعداد DNS

### 5.2 إعدادات الأداء
- ✅ Render يحسن الأداء تلقائياً
- ✅ CDN عالمي مفعل
- ✅ ضغط Gzip مفعل
- ✅ SSL مفعل

---

## 🐛 استكشاف الأخطاء

### مشكلة: الموقع لا يعمل
**الحل:**
1. تحقق من Environment Variables
2. تأكد من صحة مفاتيح Supabase
3. راجع Build Logs في Render

### مشكلة: البيانات لا تظهر
**الحل:**
1. تحقق من اتصال Supabase
2. تأكد من سياسات الأمان (RLS)
3. اختبر API في Supabase Dashboard

### مشكلة: البناء فشل
**الحل:**
1. راجع Build Logs
2. تأكد من عدم وجود أخطاء في الكود
3. اختبر `npm run build` محلياً

---

## 📊 مراقبة الموقع

### Render Dashboard
- ✅ مراقبة الزوار
- ✅ مراقبة الأداء
- ✅ مراقبة الأخطاء

### Supabase Dashboard
- ✅ مراقبة قاعدة البيانات
- ✅ مراقبة API calls
- ✅ مراقبة Storage

---

## 🎉 تهانينا!

موقعك الآن متاح على الإنترنت! 

**الرابط:** `https://your-app-name.onrender.com`

### نصائح للمستقبل:
- ✅ كل push للـ GitHub سيحدث الموقع تلقائياً
- ✅ استخدم Render Dashboard لمراقبة الأداء
- ✅ احتفظ بنسخ احتياطية من Supabase
- ✅ راقب استخدام Bandwidth

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع Build Logs في Render
2. تحقق من Supabase Dashboard
3. راجع هذا الدليل مرة أخرى

**موقعك جاهز للعالم! 🌍**
