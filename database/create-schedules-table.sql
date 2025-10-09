-- إنشاء جدول جداول المحاضرات
-- Create schedules table

-- حذف الجدول إذا كان موجود
DROP TABLE IF EXISTS schedules CASCADE;

-- إنشاء الجدول
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  department_ar TEXT NOT NULL,
  year INTEGER NOT NULL,
  term TEXT NOT NULL CHECK (term IN ('FIRST', 'SECOND')),
  term_ar TEXT NOT NULL,
  size TEXT,
  file_url TEXT, -- Base64 Data URL
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_schedules_dept_year_term ON schedules(department, year, term);

-- إضافة constraint للتأكد من عدم وجود جدول مكرر لنفس القسم والسنة والترم
ALTER TABLE schedules ADD CONSTRAINT unique_schedule_per_cohort 
UNIQUE (department, year, term);

-- إدراج بيانات تجريبية
INSERT INTO schedules (title, department, department_ar, year, term, term_ar, size, file_url, file_name) VALUES
-- الترم الأول
('جدول المحاضرات - البرنامج العام - السنة الأولى - الترم الأول', 'General Program', 'البرنامج العام', 1, 'FIRST', 'الترم الأول', '2.5 MB', 'data:application/pdf;base64,test', 'schedule_general_year1_term1.pdf'),
('جدول المحاضرات - الأمن السيبراني - السنة الأولى - الترم الأول', 'Cyber Security', 'الأمن السيبراني', 1, 'FIRST', 'الترم الأول', '3.1 MB', 'data:application/pdf;base64,test', 'schedule_cyber_year1_term1.pdf'),
('جدول المحاضرات - الذكاء الاصطناعي - السنة الأولى - الترم الأول', 'Artificial Intelligence', 'الذكاء الاصطناعي', 1, 'FIRST', 'الترم الأول', '2.8 MB', 'data:application/pdf;base64,test', 'schedule_ai_year1_term1.pdf'),
-- الترم الثاني
('جدول المحاضرات - البرنامج العام - السنة الأولى - الترم الثاني', 'General Program', 'البرنامج العام', 1, 'SECOND', 'الترم الثاني', '2.3 MB', 'data:application/pdf;base64,test', 'schedule_general_year1_term2.pdf'),
('جدول المحاضرات - الأمن السيبراني - السنة الأولى - الترم الثاني', 'Cyber Security', 'الأمن السيبراني', 1, 'SECOND', 'الترم الثاني', '3.0 MB', 'data:application/pdf;base64,test', 'schedule_cyber_year1_term2.pdf'),
('جدول المحاضرات - الذكاء الاصطناعي - السنة الأولى - الترم الثاني', 'Artificial Intelligence', 'الذكاء الاصطناعي', 1, 'SECOND', 'الترم الثاني', '2.6 MB', 'data:application/pdf;base64,test', 'schedule_ai_year1_term2.pdf');

-- عرض البيانات
SELECT * FROM schedules;
