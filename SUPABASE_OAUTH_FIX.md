# إصلاح مشكلة Google OAuth في Supabase

## المشكلة:
Google OAuth يعمل في localhost لكن في الإنتاج يعود إلى localhost بدلاً من موقع الإنتاج.

## السبب:
إعدادات Supabase تحفظ redirect URL من أول مرة ويتم استخدامه دائماً.

## الحل:

### 1. إعدادات Supabase (الأهم):

#### أ) اذهب إلى Supabase Dashboard:
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **"Authentication"** → **"URL Configuration"**

#### ب) تحديث الإعدادات:
```
Site URL: https://university-3-cuxd.onrender.com
Redirect URLs: 
  - https://university-3-cuxd.onrender.com/auth/callback
  - http://localhost:3000/auth/callback
```

#### ج) حفظ الإعدادات:
- اضغط **"Save"** بعد تحديث كل إعداد
- انتظر بضع دقائق لضمان تطبيق التغييرات

### 2. إعدادات Google Console:

#### أ) اذهب إلى Google Cloud Console:
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. اختر مشروعك
3. اذهب إلى **"APIs & Services"** → **"Credentials"**

#### ب) تحديث OAuth 2.0 Client ID:
```
Authorized JavaScript origins:
  - https://university-3-cuxd.onrender.com
  - http://localhost:3000

Authorized redirect URIs:
  - https://university-3-cuxd.onrender.com/auth/callback
  - http://localhost:3000/auth/callback
```

#### ج) حفظ الإعدادات:
- اضغط **"Save"** بعد تحديث كل إعداد

### 3. إعادة نشر التطبيق:

#### أ) في Render:
1. اذهب إلى [Render Dashboard](https://dashboard.render.com)
2. اختر مشروعك
3. اضغط **"Manual Deploy"**
4. انتظر حتى يكتمل النشر

#### ب) أو عبر Git:
```bash
git push origin main
```

### 4. اختبار الحل:

#### أ) اختبار في الإنتاج:
1. اذهب إلى `https://university-3-cuxd.onrender.com/login`
2. اضغط **"تسجيل الدخول بجوجل"**
3. يجب أن يتم توجيهك إلى Google
4. بعد الموافقة، يجب أن تعود إلى موقع الإنتاج

#### ب) تحقق من Console:
افتح Developer Tools (F12) → Console وابحث عن:
```
🚀 Starting Google OAuth...
📍 Environment: production
📍 Is Production: true
📍 Redirect URL: https://university-3-cuxd.onrender.com/auth/callback
```

## استكشاف الأخطاء:

### إذا لم يعمل:

#### 1. تحقق من Supabase Logs:
- اذهب إلى Supabase Dashboard
- اذهب إلى **"Logs"** → **"Auth"**
- ابحث عن أخطاء OAuth

#### 2. تحقق من Google Console:
- اذهب إلى **"APIs & Services"** → **"OAuth consent screen"**
- تأكد من أن التطبيق في وضع "Production"

#### 3. تحقق من Render Logs:
- اذهب إلى Render Dashboard
- اختر مشروعك
- اذهب إلى **"Logs"**
- ابحث عن أخطاء

## ملاحظات مهمة:

1. **انتظر 5-10 دقائق** بعد تحديث الإعدادات
2. **اختبر في متصفح incognito** لتجنب cache
3. **تأكد من تطابق جميع URLs** في Supabase و Google
4. **لا تنس حفظ الإعدادات** في كلا المنصتين

## إذا استمرت المشكلة:

### أرسل لي:
1. لقطة شاشة من إعدادات Supabase (URL Configuration)
2. لقطة شاشة من إعدادات Google Console (OAuth 2.0 Client ID)
3. رسائل Console من المتصفح
4. رسائل من Supabase Logs

## الملفات المرجعية:

- `OAUTH_DEBUG_GUIDE.md` - دليل التشخيص
- `PRODUCTION_OAUTH_SETUP.md` - دليل الإعداد الكامل
