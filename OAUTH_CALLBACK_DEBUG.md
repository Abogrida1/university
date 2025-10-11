# تشخيص مشاكل Google OAuth Callback

## المشكلة:
Google OAuth يعمل لكن لا يتم تسجيل الحساب أو إنشاء الجلسة.

## خطوات التشخيص:

### 1. افتح Developer Tools (F12) → Console

### 2. اذهب إلى موقع الإنتاج واضغط "تسجيل الدخول بجوجل"

### 3. ابحث عن هذه الرسائل في Console:

#### أ) رسائل OAuth:
```
🚀 Starting Google OAuth...
📍 Environment: production
📍 Is Production: true
📍 Is Localhost: false
📍 Hostname: university-3-cuxd.onrender.com
📍 Redirect URL: https://university-3-cuxd.onrender.com/auth/callback
```

#### ب) رسائل Callback:
```
🔍 Google user data: {user object}
📧 User email: user@example.com
👤 User metadata: {metadata object}
🔍 Searching for existing user with email: user@example.com
👤 Existing user found: null (أو user object)
```

#### ج) رسائل إنشاء المستخدم (إذا كان جديد):
```
🔑 Creating session for user: user-id
📝 Session data: {session data}
✅ Session created successfully: {session object}
💾 Session token saved to localStorage
```

### 4. إذا لم تظهر هذه الرسائل:

#### أ) تحقق من URL:
- تأكد من أنك في `/auth/callback`
- تأكد من وجود `#` في URL

#### ب) تحقق من Console:
- ابحث عن رسائل خطأ
- ابحث عن رسائل تحذير

### 5. المشاكل الشائعة:

#### أ) مشكلة في جدول user_sessions:
```
❌ Error creating session: {error details}
```
**الحل**: تأكد من وجود جدول `user_sessions` في Supabase

#### ب) مشكلة في إنشاء المستخدم:
```
❌ خطأ في إنشاء المستخدم: {error details}
```
**الحل**: تحقق من بنية جدول `users`

#### ج) مشكلة في البحث عن المستخدم:
```
❌ خطأ في البحث عن المستخدم: {error details}
```
**الحل**: تحقق من صلاحيات Supabase

## الحلول:

### 1. إنشاء جدول user_sessions (إذا لم يكن موجود):
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

### 2. التحقق من جدول users:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### 3. التحقق من الصلاحيات:
- اذهب إلى Supabase Dashboard
- اذهب إلى "Authentication" → "Policies"
- تأكد من وجود سياسات للقراءة والكتابة

## إرسال معلومات التشخيص:

إذا لم يعمل، أرسل لي:

1. **جميع رسائل Console** (انسخها كاملة)
2. **URL الحالي** عندما تصل إلى callback
3. **لقطة شاشة** من صفحة callback
4. **رسائل الخطأ** إن وجدت

## ملاحظات مهمة:

1. **انتظر 5-10 ثوان** بعد الضغط على "تسجيل الدخول بجوجل"
2. **لا تغلق النافذة** حتى ترى النتيجة
3. **تحقق من Network tab** لرؤية الطلبات
4. **اختبر في متصفح incognito** لتجنب cache
