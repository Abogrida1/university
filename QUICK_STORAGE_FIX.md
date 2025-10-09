# حل مشكلة Bucket Not Found - خطوات سريعة

## المشكلة
```
❌ Error: فشل في رفع الملف: Bucket not found
```

## الحل السريع (5 دقائق)

### الخطوة 1: إنشاء Storage Bucket
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Storage** في القائمة الجانبية
4. اضغط على **"Create a new bucket"**
5. أدخل الاسم: `materials` (بالضبط)
6. اختر **"Public bucket"** ✅
7. اضغط على **"Create bucket"**

### الخطوة 2: تشغيل سياسات Storage
1. اذهب إلى **SQL Editor** في Supabase
2. انسخ والصق محتوى ملف `database/storage-policies.sql`
3. اضغط على **"Run"**

### الخطوة 3: التحقق من الإعداد
1. اذهب إلى **Storage** > **Buckets**
2. تأكد من وجود bucket باسم `materials`
3. تأكد من أنه **Public** ✅
4. اذهب إلى **Storage** > **Policies**
5. تأكد من وجود 4 سياسات للـ bucket `materials`

### الخطوة 4: اختبار التطبيق
1. أعد تشغيل التطبيق: `npm run dev`
2. اذهب إلى `/admin`
3. جرب رفع ملف PDF
4. تحقق من Console للأخطاء

## إذا لم تعمل الخطوات السابقة

### حل بديل: إنشاء bucket يدوياً
1. في Supabase Dashboard > Storage
2. اضغط على **"New bucket"**
3. الاسم: `materials`
4. Public: ✅
5. RLS: ✅ (مفعل)
6. اضغط **"Create bucket"**

### ثم أضف السياسات:
```sql
-- في SQL Editor
CREATE POLICY "Allow public read access to materials bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'materials');

CREATE POLICY "Allow public upload to materials bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Allow public update to materials bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'materials');

CREATE POLICY "Allow public delete from materials bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'materials');
```

## ملاحظات مهمة
- تأكد من أن الاسم `materials` بالضبط (بدون مسافات)
- تأكد من أنه Public
- تأكد من أن السياسات مفعلة
- إذا استمر الخطأ، جرب حذف bucket وإنشاؤه مرة أخرى
