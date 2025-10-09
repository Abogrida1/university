-- إضافة حقول التحكم في إظهار الأقسام لجدول المواد
-- Add section visibility control fields to materials table

-- إضافة الحقول الجديدة
ALTER TABLE materials ADD COLUMN IF NOT EXISTS show_materials_section BOOLEAN DEFAULT TRUE;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS show_material_links_section BOOLEAN DEFAULT TRUE;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS show_pdfs_section BOOLEAN DEFAULT TRUE;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS show_videos_section BOOLEAN DEFAULT TRUE;

-- إضافة تعليقات للحقول
COMMENT ON COLUMN materials.show_materials_section IS 'إظهار قسم المواد (Materials)';
COMMENT ON COLUMN materials.show_material_links_section IS 'إظهار قسم روابط المواد (Material Links)';
COMMENT ON COLUMN materials.show_pdfs_section IS 'إظهار قسم الـ PDFs';
COMMENT ON COLUMN materials.show_videos_section IS 'إظهار قسم الفيديوهات';

-- تحديث البيانات الموجودة (اختياري)
-- UPDATE materials SET show_materials_section = TRUE, show_pdfs_section = TRUE, show_videos_section = TRUE;

-- عرض هيكل الجدول المحدث
-- SELECT * FROM materials LIMIT 0;
