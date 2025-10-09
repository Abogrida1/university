-- قاعدة البيانات الكاملة لجامعة بلانر
-- Complete Database Schema for University Planner

-- حذف الجداول الموجودة
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS pdfs CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- جدول المستخدمين
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المواد
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  code TEXT NOT NULL,
  department TEXT NOT NULL,
  department_ar TEXT NOT NULL,
  year INTEGER NOT NULL,
  term TEXT NOT NULL,
  term_ar TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول جداول المحاضرات (PDF Schedules)
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  department_ar TEXT NOT NULL,
  year INTEGER NOT NULL,
  term TEXT NOT NULL CHECK (term IN ('FIRST', 'SECOND')),
  term_ar TEXT NOT NULL,
  size TEXT,
  file_url TEXT, -- Base64 Data URL or public URL
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول ملفات PDF
CREATE TABLE pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  material_ar TEXT NOT NULL,
  size TEXT,
  uploads INTEGER DEFAULT 0,
  file_url TEXT, -- Base64 URL
  file_name TEXT,
  file_data TEXT, -- Base64 encoded file data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الفيديوهات
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  material_ar TEXT NOT NULL,
  duration TEXT,
  views INTEGER DEFAULT 0,
  youtube_id TEXT,
  youtube_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الرسائل والطلبات
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'contact' or 'join'
  first_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject TEXT, -- For contact messages
  message TEXT, -- For contact messages
  department VARCHAR(100), -- For join requests
  year INTEGER, -- For join requests
  term VARCHAR(50), -- For join requests
  whatsapp VARCHAR(50), -- For join requests
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_materials_department ON materials(department);
CREATE INDEX IF NOT EXISTS idx_materials_year ON materials(year);
CREATE INDEX IF NOT EXISTS idx_schedules_dept_year_term ON schedules(department, year, term);
CREATE INDEX IF NOT EXISTS idx_pdfs_material_id ON pdfs(material_id);
CREATE INDEX IF NOT EXISTS idx_videos_material_id ON videos(material_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- إدراج بيانات تجريبية
INSERT INTO materials (title, title_ar, code, department, department_ar, year, term, term_ar, description) VALUES
('Introduction to Programming', 'مقدمة في البرمجة', 'CS101', 'General Program', 'البرنامج العام', 1, 'First Semester', 'الترم الأول', 'مقدمة في أساسيات البرمجة'),
('Data Structures', 'هياكل البيانات', 'CS201', 'General Program', 'البرنامج العام', 2, 'First Semester', 'الترم الأول', 'دراسة هياكل البيانات والخوارزميات'),
('Cybersecurity Fundamentals', 'أساسيات الأمن السيبراني', 'CYB101', 'Cyber Security', 'الأمن السيبراني', 1, 'First Semester', 'الترم الأول', 'مقدمة في مفاهيم الأمن السيبراني'),
('AI Introduction', 'مقدمة في الذكاء الاصطناعي', 'AI101', 'Artificial Intelligence', 'الذكاء الاصطناعي', 1, 'First Semester', 'الترم الأول', 'مبادئ الذكاء الاصطناعي');

-- إدراج جدول محاضرات تجريبي
INSERT INTO schedules (title, department, department_ar, year, term, term_ar, size, file_url, file_name) VALUES
('جدول المحاضرات - البرنامج العام - السنة الأولى', 'General Program', 'البرنامج العام', 1, 'FIRST', 'الترم الأول', '2.5 MB', 'https://example.com/schedule1.pdf', 'schedule_general_year1.pdf'),
('جدول المحاضرات - الأمن السيبراني - السنة الأولى', 'Cyber Security', 'الأمن السيبراني', 1, 'FIRST', 'الترم الأول', '3.1 MB', 'https://example.com/schedule2.pdf', 'schedule_cyber_year1.pdf'),
('جدول المحاضرات - الذكاء الاصطناعي - السنة الأولى', 'Artificial Intelligence', 'الذكاء الاصطناعي', 1, 'FIRST', 'الترم الأول', '2.8 MB', 'https://example.com/schedule3.pdf', 'schedule_ai_year1.pdf');
