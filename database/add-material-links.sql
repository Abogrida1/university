-- إضافة حقول الروابط لجدول المواد
-- Add link fields to materials table

-- إضافة الحقول الجديدة
ALTER TABLE materials ADD COLUMN IF NOT EXISTS book_link TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS lectures_link TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS google_drive_link TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS additional_links TEXT; -- JSON format for multiple links
ALTER TABLE materials ADD COLUMN IF NOT EXISTS show_google_drive_only BOOLEAN DEFAULT FALSE; -- للتحكم في إظهار Google Drive فقط

-- إضافة تعليقات للحقول
COMMENT ON COLUMN materials.book_link IS 'رابط كتاب المادة';
COMMENT ON COLUMN materials.lectures_link IS 'رابط محاضرات المادة';
COMMENT ON COLUMN materials.google_drive_link IS 'رابط Google Drive للمادة';
COMMENT ON COLUMN materials.additional_links IS 'روابط إضافية بصيغة JSON';
COMMENT ON COLUMN materials.show_google_drive_only IS 'إظهار Google Drive فقط وإخفاء PDFs والفيديوهات';

-- تحديث البيانات الموجودة (اختياري)
-- UPDATE materials SET book_link = NULL, lectures_link = NULL, google_drive_link = NULL, additional_links = NULL;

-- عرض هيكل الجدول المحدث
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'materials' 
ORDER BY ordinal_position;
