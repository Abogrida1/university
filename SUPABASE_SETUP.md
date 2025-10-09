# إعداد Supabase

## 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد أو سجل الدخول
3. أنشئ مشروع جديد

## 2. إعداد قاعدة البيانات
قم بإنشاء الجداول التالية في Supabase:

### جدول المواد (materials)
```sql
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  code TEXT NOT NULL,
  department TEXT NOT NULL,
  department_ar TEXT NOT NULL,
  year INTEGER NOT NULL,
  term TEXT NOT NULL,
  term_ar TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول ملفات PDF (pdfs)
```sql
CREATE TABLE pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  material_ar TEXT NOT NULL,
  size TEXT NOT NULL,
  uploads INTEGER DEFAULT 0,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول الفيديوهات (videos)
```sql
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  material TEXT NOT NULL,
  material_ar TEXT NOT NULL,
  duration TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  youtube_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول المستخدمين (users)
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. إعداد Storage
1. اذهب إلى Storage في لوحة التحكم
2. أنشئ bucket جديد باسم "materials"
3. فعّل RLS (Row Level Security)

## 4. إعداد متغيرات البيئة
أنشئ ملف `.env.local` في جذر المشروع:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 5. إعداد السياسات (RLS Policies)
قم بإنشاء السياسات التالية:

### للمواد
```sql
-- Allow all operations for materials
CREATE POLICY "Enable all operations for materials" ON materials
FOR ALL USING (true);
```

### لملفات PDF
```sql
-- Allow all operations for pdfs
CREATE POLICY "Enable all operations for pdfs" ON pdfs
FOR ALL USING (true);
```

### للفيديوهات
```sql
-- Allow all operations for videos
CREATE POLICY "Enable all operations for videos" ON videos
FOR ALL USING (true);
```

### للمستخدمين
```sql
-- Allow all operations for users
CREATE POLICY "Enable all operations for users" ON users
FOR ALL USING (true);
```

## 6. تشغيل التطبيق
```bash
npm run dev
```

## ملاحظات مهمة
- تأكد من أن جميع الجداول تم إنشاؤها بالشكل الصحيح
- تأكد من أن Storage bucket "materials" موجود
- تأكد من أن السياسات (RLS) مفعلة
- تأكد من أن متغيرات البيئة صحيحة
