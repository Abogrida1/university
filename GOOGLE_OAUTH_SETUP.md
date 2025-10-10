# إعداد Google OAuth في Supabase

## الخطوات المطلوبة:

### 1. إعداد Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل Google+ API
4. اذهب إلى "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. اختر "Web application"
6. أضف URIs التالية:
   - **Authorized JavaScript origins**: `http://localhost:3000` (للاختبار المحلي)
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/auth/callback` (للاختبار المحلي)
     - `https://your-domain.com/auth/callback` (للإنتاج)

### 2. إعداد Supabase

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى "Authentication" → "Providers"
4. فعّل "Google" provider
5. أدخل:
   - **Client ID**: من Google Cloud Console
   - **Client Secret**: من Google Cloud Console
6. احفظ الإعدادات

### 3. إعداد متغيرات البيئة (اختياري)

يمكنك إضافة متغيرات البيئة في ملف `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## كيفية عمل النظام:

### 1. تسجيل الدخول العادي
- المستخدم يملأ البريد الإلكتروني وكلمة المرور
- يتم التحقق من البيانات في قاعدة البيانات المحلية

### 2. تسجيل الدخول بجوجل
- المستخدم يضغط على "تسجيل الدخول بجوجل"
- يتم توجيهه إلى صفحة جوجل للمصادقة
- بعد المصادقة، يتم توجيهه إلى `/auth/callback`
- يتم إنشاء أو تحديث المستخدم في قاعدة البيانات
- يتم إنشاء جلسة جديدة

### 3. تسجيل الدخول بجوجل مع البيانات الأكاديمية
- في صفحة التسجيل، المستخدم يختار القسم والسنة والترم
- يضغط على "تسجيل الدخول بجوجل"
- يتم حفظ البيانات الأكاديمية مؤقتاً
- بعد المصادقة، يتم ربط البيانات الأكاديمية بالحساب الجديد

## الملفات المحدثة:

- `src/lib/UserContext.tsx`: إضافة دالة `loginWithGoogle`
- `src/app/auth/callback/page.tsx`: معالجة استجابة Google OAuth
- `src/app/login/page.tsx`: تحديث زر تسجيل الدخول بجوجل
- `src/app/auth/register/page.tsx`: تحديث زر تسجيل الدخول بجوجل مع البيانات الأكاديمية

## اختبار النظام:

1. تأكد من أن Supabase يعمل بشكل صحيح
2. تأكد من إعداد Google OAuth في Supabase
3. اختبر تسجيل الدخول العادي
4. اختبر تسجيل الدخول بجوجل
5. اختبر تسجيل الدخول بجوجل مع البيانات الأكاديمية

## ملاحظات مهمة:

- تأكد من أن redirect URI في Google Console يطابق ما هو في الكود
- تأكد من أن Google+ API مفعل في Google Cloud Console
- تأكد من أن البيانات الأكاديمية تُحفظ بشكل صحيح في قاعدة البيانات
