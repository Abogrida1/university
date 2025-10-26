-- إعدادات Google OAuth في Supabase
-- Supabase Google OAuth Setup

-- تأكد من أن إعدادات OAuth صحيحة
-- هذا الملف للرجوع إليه فقط - الإعدادات تتم من خلال Dashboard

/*
خطوات الإعداد في Supabase Dashboard:

1. اذهب إلى Authentication → URL Configuration
2. اضبط الإعدادات التالية:

Site URL: https://university-l2nm.vercel.app

Redirect URLs:
- https://university-l2nm.vercel.app/auth/callback
- http://localhost:3000/auth/callback

3. اذهب إلى Authentication → Providers
4. فعّل Google provider
5. أضف Client ID و Client Secret من Google Console

خطوات الإعداد في Google Console:

1. اذهب إلى Google Cloud Console
2. اختر مشروعك
3. اذهب إلى APIs & Services → Credentials
4. اختر OAuth 2.0 Client ID
5. اضبط الإعدادات التالية:

Authorized JavaScript origins:
- https://university-l2nm.vercel.app
- http://localhost:3000

Authorized redirect URIs:
- https://university-l2nm.vercel.app/auth/callback
- http://localhost:3000/auth/callback

ملاحظات مهمة:
- تأكد من حفظ الإعدادات في كلا المنصتين
- انتظر 5-10 دقائق بعد التحديث
- اختبر في متصفح incognito
- تأكد من تطابق جميع URLs
*/

-- التحقق من إعدادات المستخدمين
SELECT 
  email,
  created_at,
  last_sign_in_at,
  provider
FROM auth.users 
WHERE provider = 'google'
ORDER BY created_at DESC
LIMIT 10;

-- التحقق من الجلسات النشطة
SELECT 
  user_id,
  created_at,
  expires_at,
  last_activity
FROM auth.sessions
WHERE expires_at > NOW()
ORDER BY created_at DESC
LIMIT 10;
