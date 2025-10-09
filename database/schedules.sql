-- جدول جداول المحاضرات (PDF Schedules)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  department_ar TEXT NOT NULL,
  year INTEGER NOT NULL,
  term TEXT NOT NULL CHECK (term IN ('FIRST', 'SECOND')),
  term_ar TEXT NOT NULL,
  size TEXT,
  file_url TEXT, -- Base64 Data URL or public URL
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_dept_year_term ON schedules(department, year, term);

