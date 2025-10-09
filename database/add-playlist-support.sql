-- إضافة دعم YouTube Playlist لجدول الفيديوهات
-- Add YouTube Playlist support to videos table

-- إضافة الحقول الجديدة
ALTER TABLE videos ADD COLUMN IF NOT EXISTS playlist_url TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS playlist_id TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS is_playlist BOOLEAN DEFAULT FALSE;

-- إضافة تعليقات للحقول
COMMENT ON COLUMN videos.playlist_url IS 'رابط YouTube Playlist الكامل';
COMMENT ON COLUMN videos.playlist_id IS 'معرف YouTube Playlist';
COMMENT ON COLUMN videos.is_playlist IS 'هل هذا فيديو عادي أم playlist';

-- عرض هيكل الجدول المحدث
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'videos' 
ORDER BY ordinal_position;
