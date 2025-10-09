-- نظام المستخدمين المتقدم لجامعة بلانر
-- Advanced User System for University Planner

-- تحديث جدول المستخدمين لدعم النظام الجديد
DROP TABLE IF EXISTS users CASCADE;

-- جدول المستخدمين الجديد
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('super_admin', 'admin', 'student')),
  department TEXT,
  year INTEGER,
  term TEXT CHECK (term IN ('FIRST', 'SECOND')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الصلاحيات
CREATE TABLE permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول ربط المستخدمين بالصلاحيات
CREATE TABLE user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- جدول جلسات المستخدمين
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل أنشطة المستخدمين
CREATE TABLE user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج الصلاحيات الأساسية
INSERT INTO permissions (name, description) VALUES
('manage_departments', 'إدارة الأقسام'),
('manage_years', 'إدارة السنوات الدراسية'),
('manage_terms', 'إدارة الفصول الدراسية'),
('manage_materials', 'إدارة المواد الدراسية'),
('manage_users', 'إدارة المستخدمين'),
('view_analytics', 'عرض الإحصائيات'),
('manage_system', 'إدارة النظام بالكامل');

-- إنشاء المستخدم الرئيسي (سوبر أدمن)
INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('admin@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'المدير الرئيسي', 'super_admin', true);

-- منح جميع الصلاحيات للمدير الرئيسي
INSERT INTO user_permissions (user_id, permission_id)
SELECT u.id, p.id
FROM users u, permissions p
WHERE u.email = 'admin@university.edu';

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة للتحقق من صلاحيات المستخدم
CREATE OR REPLACE FUNCTION check_user_permission(user_email TEXT, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM users u
        JOIN user_permissions up ON u.id = up.user_id
        JOIN permissions p ON up.permission_id = p.id
        WHERE u.email = user_email 
        AND p.name = permission_name
        AND u.is_active = true
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على معلومات المستخدم مع صلاحياته
CREATE OR REPLACE FUNCTION get_user_with_permissions(user_email TEXT)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    department TEXT,
    year INTEGER,
    term TEXT,
    is_active BOOLEAN,
    permissions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.department,
        u.year,
        u.term,
        u.is_active,
        ARRAY(
            SELECT p.name 
            FROM user_permissions up
            JOIN permissions p ON up.permission_id = p.id
            WHERE up.user_id = u.id
        ) as permissions
    FROM users u
    WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql;

-- دالة لتسجيل نشاط المستخدم
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activities (user_id, activity_type, description, metadata, ip_address, user_agent)
    VALUES (p_user_id, p_activity_type, p_description, p_metadata, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql;
