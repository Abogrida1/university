-- جدول الإشعارات
-- Notifications Table

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'update', 'announcement')),
  is_read BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON notifications;
CREATE TRIGGER update_notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- دالة لجلب الإشعارات غير المقروءة لمستخدم
CREATE OR REPLACE FUNCTION get_unread_notifications(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.message,
    n.type,
    n.created_at,
    u.name as created_by_name
  FROM notifications n
  LEFT JOIN users u ON n.created_by = u.id
  WHERE n.user_id = p_user_id
    AND n.is_read = false
    AND (n.scheduled_for IS NULL OR n.scheduled_for <= NOW())
    AND (n.sent_at IS NOT NULL OR n.scheduled_for IS NULL)
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديد الإشعار كمقروء
CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = true,
      updated_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديد جميع إشعارات المستخدم كمقروءة
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- دالة لإرسال الإشعارات المبرمجة (يجب استدعاؤها بشكل دوري)
CREATE OR REPLACE FUNCTION send_scheduled_notifications()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET sent_at = NOW(),
      updated_at = NOW()
  WHERE scheduled_for IS NOT NULL
    AND scheduled_for <= NOW()
    AND sent_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- سياسات الأمان (RLS Policies)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- يمكن للمستخدمين قراءة إشعاراتهم فقط
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id::text OR 
         EXISTS (
           SELECT 1 FROM users 
           WHERE id::text = auth.uid()::text 
           AND role = 'super_admin'
         ));

-- يمكن للمستخدمين تحديث إشعاراتهم فقط (لتحديدها كمقروءة)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- فقط super_admin يمكنه إنشاء الإشعارات
CREATE POLICY "Only super_admin can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'super_admin'
    )
  );

-- فقط super_admin يمكنه حذف الإشعارات
CREATE POLICY "Only super_admin can delete notifications"
  ON notifications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND role = 'super_admin'
    )
  );
