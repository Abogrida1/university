# دليل تشخيص مشاكل Google OAuth

## المشكلة الحالية:
Google OAuth يوجه إلى `http://localhost:3000/auth/callback#` بدلاً من موقع الإنتاج.

## خطوات التشخيص:

### 1. تحقق من Console في المتصفح:

افتح Developer Tools (F12) → Console وابحث عن هذه الرسائل:

```
🚀 Starting Google OAuth...
📍 Environment: production
📍 Is Production: true
📍 Redirect URL: https://university-l2nm.vercel.app/auth/callback
```

### 2. إذا كانت القيم خاطئة:

#### أ) إذا كان Environment = "development":
- المشكلة: التطبيق يعمل في وضع التطوير
- الحل: تأكد من أن `NODE_ENV=production` في Render

#### ب) إذا كان Redirect URL = localhost:
- المشكلة: الكود لا يقرأ البيئة بشكل صحيح
- الحل: أعد نشر التطبيق بعد التعديلات

### 3. تحقق من إعدادات Supabase:

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى "Authentication" → "URL Configuration"
4. تأكد من:
   - **Site URL**: `https://university-l2nm.vercel.app`
   - **Redirect URLs**: `https://university-l2nm.vercel.app/auth/callback`

### 4. تحقق من إعدادات Google Console:

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. اختر مشروعك
3. اذهب إلى "APIs & Services" → "Credentials"
4. اختر OAuth 2.0 Client ID
5. تأكد من وجود:
   - `https://university-l2nm.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

## الحلول المقترحة:

### الحل 1: إعادة نشر التطبيق
```bash
# في Render Dashboard:
1. اذهب إلى مشروعك
2. اضغط "Manual Deploy"
3. انتظر حتى يكتمل النشر
```

### الحل 2: إضافة متغير البيئة في Render
```
NODE_ENV=production
```

### الحل 3: التحقق من Supabase Settings
- تأكد من أن Site URL صحيح
- تأكد من أن Redirect URLs صحيح

## اختبار الحل:

1. اذهب إلى موقع الإنتاج
2. افتح Developer Tools → Console
3. اضغط "تسجيل الدخول بجوجل"
4. تحقق من الرسائل في Console
5. يجب أن ترى redirect URL صحيح

## إذا لم يعمل:

### أرسل لي هذه المعلومات:
1. رسائل Console كاملة
2. إعدادات Supabase (Site URL و Redirect URLs)
3. إعدادات Google Console (Authorized redirect URIs)
4. متغيرات البيئة في Render

## ملاحظات مهمة:

1. **انتظر 5-10 دقائق** بعد إعادة النشر
2. **اختبر في متصفح incognito** لتجنب cache
3. **تأكد من أن جميع الإعدادات متطابقة** في Google و Supabase
