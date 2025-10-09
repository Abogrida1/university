# إعداد متغيرات البيئة

## إنشاء ملف .env.local

أنشئ ملف `.env.local` في جذر المشروع وأضف المحتوى التالي:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## كيفية الحصول على القيم

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى Settings > API
4. انسخ Project URL وضعه في `NEXT_PUBLIC_SUPABASE_URL`
5. انسخ anon public key وضعه في `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## مثال

```env
NEXT_PUBLIC_SUPABASE_URL=https://cuhztjuphamulkgfhchcp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1aHp0anVwaGFtdWxrZ2ZoaGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODM1MTgsImV4cCI6MjA3NTM1OTUxOH0.SCSNk7jvn13sBkv5458m52z4f1962dbl85eUFFylTaE
```

## ملاحظات مهمة

- تأكد من أن الملف موجود في جذر المشروع (نفس مستوى package.json)
- لا تشارك ملف .env.local مع أي شخص
- أضف .env.local إلى .gitignore
- أعد تشغيل الخادم بعد إنشاء الملف
