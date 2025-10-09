-- نظام صلاحيات الأدمن المتقدم
-- Advanced Admin Permissions System

-- حذف الجداول القديمة إن وجدت (بالترتيب العكسي لتجنب مشاكل Foreign Keys)
DROP TRIGGER IF EXISTS admin_scope_audit_trigger ON admin_scopes;
DROP TRIGGER IF EXISTS update_admin_scopes_timestamp ON admin_scopes;
DROP FUNCTION IF EXISTS log_admin_scope_changes();
DROP FUNCTION IF EXISTS update_admin_scope_timestamp();
DROP FUNCTION IF EXISTS check_admin_permission(UUID, TEXT, TEXT, INTEGER, TEXT);
DROP FUNCTION IF EXISTS get_admin_scopes(UUID);
DROP FUNCTION IF EXISTS get_all_admins_with_scopes();
DROP TABLE IF EXISTS admin_scope_audit CASCADE;
DROP TABLE IF EXISTS admin_scopes CASCADE;

-- جدول نطاقات صلاحيات الأدمن (Admin Scopes)
-- يحدد النطاق الذي يمكن للأدمن العمل فيه (قسم، سنة، ترم)
CREATE TABLE admin_scopes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- النطاق الجغرافي/الأكاديمي
  department TEXT,  -- إذا كان NULL، يعني جميع الأقسام
  year INTEGER,     -- إذا كان NULL، يعني جميع السنوات
  term TEXT CHECK (term IN ('FIRST', 'SECOND', NULL)),  -- إذا كان NULL، يعني جميع الترمات
  
  -- الصلاحيات التفصيلية
  can_manage_materials BOOLEAN DEFAULT false,      -- إدارة المواد
  can_manage_pdfs BOOLEAN DEFAULT false,           -- إدارة ملفات PDF
  can_manage_videos BOOLEAN DEFAULT false,         -- إدارة الفيديوهات
  can_manage_schedules BOOLEAN DEFAULT false,      -- إدارة الجداول
  can_manage_messages BOOLEAN DEFAULT false,       -- إدارة الرسائل
  can_view_analytics BOOLEAN DEFAULT false,        -- عرض الإحصائيات
  can_manage_users BOOLEAN DEFAULT false,          -- إدارة المستخدمين في النطاق
  can_manage_admins BOOLEAN DEFAULT false,         -- إدارة الأدمنز (super admin only)
  
  -- معلومات إضافية
  description TEXT,                                 -- وصف الصلاحية
  granted_by UUID REFERENCES users(id),            -- من منح هذه الصلاحية
  is_active BOOLEAN DEFAULT true,                  -- هل الصلاحية نشطة
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- التأكد من عدم تكرار نفس النطاق للمستخدم
  UNIQUE(user_id, department, year, term)
);

-- جدول سجل تغييرات الصلاحيات
CREATE TABLE admin_scope_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scope_id UUID,  -- إزالة REFERENCES لتجنب مشاكل عند الحذف
  affected_user_id UUID REFERENCES users(id),  -- تغيير الاسم من user_id
  action TEXT NOT NULL,  -- 'created', 'updated', 'deleted', 'activated', 'deactivated'
  changes JSONB,         -- التغييرات التي تمت
  performed_by UUID REFERENCES users(id),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس لتحسين الأداء
CREATE INDEX idx_admin_scopes_user_id ON admin_scopes(user_id);
CREATE INDEX idx_admin_scopes_department ON admin_scopes(department);
CREATE INDEX idx_admin_scopes_year ON admin_scopes(year);
CREATE INDEX idx_admin_scopes_term ON admin_scopes(term);
CREATE INDEX idx_admin_scopes_active ON admin_scopes(is_active);
CREATE INDEX idx_admin_scope_audit_scope_id ON admin_scope_audit(scope_id);
CREATE INDEX idx_admin_scope_audit_user_id ON admin_scope_audit(affected_user_id);

