-- سياسات الأمان (RLS Policies) لجامعة بلانر
-- University Planner RLS Policies

-- تفعيل RLS على جميع الجداول
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسات الجدول materials
-- السماح بجميع العمليات على المواد
CREATE POLICY "Enable all operations for materials" ON materials
FOR ALL USING (true);

-- سياسات الجدول pdfs
-- السماح بجميع العمليات على ملفات PDF
CREATE POLICY "Enable all operations for pdfs" ON pdfs
FOR ALL USING (true);

-- سياسات الجدول videos
-- السماح بجميع العمليات على الفيديوهات
CREATE POLICY "Enable all operations for videos" ON videos
FOR ALL USING (true);

-- سياسات الجدول users
-- السماح بجميع العمليات على المستخدمين
CREATE POLICY "Enable all operations for users" ON users
FOR ALL USING (true);

-- سياسات Storage للـ bucket "materials"
-- السماح بقراءة الملفات
CREATE POLICY "Allow public read access to materials bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'materials');

-- السماح برفع الملفات
CREATE POLICY "Allow public upload to materials bucket" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'materials');

-- السماح بتحديث الملفات
CREATE POLICY "Allow public update to materials bucket" ON storage.objects
FOR UPDATE USING (bucket_id = 'materials');

-- السماح بحذف الملفات
CREATE POLICY "Allow public delete from materials bucket" ON storage.objects
FOR DELETE USING (bucket_id = 'materials');
