-- إضافة عمود scheduled_at لجدول user_notifications
-- Add scheduled_at column to user_notifications table

ALTER TABLE user_notifications 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_user_notifications_scheduled_at ON user_notifications(scheduled_at);

-- تعليق
COMMENT ON COLUMN user_notifications.scheduled_at IS 'تاريخ الإرسال المجدول (اختياري)';

