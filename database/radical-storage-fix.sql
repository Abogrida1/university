-- الحل الجذري لمشكلة Storage
-- Radical Storage Fix

-- 1. حذف جميع السياسات الموجودة
-- Delete all existing policies
DROP POLICY IF EXISTS "Allow public read access to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from materials bucket" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;
DROP POLICY IF EXISTS "public_read" ON storage.objects;
DROP POLICY IF EXISTS "public_insert" ON storage.objects;
DROP POLICY IF EXISTS "public_update" ON storage.objects;
DROP POLICY IF EXISTS "public_delete" ON storage.objects;

-- 2. حذف Bucket الموجود
-- Delete existing bucket
DELETE FROM storage.buckets WHERE name = 'materials';

-- 3. إنشاء Bucket جديد بالكامل
-- Create new bucket completely
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('materials', 'materials', true, 104857600, ARRAY['application/pdf', 'image/*', 'text/*', 'video/*', 'application/octet-stream']);

-- 4. إنشاء السياسات الجديدة
-- Create new policies
CREATE POLICY "Enable read access for all users" ON storage.objects
FOR SELECT USING (bucket_id = 'materials');

CREATE POLICY "Enable insert for all users" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'materials');

CREATE POLICY "Enable update for all users" ON storage.objects
FOR UPDATE USING (bucket_id = 'materials');

CREATE POLICY "Enable delete for all users" ON storage.objects
FOR DELETE USING (bucket_id = 'materials');

-- 5. التحقق من النتيجة
-- Verify the result
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'materials';

-- 6. اختبار Storage
-- Test Storage
DO $$
BEGIN
  -- محاولة رفع ملف تجريبي
  PERFORM storage.upload('materials', 'test-' || extract(epoch from now()) || '.txt', 'Test content', 'text/plain');
  RAISE NOTICE 'Storage test successful!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Storage test failed: %', SQLERRM;
END $$;
