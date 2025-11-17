-- جدول إشعارات المستخدمين
-- User Notifications Table

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'update' CHECK (type IN ('update', 'announcement', 'warning', 'info')),
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- null يعني لجميع المستخدمين
  is_read BOOLEAN DEFAULT FALSE,
  created_by UUID, -- ID للـ super admin الذي أرسل الرسالة
  scheduled_at TIMESTAMP WITH TIME ZONE, -- اختياري: تاريخ الإرسال المجدول
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE -- اختياري: تاريخ انتهاء الإشعار
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);

-- إضافة تعليق على الجدول
COMMENT ON TABLE user_notifications IS 'جدول إشعارات المستخدمين والتحديثات';
COMMENT ON COLUMN user_notifications.target_user_id IS 'المستخدم المستهدف (null = لجميع المستخدمين)';
COMMENT ON COLUMN user_notifications.type IS 'نوع الإشعار: update, announcement, warning, info';
COMMENT ON COLUMN user_notifications.is_read IS 'هل تم قراءة الإشعار';

