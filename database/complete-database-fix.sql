-- قاعدة البيانات المحدثة بدون Storage
-- Updated Database without Storage

-- حذف الجداول الموجودة
DROP TABLE IF EXISTS pdfs CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- إنشاء جدول المواد
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  department_ar VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  term VARCHAR(50) NOT NULL,
  term_ar VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول PDFs (بدون Storage)
CREATE TABLE pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  material VARCHAR(255) NOT NULL,
  material_ar VARCHAR(255) NOT NULL,
  size VARCHAR(50),
  uploads INTEGER DEFAULT 0,
  file_url TEXT, -- Base64 URL
  file_name VARCHAR(255),
  file_data TEXT, -- Base64 encoded file data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الفيديوهات
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  material VARCHAR(255) NOT NULL,
  material_ar VARCHAR(255) NOT NULL,
  duration VARCHAR(20),
  views INTEGER DEFAULT 0,
  youtube_id VARCHAR(50),
  youtube_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستخدمين
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Enable all operations for all users" ON materials FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON pdfs FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON videos FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON users FOR ALL USING (true);

-- إدراج بيانات تجريبية
INSERT INTO materials (title, title_ar, code, department, department_ar, year, term, term_ar, description) VALUES
('Mathematics I', 'الرياضيات 1', 'MATH101', 'General Program', 'البرنامج العام', 1, 'First Semester', 'الفصل الأول', 'Basic mathematics course'),
('Physics I', 'الفيزياء 1', 'PHYS101', 'General Program', 'البرنامج العام', 1, 'First Semester', 'الفصل الأول', 'Basic physics course'),
('Programming Fundamentals', 'أساسيات البرمجة', 'CS101', 'Cyber Security', 'الأمن السيبراني', 1, 'First Semester', 'الفصل الأول', 'Introduction to programming'),
('Data Structures', 'هياكل البيانات', 'CS201', 'Cyber Security', 'الأمن السيبراني', 2, 'First Semester', 'الفصل الأول', 'Data structures and algorithms'),
('Machine Learning', 'تعلم الآلة', 'AI301', 'Artificial Intelligence', 'الذكاء الاصطناعي', 3, 'First Semester', 'الفصل الأول', 'Introduction to machine learning'),
('Neural Networks', 'الشبكات العصبية', 'AI302', 'Artificial Intelligence', 'الذكاء الاصطناعي', 3, 'Second Semester', 'الفصل الثاني', 'Deep learning concepts');

-- إدراج PDFs تجريبية
INSERT INTO pdfs (title, material_id, material, material_ar, size, uploads, file_url, file_name) VALUES
('Mathematics Textbook', (SELECT id FROM materials WHERE code = 'MATH101'), 'Mathematics I', 'الرياضيات 1', '2.5 MB', 150, 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgovVHlwZSAvUGFnZQo+PgpzdHJlYW0K', 'math_textbook.pdf'),
('Physics Lab Manual', (SELECT id FROM materials WHERE code = 'PHYS101'), 'Physics I', 'الفيزياء 1', '1.8 MB', 89, 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgovVHlwZSAvUGFnZQo+PgpzdHJlYW0K', 'physics_lab.pdf'),
('Programming Exercises', (SELECT id FROM materials WHERE code = 'CS101'), 'Programming Fundamentals', 'أساسيات البرمجة', '3.2 MB', 203, 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgovVHlwZSAvUGFnZQo+PgpzdHJlYW0K', 'programming_exercises.pdf');

-- إدراج فيديوهات تجريبية
INSERT INTO videos (title, material_id, material, material_ar, duration, views, youtube_id, youtube_url) VALUES
('Mathematics Introduction', (SELECT id FROM materials WHERE code = 'MATH101'), 'Mathematics I', 'الرياضيات 1', '45:30', 1250, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Physics Concepts', (SELECT id FROM materials WHERE code = 'PHYS101'), 'Physics I', 'الفيزياء 1', '38:15', 890, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('Programming Basics', (SELECT id FROM materials WHERE code = 'CS101'), 'Programming Fundamentals', 'أساسيات البرمجة', '52:45', 2100, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

-- إدراج مستخدمين تجريبيين
INSERT INTO users (name, email, role) VALUES
('أحمد محمد', 'ahmed@example.com', 'admin'),
('فاطمة علي', 'fatima@example.com', 'user'),
('محمد حسن', 'mohamed@example.com', 'user');
