-- جدول الرسائل والطلبات
-- Messages and Requests Table

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('contact', 'join')),
  first_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT,
  department VARCHAR(100),
  year VARCHAR(10),
  term VARCHAR(20),
  whatsapp VARCHAR(20),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- إضافة تعليق على الجدول
COMMENT ON TABLE messages IS 'جدول الرسائل وطلبات الانضمام';
COMMENT ON COLUMN messages.type IS 'نوع الرسالة: contact أو join';
COMMENT ON COLUMN messages.status IS 'حالة الرسالة: new, read, replied, closed';
