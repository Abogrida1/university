# إصلاح سريع لمشاكل Google OAuth

## المشكلة:
```
Failed to load resource: the server responded with a status of 406 ()
Failed to load resource: the server responded with a status of 400 ()
خطأ في إنشاء المستخدم
```

## الحل:

### 1. تشغيل ملف SQL في Supabase:
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى "SQL Editor"
4. انسخ محتوى ملف `database/fix-users-table.sql`
5. اضغط "Run" لتنفيذ الكود

### 2. التحقق من إعدادات Google OAuth:
1. اذهب إلى "Authentication" → "Providers"
2. تأكد من تفعيل Google provider
3. تأكد من صحة Client ID و Client Secret

### 3. اختبار النظام:
1. اذهب إلى `/login`
2. اضغط "تسجيل الدخول بجوجل"
3. يجب أن يعمل بشكل صحيح الآن

## الملفات المحدثة:
- ✅ `src/app/auth/callback/page.tsx`: إصلاح معالجة Google OAuth
- ✅ `database/fix-users-table.sql`: إصلاح بنية قاعدة البيانات
- ✅ `src/lib/UserContext.tsx`: إضافة دعم Google OAuth

## ملاحظات:
- تأكد من أن جدول `users` يحتوي على جميع الحقول المطلوبة
- تأكد من أن Google OAuth مُعد بشكل صحيح في Supabase
- تأكد من أن redirect URI صحيح في Google Console
