# إعداد Supabase الجديد

## الخطوات المطلوبة:

### 1. إنشاء مشروع Supabase جديد
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد أو سجل الدخول
3. اضغط على "New Project"
4. أدخل اسم المشروع: `university-planner`
5. اختر كلمة مرور قوية
6. اختر المنطقة الأقرب لك
7. اضغط على "Create new project"

### 2. الحصول على المفاتيح
1. انتظر حتى يكتمل إنشاء المشروع
2. اذهب إلى Settings > API
3. انسخ Project URL
4. انسخ anon public key

### 3. إعداد قاعدة البيانات
1. اذهب إلى SQL Editor
2. انسخ محتوى `database/schema.sql` وشغله
3. انسخ محتوى `database/policies.sql` وشغله
4. انسخ محتوى `database/simple-seed.sql` وشغله

### 4. إعداد Storage
1. اذهب إلى Storage
2. أنشئ bucket جديد باسم `materials`
3. اجعله public

### 5. تحديث ملف .env.local
استبدل المفاتيح في ملف `.env.local` بالمفاتيح الجديدة:

```env
NEXT_PUBLIC_SUPABASE_URL=your-new-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-new-anon-key
```

### 6. اختبار الاتصال
1. أعد تشغيل الخادم: `npm run dev`
2. افتح المتصفح واذهب إلى `http://localhost:3000`
3. افتح Developer Tools (F12)
4. اذهب إلى Console لرؤية رسائل الاتصال

## ملاحظات مهمة:
- تأكد من أن المشروع نشط في Supabase
- تأكد من أن الجداول تم إنشاؤها بنجاح
- تأكد من أن السياسات (RLS) مفعلة
- تأكد من أن Storage bucket موجود
