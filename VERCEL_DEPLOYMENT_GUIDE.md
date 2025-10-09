# 🚀 دليل النشر على Vercel - خطوة بخطوة

## 📋 المتطلبات المسبقة

### 1. حساب GitHub
- ✅ حساب GitHub نشط
- ✅ المشروع محفوظ في repository

### 2. حساب Vercel
- ✅ حساب Vercel (يمكن التسجيل بـ GitHub)

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
✅ vercel.json
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

### 2.1 إنشاء Repository جديد
```bash
git init
git add .
git commit -m "Initial commit - Ready for Vercel"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 2.2 التأكد من الرفع
- اذهب لـ GitHub
- تأكد من رؤية جميع الملفات
- تأكد من عدم وجود ملفات `.env` أو `.env.local`

---

## 🚀 الخطوة 3: النشر على Vercel

### 3.1 تسجيل الدخول لـ Vercel
1. اذهب لـ [vercel.com](https://vercel.com)
2. اضغط "Sign Up"
3. اختر "Continue with GitHub"
4. امنح الصلاحيات المطلوبة

### 3.2 إنشاء مشروع جديد
1. اضغط "New Project"
2. اختر repository الخاص بك
3. اضغط "Import"

### 3.3 إعداد Environment Variables
في صفحة الإعداد، أضف:

```
NEXT_PUBLIC_SUPABASE_URL
https://your-project-id.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
your-supabase-anon-key
```

### 3.4 النشر
1. اضغط "Deploy"
2. انتظر انتهاء البناء (2-5 دقائق)
3. ستحصل على رابط مثل: `your-site.vercel.app`

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
1. اذهب لـ Project Settings
2. اضغط "Domains"
3. أضف domain الخاص بك
4. اتبع التعليمات لإعداد DNS

### 5.2 إعدادات الأداء
- ✅ Vercel يحسن الأداء تلقائياً
- ✅ CDN عالمي مفعل
- ✅ ضغط Gzip مفعل
- ✅ SSL مفعل

---

## 🐛 استكشاف الأخطاء

### مشكلة: الموقع لا يعمل
**الحل:**
1. تحقق من Environment Variables
2. تأكد من صحة مفاتيح Supabase
3. راجع Build Logs في Vercel

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

### Vercel Analytics
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

**الرابط:** `https://your-site.vercel.app`

### نصائح للمستقبل:
- ✅ كل push للـ GitHub سيحدث الموقع تلقائياً
- ✅ استخدم Vercel Analytics لمراقبة الأداء
- ✅ احتفظ بنسخ احتياطية من Supabase
- ✅ راقب استخدام Bandwidth

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع Build Logs في Vercel
2. تحقق من Supabase Dashboard
3. راجع هذا الدليل مرة أخرى

**موقعك جاهز للعالم! 🌍**
