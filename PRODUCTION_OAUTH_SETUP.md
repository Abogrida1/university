# إعداد Google OAuth للإنتاج

## المشكلة:
عند تسجيل الدخول بجوجل في الإنتاج، يتم توجيه المستخدم إلى localhost بدلاً من موقع الاستضافة.

## الحل:

### 1. إعداد متغيرات البيئة في Render:

1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اختر مشروعك
3. اذهب إلى "Environment" tab
4. أضف المتغير التالي:

```
NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://university-l2nm.vercel.app/auth/callback
```

### 2. إعداد Google Console:

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. اختر مشروعك
3. اذهب إلى "APIs & Services" → "Credentials"
4. اختر OAuth 2.0 Client ID
5. في "Authorized redirect URIs" أضف:
   - `https://university-l2nm.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (للاختبار المحلي)

### 3. إعداد Supabase:

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى "Authentication" → "URL Configuration"
4. في "Site URL" أضف: `https://university-l2nm.vercel.app`
5. في "Redirect URLs" أضف: `https://university-l2nm.vercel.app/auth/callback`

### 4. إعادة نشر التطبيق:

```bash
# في Render، اضغط "Manual Deploy" أو
# إذا كنت تستخدم Git، ادفع التعديلات:
git add .
git commit -m "Fix OAuth redirect URL for production"
git push origin main
```

## التحقق من الإعداد:

### 1. تحقق من متغيرات البيئة:
```bash
# في Vercel Dashboard، تأكد من وجود:
NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://university-l2nm.vercel.app/auth/callback
```

### 2. تحقق من Console:
- افتح Developer Tools
- اذهب إلى Console
- اضغط "تسجيل الدخول بجوجل"
- يجب أن ترى: `📍 Redirect URL: https://university-l2nm.vercel.app/auth/callback`

### 3. اختبار التدفق:
1. اذهب إلى موقع الإنتاج
2. اضغط "تسجيل الدخول بجوجل"
3. يجب أن يتم توجيهك إلى Google
4. بعد الموافقة، يجب أن تعود إلى موقع الإنتاج

## استكشاف الأخطاء:

### إذا لم يعمل:

1. **تحقق من Console:**
   - ابحث عن رسائل خطأ
   - تأكد من أن Redirect URL صحيح

2. **تحقق من Network:**
   - اذهب إلى Network tab
   - ابحث عن طلبات OAuth
   - تحقق من الـ redirect URL

3. **تحقق من Supabase Logs:**
   - اذهب إلى Supabase Dashboard
   - اذهب إلى Logs
   - ابحث عن أخطاء Authentication

## الملفات المحدثة:

- ✅ `src/lib/oauthConfig.ts` - إعدادات OAuth منفصلة
- ✅ `src/lib/UserContext.tsx` - استخدام الإعدادات الجديدة
- ✅ `env.example` - مثال على متغيرات البيئة
- ✅ `PRODUCTION_OAUTH_SETUP.md` - دليل الإعداد

## ملاحظات مهمة:

1. **تأكد من إعادة نشر التطبيق** بعد إضافة متغير البيئة
2. **انتظر بضع دقائق** بعد التحديث لضمان تطبيق التغييرات
3. **اختبر في متصفح incognito** لتجنب مشاكل الـ cache
