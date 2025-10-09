-- إنشاء حساب Super Admin الرئيسي
-- Create Main Super Admin Account

-- حذف الحساب القديم إن وجد
DELETE FROM users WHERE email = 'admin@university.edu';

-- إنشاء الحساب الجديد
INSERT INTO users (email, password_hash, name, role, is_active) 
VALUES (
  'admin@university.edu',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- password: password
  'المدير الرئيسي',
  'super_admin',
  true
);

-- التحقق من الحساب
SELECT 
  id,
  email,
  name,
  role,
  is_active,
  created_at
FROM users 
WHERE email = 'admin@university.edu';

