# 🚨 حل فوري لمشكلة Storage

## المشكلة
```
📋 Available buckets: Array(0)
❌ Materials bucket not found!
```

**هذا يعني أن Storage bucket "materials" غير موجود في Supabase!**

## الحل الفوري (3 دقائق)

### الخطوة 1: إنشاء Storage Bucket
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Storage** في القائمة الجانبية
4. اضغط على **"Create a new bucket"** أو **"New bucket"**
5. أدخل الاسم: `materials` (بالضبط)
6. اختر **"Public bucket"** ✅
7. اضغط على **"Create bucket"**

### الخطوة 2: تشغيل سياسات Storage
1. اذهب إلى **SQL Editor** في Supabase
2. انسخ والصق هذا الكود:

```sql
-- حذف السياسات الموجودة أولاً
DROP POLICY IF EXISTS "Allow public read access to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from materials bucket" ON storage.objects;

-- إنشاء السياسات الجديدة
CREATE POLICY "Allow public read access to materials bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'materials');

CREATE POLICY "Allow public upload to materials bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Allow public update to materials bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'materials');

CREATE POLICY "Allow public delete from materials bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'materials');
```

3. اضغط على **"Run"**

### الخطوة 3: التحقق من الإعداد
1. اذهب إلى **Storage** > **Buckets**
2. يجب أن ترى bucket باسم `materials`
3. تأكد من أنه **Public** ✅
4. اذهب إلى **Storage** > **Policies**
5. يجب أن ترى 4 سياسات للـ bucket `materials`

### الخطوة 4: اختبار التطبيق
1. أعد تشغيل التطبيق: `npm run dev`
2. اذهب إلى `/admin`
3. جرب رفع ملف PDF
4. يجب أن يعمل الآن! ✅

## إذا لم تعمل الخطوات السابقة

### حل بديل: إنشاء bucket من SQL
1. في SQL Editor، شغل هذا الكود:

```sql
-- إنشاء Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('materials', 'materials', true, 52428800, ARRAY['application/pdf', 'image/*', 'text/*']);
```

2. ثم شغل سياسات Storage من الخطوة 2

## ملاحظات مهمة
- تأكد من أن الاسم `materials` بالضبط (بدون مسافات)
- تأكد من أنه Public
- تأكد من أن السياسات مفعلة
- إذا استمر الخطأ، جرب حذف bucket وإنشاؤه مرة أخرى
