# إصلاح مشاكل Google OAuth

## المشاكل التي تم إصلاحها:

### 1. **مشكلة Redirect URL**
- ✅ تم تغيير URL الثابت إلى ديناميكي: `${window.location.origin}/auth/callback`
- ✅ يعمل الآن في البيئة المحلية والإنتاج

### 2. **مشكلة معالجة الجلسة في Callback**
- ✅ تم إضافة انتظار قصير لتحميل الجلسة
- ✅ تم تحسين معالجة الأخطاء
- ✅ تم إضافة try-catch للجلسة

### 3. **مشكلة إنشاء الجلسة**
- ✅ تم إضافة معالجة أخطاء أفضل لـ UserService.createSession
- ✅ تم تحسين رسائل الخطأ

## كيفية اختبار الإصلاح:

### 1. **اختبار تسجيل الدخول بجوجل:**
```bash
# تشغيل الخادم
npm run dev

# اذهب إلى: http://localhost:3000/login
# اضغط "تسجيل الدخول بجوجل"
```

### 2. **اختبار في الإنتاج:**
```bash
# اذهب إلى: https://university-3-cuxd.onrender.com/login
# اضغط "تسجيل الدخول بجوجل"
```

## الملفات المحدثة:

- ✅ `src/lib/UserContext.tsx` - إصلاح redirect URL
- ✅ `src/app/auth/callback/page.tsx` - تحسين معالجة الجلسة
- ✅ `src/app/login/page.tsx` - إضافة دعم Google OAuth

## ملاحظات مهمة:

1. **تأكد من إعداد Google OAuth في Supabase:**
   - اذهب إلى Authentication → Providers
   - فعّل Google provider
   - أضف Client ID و Client Secret

2. **تأكد من إعداد Redirect URLs في Google Console:**
   - `http://localhost:3000/auth/callback` (للبيئة المحلية)
   - `https://university-3-cuxd.onrender.com/auth/callback` (للإنتاج)

3. **تأكد من وجود جدول user_sessions في Supabase:**
   ```sql
   CREATE TABLE user_sessions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     session_token TEXT UNIQUE NOT NULL,
     expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## استكشاف الأخطاء:

إذا لم يعمل تسجيل الدخول بجوجل:

1. **تحقق من Console في المتصفح:**
   - افتح Developer Tools (F12)
   - اذهب إلى Console
   - ابحث عن رسائل الخطأ

2. **تحقق من Network Tab:**
   - اذهب إلى Network
   - اضغط "تسجيل الدخول بجوجل"
   - ابحث عن طلبات فاشلة

3. **تحقق من Supabase Logs:**
   - اذهب إلى Supabase Dashboard
   - اذهب إلى Logs
   - ابحث عن أخطاء Authentication