-- دالة للتحقق من صلاحية الأدمن
CREATE OR REPLACE FUNCTION check_admin_permission(
  p_user_id UUID,
  p_permission TEXT,  -- اسم الصلاحية مثل 'can_manage_materials'
  p_department TEXT DEFAULT NULL,
  p_year INTEGER DEFAULT NULL,
  p_term TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := FALSE;
  user_role TEXT;
BEGIN
  -- التحقق من دور المستخدم
  SELECT role INTO user_role FROM users WHERE id = p_user_id;
  
  -- السوبر أدمن له صلاحيات كاملة
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- التحقق من الصلاحيات للأدمن العادي
  IF user_role = 'admin' THEN
    -- البحث عن صلاحية تطابق المعايير
    SELECT EXISTS(
      SELECT 1 FROM admin_scopes
      WHERE user_id = p_user_id
        AND is_active = TRUE
        AND (department IS NULL OR department = p_department OR p_department IS NULL)
        AND (year IS NULL OR year = p_year OR p_year IS NULL)
        AND (term IS NULL OR term = p_term OR p_term IS NULL)
        AND CASE p_permission
          WHEN 'can_manage_materials' THEN can_manage_materials
          WHEN 'can_manage_pdfs' THEN can_manage_pdfs
          WHEN 'can_manage_videos' THEN can_manage_videos
          WHEN 'can_manage_schedules' THEN can_manage_schedules
          WHEN 'can_manage_messages' THEN can_manage_messages
          WHEN 'can_view_analytics' THEN can_view_analytics
          WHEN 'can_manage_users' THEN can_manage_users
          WHEN 'can_manage_admins' THEN can_manage_admins
          ELSE FALSE
        END = TRUE
    ) INTO has_permission;
    
    RETURN has_permission;
  END IF;
  
  -- الطلاب ليس لديهم صلاحيات إدارية
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على جميع نطاقات صلاحيات الأدمن
CREATE OR REPLACE FUNCTION get_admin_scopes(p_user_id UUID)
RETURNS TABLE (
  scope_id UUID,
  department TEXT,
  year INTEGER,
  term TEXT,
  can_manage_materials BOOLEAN,
  can_manage_pdfs BOOLEAN,
  can_manage_videos BOOLEAN,
  can_manage_schedules BOOLEAN,
  can_manage_messages BOOLEAN,
  can_view_analytics BOOLEAN,
  can_manage_users BOOLEAN,
  can_manage_admins BOOLEAN,
  description TEXT,
  is_active BOOLEAN,
  granted_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.department,
    s.year,
    s.term,
    s.can_manage_materials,
    s.can_manage_pdfs,
    s.can_manage_videos,
    s.can_manage_schedules,
    s.can_manage_messages,
    s.can_view_analytics,
    s.can_manage_users,
    s.can_manage_admins,
    s.description,
    s.is_active,
    u.name,
    s.created_at
  FROM admin_scopes s
  LEFT JOIN users u ON s.granted_by = u.id
  WHERE s.user_id = p_user_id
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على قائمة جميع الأدمنز مع صلاحياتهم
CREATE OR REPLACE FUNCTION get_all_admins_with_scopes()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  is_active BOOLEAN,
  scopes_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.is_active,
    COUNT(s.id)::INTEGER,
    u.created_at
  FROM users u
  LEFT JOIN admin_scopes s ON u.id = s.user_id AND s.is_active = TRUE
  WHERE u.role IN ('admin', 'super_admin')
  GROUP BY u.id, u.name, u.email, u.role, u.is_active, u.created_at
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتسجيل التغييرات في الصلاحيات
CREATE OR REPLACE FUNCTION log_admin_scope_changes()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  scope_changes JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_user_id := NEW.user_id;
    scope_changes := row_to_json(NEW)::jsonb;
    INSERT INTO admin_scope_audit (scope_id, affected_user_id, action, changes, performed_by)
    VALUES (NEW.id, target_user_id, 'created', scope_changes, NEW.granted_by);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    target_user_id := NEW.user_id;
    scope_changes := jsonb_build_object('old', row_to_json(OLD)::jsonb, 'new', row_to_json(NEW)::jsonb);
    INSERT INTO admin_scope_audit (scope_id, affected_user_id, action, changes, performed_by)
    VALUES (NEW.id, target_user_id, 'updated', scope_changes, NEW.granted_by);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    target_user_id := OLD.user_id;
    scope_changes := row_to_json(OLD)::jsonb;
    INSERT INTO admin_scope_audit (scope_id, affected_user_id, action, changes, performed_by)
    VALUES (OLD.id, target_user_id, 'deleted', scope_changes, NULL);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_scope_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON admin_scopes
FOR EACH ROW EXECUTE FUNCTION log_admin_scope_changes();

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_admin_scope_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_scopes_timestamp
BEFORE UPDATE ON admin_scopes
FOR EACH ROW EXECUTE FUNCTION update_admin_scope_timestamp();

-- إضافة أمثلة للصلاحيات (اختياري - يمكن تشغيلها للتجربة)
-- مثال: أدمن مسؤول عن قسم الأمن السيبراني - السنة الثانية - الترم الأول
-- INSERT INTO admin_scopes (user_id, department, year, term, can_manage_materials, can_manage_pdfs, can_manage_videos, can_manage_schedules, description, granted_by)
-- SELECT 
--   (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
--   'Cyber Security',
--   2,
--   'FIRST',
--   true, true, true, true,
--   'مسؤول قسم الأمن السيبراني - السنة الثانية - الترم الأول',
--   (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1);

COMMENT ON TABLE admin_scopes IS 'جدول نطاقات صلاحيات الأدمن - يحدد القسم والسنة والترم الذي يمكن للأدمن العمل فيه';
COMMENT ON TABLE admin_scope_audit IS 'سجل تغييرات صلاحيات الأدمن';
COMMENT ON FUNCTION check_admin_permission IS 'التحقق من صلاحية الأدمن لعملية معينة في نطاق محدد';
COMMENT ON FUNCTION get_admin_scopes IS 'الحصول على جميع نطاقات صلاحيات أدمن معين';
COMMENT ON FUNCTION get_all_admins_with_scopes IS 'الحصول على قائمة جميع الأدمنز مع عدد صلاحياتهم';
