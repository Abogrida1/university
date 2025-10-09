-- إنشاء Storage Bucket والسياسات
-- Create Storage Bucket and Policies

-- إنشاء Storage Bucket (يتم إنشاؤه من لوحة التحكم)
-- Create Storage Bucket (created from dashboard)
-- 1. اذهب إلى Storage في Supabase Dashboard
-- 2. اضغط على "Create a new bucket"
-- 3. أدخل الاسم: materials
-- 4. اختر "Public bucket"

-- سياسات Storage للـ bucket "materials"
-- Storage policies for "materials" bucket

-- حذف السياسات الموجودة أولاً (إذا كانت موجودة)
-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Allow public read access to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from materials bucket" ON storage.objects;

-- السماح بقراءة الملفات للجميع
-- Allow public read access
CREATE POLICY "Allow public read access to materials bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'materials');

-- السماح برفع الملفات للجميع
-- Allow public upload
CREATE POLICY "Allow public upload to materials bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'materials');

-- السماح بتحديث الملفات للجميع
-- Allow public update
CREATE POLICY "Allow public update to materials bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'materials');

-- السماح بحذف الملفات للجميع
-- Allow public delete
CREATE POLICY "Allow public delete from materials bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'materials');

-- ملاحظة: تأكد من أن bucket "materials" موجود ومفعل
-- Note: Make sure the "materials" bucket exists and is enabled
