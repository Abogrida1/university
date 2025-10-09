-- بيانات تجريبية مبسطة لجامعة بلانر
-- Simplified Sample Data for University Planner

-- إدراج مواد تجريبية أساسية
INSERT INTO materials (title, title_ar, code, department, department_ar, year, term, term_ar, description) VALUES
('Introduction to Programming', 'مقدمة في البرمجة', 'CS101', 'General Program', 'البرنامج العام', 1, 'First Semester', 'الترم الأول', 'مقدمة في أساسيات البرمجة'),
('Data Structures', 'هياكل البيانات', 'CS201', 'General Program', 'البرنامج العام', 2, 'First Semester', 'الترم الأول', 'دراسة هياكل البيانات والخوارزميات'),
('Database Systems', 'أنظمة قواعد البيانات', 'CS301', 'General Program', 'البرنامج العام', 3, 'First Semester', 'الترم الأول', 'مبادئ تصميم وإدارة قواعد البيانات'),
('Computer Networks', 'شبكات الحاسوب', 'CS401', 'General Program', 'البرنامج العام', 4, 'First Semester', 'الترم الأول', 'أساسيات شبكات الحاسوب'),
('Cybersecurity Fundamentals', 'أساسيات الأمن السيبراني', 'CYB101', 'Cyber Security', 'الأمن السيبراني', 1, 'First Semester', 'الترم الأول', 'مقدمة في مفاهيم الأمن السيبراني'),
('Network Security', 'أمن الشبكات', 'CYB201', 'Cyber Security', 'الأمن السيبراني', 2, 'First Semester', 'الترم الأول', 'حماية الشبكات من التهديدات'),
('AI Introduction', 'مقدمة في الذكاء الاصطناعي', 'AI101', 'Artificial Intelligence', 'الذكاء الاصطناعي', 1, 'First Semester', 'الترم الأول', 'مبادئ الذكاء الاصطناعي'),
('Machine Learning', 'التعلم الآلي', 'AI201', 'Artificial Intelligence', 'الذكاء الاصطناعي', 2, 'First Semester', 'الترم الأول', 'خوارزميات التعلم الآلي');

-- إدراج ملفات PDF تجريبية
INSERT INTO pdfs (title, material_id, material, material_ar, size, uploads, file_url, file_name) VALUES
('Programming Basics', (SELECT id FROM materials WHERE code = 'CS101' LIMIT 1), 'Introduction to Programming', 'مقدمة في البرمجة', '2.5 MB', 150, 'https://example.com/programming.pdf', 'programming_basics.pdf'),
('Data Structures Guide', (SELECT id FROM materials WHERE code = 'CS201' LIMIT 1), 'Data Structures', 'هياكل البيانات', '3.1 MB', 120, 'https://example.com/datastructures.pdf', 'data_structures.pdf'),
('Database Design', (SELECT id FROM materials WHERE code = 'CS301' LIMIT 1), 'Database Systems', 'أنظمة قواعد البيانات', '4.2 MB', 95, 'https://example.com/database.pdf', 'database_design.pdf'),
('Network Protocols', (SELECT id FROM materials WHERE code = 'CS401' LIMIT 1), 'Computer Networks', 'شبكات الحاسوب', '2.8 MB', 78, 'https://example.com/networks.pdf', 'networks.pdf'),
('Security Handbook', (SELECT id FROM materials WHERE code = 'CYB101' LIMIT 1), 'Cybersecurity Fundamentals', 'أساسيات الأمن السيبراني', '3.5 MB', 110, 'https://example.com/security.pdf', 'security.pdf'),
('AI Concepts', (SELECT id FROM materials WHERE code = 'AI101' LIMIT 1), 'AI Introduction', 'مقدمة في الذكاء الاصطناعي', '2.9 MB', 85, 'https://example.com/ai.pdf', 'ai_concepts.pdf');

-- إدراج فيديوهات تجريبية
INSERT INTO videos (title, material_id, material, material_ar, duration, views, youtube_id, youtube_url, thumbnail_url) VALUES
('Programming Basics Tutorial', (SELECT id FROM materials WHERE code = 'CS101' LIMIT 1), 'Introduction to Programming', 'مقدمة في البرمجة', '45:30', 1250, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ''),
('Data Structures Explained', (SELECT id FROM materials WHERE code = 'CS201' LIMIT 1), 'Data Structures', 'هياكل البيانات', '52:20', 2100, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ''),
('Database Design Tutorial', (SELECT id FROM materials WHERE code = 'CS301' LIMIT 1), 'Database Systems', 'أنظمة قواعد البيانات', '41:45', 1650, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ''),
('Network Security Basics', (SELECT id FROM materials WHERE code = 'CYB101' LIMIT 1), 'Cybersecurity Fundamentals', 'أساسيات الأمن السيبراني', '35:10', 1890, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ''),
('AI Introduction Video', (SELECT id FROM materials WHERE code = 'AI101' LIMIT 1), 'AI Introduction', 'مقدمة في الذكاء الاصطناعي', '48:30', 2250, 'dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '');

-- إدراج مستخدمين تجريبيين
INSERT INTO users (name, email, role) VALUES
('أحمد محمد', 'ahmed@example.com', 'admin'),
('فاطمة علي', 'fatima@example.com', 'user'),
('محمد حسن', 'mohamed@example.com', 'user'),
('نور الدين', 'nour@example.com', 'user'),
('سارة أحمد', 'sara@example.com', 'user');
