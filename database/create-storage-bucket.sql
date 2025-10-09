-- إنشاء Storage Bucket مباشرة
-- Create Storage Bucket directly

-- إنشاء Storage Bucket
-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('materials', 'materials', true, 52428800, ARRAY['application/pdf', 'image/*', 'text/*', 'video/*'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/*', 'text/*', 'video/*'];

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

-- التحقق من إنشاء Bucket
-- Verify bucket creation
SELECT * FROM storage.buckets WHERE name = 'materials';
