# حل مشكلة Storage Bucket

## المشكلة
```
❌ Storage upload error: StorageApiError: Bucket not found
```

## الحل السريع

### 1. إنشاء Storage Bucket في Supabase
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Storage** في القائمة الجانبية
4. اضغط على **"Create a new bucket"**
5. أدخل الاسم: `materials`
6. اختر **"Public bucket"** (مهم!)
7. اضغط على **"Create bucket"**

### 2. إعداد سياسات Storage
1. اذهب إلى **Storage** > **Policies**
2. اضغط على **"New Policy"** للـ bucket `materials`
3. اختر **"For full customization"**
4. أضف السياسة التالية:

```sql
-- Allow public read access
CREATE POLICY "Allow public read access to materials bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'materials');

-- Allow public upload
CREATE POLICY "Allow public upload to materials bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'materials');

-- Allow public update
CREATE POLICY "Allow public update to materials bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'materials');

-- Allow public delete
CREATE POLICY "Allow public delete from materials bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'materials');
```

### 3. التحقق من الإعداد
1. تأكد من أن bucket `materials` موجود
2. تأكد من أنه public
3. تأكد من أن السياسات مفعلة

### 4. اختبار التطبيق
1. أعد تشغيل التطبيق: `npm run dev`
2. جرب رفع ملف PDF
3. تحقق من Console للأخطاء

## ملاحظات مهمة
- تأكد من أن bucket اسمه `materials` بالضبط
- تأكد من أنه public
- تأكد من أن السياسات مفعلة
- إذا لم تعمل، جرب حذف bucket وإنشاؤه مرة أخرى
