# البدء السريع - جامعة بلانر

## 🚀 خطوات سريعة للبدء

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد Supabase (5 دقائق)

#### أ) إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. انتظر حتى يكتمل الإعداد

#### ب) إعداد قاعدة البيانات
1. اذهب إلى SQL Editor في Supabase
2. انسخ محتوى `database/schema.sql` وشغله
3. انسخ محتوى `database/policies.sql` وشغله
4. (اختياري) انسخ محتوى `database/seed.sql` للبيانات التجريبية

#### ج) إعداد Storage
1. اذهب إلى Storage في Supabase
2. أنشئ bucket جديد باسم `materials`
3. اجعله public

### 3. إعداد متغيرات البيئة
أنشئ ملف `.env.local` في جذر المشروع:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

احصل على هذه القيم من Supabase Dashboard > Settings > API

### 4. تشغيل التطبيق
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## ✅ اختبار سريع

1. **الصفحة الرئيسية**: اختر برنامج وسنة وترم
2. **صفحة الإدارة**: اذهب إلى `/admin` وجرب إضافة مادة
3. **صفحة المادة**: اضغط على أي مادة لرؤية التفاصيل

## 🔧 استكشاف الأخطاء

### خطأ "Invalid API key"
- تأكد من صحة المفاتيح في `.env.local`
- تأكد من وجود الملف في جذر المشروع

### خطأ "Table doesn't exist"
- تأكد من تشغيل ملفات SQL في Supabase
- تحقق من أسماء الجداول

### خطأ "Permission denied"
- تأكد من تشغيل ملف `policies.sql`
- تحقق من إعدادات RLS

## 📚 المزيد من المعلومات

- `SUPABASE_COMPLETE_SETUP.md` - دليل الإعداد المفصل
- `ENV_SETUP.md` - دليل إعداد متغيرات البيئة
- `README.md` - دليل المشروع الكامل

## 🆘 المساعدة

إذا واجهت مشاكل:
1. راجع ملفات التوثيق
2. تحقق من إعداد Supabase
3. تأكد من صحة متغيرات البيئة
4. أعد تشغيل الخادم بعد أي تغيير
