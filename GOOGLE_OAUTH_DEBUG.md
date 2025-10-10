# إصلاح مشاكل Google OAuth

## المشكلة الحالية:
- الخطأ 409 في استعلامات Supabase
- مشاكل في التوجيه إلى callback URL

## الحلول المطبقة:

### 1. إصلاح استعلامات Supabase:
- ✅ استبدال `.single()` بـ `.maybeSingle()` في جميع الاستعلامات
- ✅ إصلاح معالجة الأخطاء في `userService.ts`
- ✅ إصلاح معالجة الأخطاء في `callback/page.tsx`

### 2. تحسين Google OAuth:
- ✅ إضافة `queryParams` لتحسين المصادقة
- ✅ تحسين معالجة الأخطاء في callback
- ✅ إضافة console.log للتشخيص

### 3. صفحة اختبار جديدة:
- ✅ `src/app/test-google-oauth/page.tsx` لاختبار Google OAuth
- ✅ عرض معلومات المستخدم والجلسة
- ✅ أزرار تسجيل الدخول والخروج

## خطوات الاختبار:

### 1. اختبار Google OAuth:
```
1. اذهب إلى /test-google-oauth
2. اضغط "تسجيل الدخول بجوجل"
3. اكمل المصادقة مع جوجل
4. تحقق من البيانات المعروضة
```

### 2. اختبار التسجيل العادي:
```
1. اذهب إلى /auth/register
2. اختر القسم والسنة والترم
3. اضغط "التالي"
4. املأ البيانات الشخصية
5. اضغط "تسجيل الدخول بجوجل"
```

### 3. اختبار تسجيل الدخول:
```
1. اذهب إلى /login
2. اضغط "تسجيل الدخول بجوجل"
3. اكمل المصادقة
4. تحقق من التوجيه للصفحة الرئيسية
```

## إعدادات Supabase المطلوبة:

### 1. Google OAuth Provider:
```
1. اذهب إلى Authentication → Providers
2. فعّل Google
3. أدخل Client ID و Client Secret
4. تأكد من صحة Redirect URL
```

### 2. Redirect URLs:
```
Site URL: https://your-domain.com
Redirect URLs:
- https://your-domain.com/auth/callback
- http://localhost:3000/auth/callback (للاختبار المحلي)
```

### 3. Google Cloud Console:
```
Authorized JavaScript origins:
- https://your-domain.com
- http://localhost:3000

Authorized redirect URIs:
- https://cuhztjuphamulkgfhhcp.supabase.co/auth/v1/callback
```

## الملفات المحدثة:
- ✅ `src/lib/UserContext.tsx`: تحسين Google OAuth
- ✅ `src/app/auth/callback/page.tsx`: إصلاح معالجة callback
- ✅ `src/lib/userService.ts`: إصلاح جميع استعلامات Supabase
- ✅ `src/app/test-google-oauth/page.tsx`: صفحة اختبار جديدة

## ملاحظات مهمة:
- تأكد من تشغيل ملف `database/fix-users-table.sql` في Supabase
- تأكد من صحة إعدادات Google OAuth في Supabase
- تأكد من صحة redirect URLs في Google Console
- استخدم صفحة `/test-google-oauth` للتشخيص
