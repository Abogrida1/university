# إعداد الإنتاج - Production Setup

## متطلبات الإنتاج

### 1. متغيرات البيئة (Environment Variables)

أنشئ ملف `.env.production.local` في المجلد الجذر وأضف:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. إعداد Supabase

تأكد من أن لديك:

- ✅ مشروع Supabase نشط
- ✅ جداول البيانات مُنشأة (materials, pdfs, videos, users)
- ✅ سياسات الأمان (RLS) مُعدة بشكل صحيح
- ✅ مفاتيح API صحيحة

### 3. بناء المشروع

```bash
npm run build
```

### 4. تشغيل الإنتاج

```bash
npm start
```

## التحقق من الإعداد

### 1. تحقق من الاتصال بـ Supabase
- افتح Developer Tools
- اذهب لتبويب Network
- تحقق من أن الطلبات لـ Supabase تعمل

### 2. تحقق من البيانات
- تأكد من تحميل المواد
- تحقق من عمل PDFs والفيديوهات
- تأكد من عمل نظام المستخدمين

### 3. تحقق من الأداء
- تأكد من سرعة التحميل
- تحقق من عدم وجود أخطاء في Console

## نصائح للإنتاج

1. **استخدم CDN** لتحسين الأداء
2. **فعّل ضغط Gzip** على الخادم
3. **راقب الأخطاء** باستخدام أدوات المراقبة
4. **احتفظ بنسخ احتياطية** من قاعدة البيانات

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. تحقق من متغيرات البيئة
2. تأكد من صحة مفاتيح Supabase
3. تحقق من سياسات الأمان في Supabase
4. راجع logs في Supabase Dashboard
