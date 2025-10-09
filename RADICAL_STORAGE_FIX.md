# 🔥 الحل الجذري لمشكلة Storage

## المشكلة الجذرية
Storage bucket "materials" غير موجود أو غير مُعد بشكل صحيح في Supabase.

## الحل الجذري (خطوة بخطوة)

### الخطوة 1: حذف وإعادة إنشاء Storage بالكامل

#### 1.1 حذف Storage الموجود
```sql
-- في SQL Editor في Supabase
-- حذف جميع السياسات
DROP POLICY IF EXISTS "Allow public read access to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from materials bucket" ON storage.objects;

-- حذف Bucket إذا كان موجود
DELETE FROM storage.buckets WHERE name = 'materials';
```

#### 1.2 إنشاء Storage جديد بالكامل
```sql
-- إنشاء Bucket جديد
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('materials', 'materials', true, 104857600, ARRAY['application/pdf', 'image/*', 'text/*', 'video/*']);

-- إنشاء السياسات
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'materials');

CREATE POLICY "Enable insert for all users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Enable update for all users" ON storage.objects
FOR UPDATE USING (bucket_id = 'materials');

CREATE POLICY "Enable delete for all users" ON storage.objects
FOR DELETE USING (bucket_id = 'materials');
```

### الخطوة 2: التحقق من الإعداد
```sql
-- التحقق من Bucket
SELECT * FROM storage.buckets WHERE name = 'materials';

-- التحقق من السياسات
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### الخطوة 3: اختبار Storage
```sql
-- اختبار رفع ملف
SELECT storage.upload('materials', 'test.txt', 'Hello World', 'text/plain');
```

## إذا لم يعمل الحل السابق

### الحل البديل: استخدام Storage مباشرة من لوحة التحكم

1. **اذهب إلى Supabase Dashboard**
2. **Storage** > **Buckets**
3. **Delete** أي buckets موجودة
4. **Create a new bucket**:
   - Name: `materials`
   - Public: ✅
   - File size limit: 100MB
   - Allowed MIME types: `application/pdf, image/*, text/*, video/*`
5. **Create bucket**

### ثم شغل هذا الكود:
```sql
-- سياسات Storage مبسطة
CREATE POLICY "public_read" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "public_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials');
CREATE POLICY "public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'materials');
CREATE POLICY "public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'materials');
```

## الحل النهائي: إعادة تعيين Storage بالكامل

إذا لم تعمل الحلول السابقة:

1. **اذهب إلى Supabase Dashboard**
2. **Settings** > **API**
3. **Reset Storage** (إذا كان متاحاً)
4. **أو أنشئ مشروع Supabase جديد**
5. **انسخ البيانات من المشروع القديم**

## ملاحظات مهمة
- تأكد من أن المشروع نشط
- تأكد من أن Storage مفعل
- تأكد من أن السياسات صحيحة
- إذا استمر الخطأ، المشكلة في إعدادات Supabase نفسها
