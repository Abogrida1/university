-- إصلاح جدول المستخدمين لدعم Google OAuth
-- Fix users table to support Google OAuth

-- إضافة عمود password_hash إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- إضافة عمود department إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;

-- إضافة عمود year إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS year INTEGER;

-- إضافة عمود term إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS term TEXT CHECK (term IN ('FIRST', 'SECOND'));

-- إضافة عمود is_active إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- إضافة عمود last_login إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- إضافة عمود role إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('super_admin', 'admin', 'student'));

-- إضافة عمود name إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;

-- إضافة عمود updated_at إذا لم يكن موجوداً
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- تحديث القيود
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- إنشاء trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- إنشاء جدول الجلسات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لجدول الجلسات
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- إنشاء جدول أنشطة المستخدمين إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لجدول الأنشطة
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);

-- دالة لإنشاء جلسة جديدة
CREATE OR REPLACE FUNCTION create_user_session(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    session_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    new_session_token TEXT;
    new_expires_at TIMESTAMP WITH TIME ZONE;
    new_session_id UUID;
BEGIN
    -- إنشاء token عشوائي
    new_session_token := encode(gen_random_bytes(32), 'hex');
    
    -- تحديد تاريخ انتهاء الصلاحية (30 يوم)
    new_expires_at := NOW() + INTERVAL '30 days';
    
    -- إدراج الجلسة الجديدة
    INSERT INTO user_sessions (user_id, session_token, expires_at)
    VALUES (p_user_id, new_session_token, new_expires_at)
    RETURNING id INTO new_session_id;
    
    -- إرجاع بيانات الجلسة
    RETURN QUERY
    SELECT new_session_id, new_session_token, new_expires_at;
END;
$$ LANGUAGE plpgsql;

-- دالة للتحقق من صحة الجلسة
CREATE OR REPLACE FUNCTION validate_session(p_session_token TEXT)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    department TEXT,
    year INTEGER,
    term TEXT,
    is_active BOOLEAN
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
        u.is_active
    FROM users u
    JOIN user_sessions s ON u.id = s.user_id
    WHERE s.session_token = p_session_token
    AND s.expires_at > NOW()
    AND u.is_active = true;
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
