# تشخيص مشكلة تسجيل الدخول بجوجل

## المشكلة:
تسجيل الدخول بجوجل يعمل لكن المستخدم لا يظهر كمسجل دخول في الموقع.

## خطوات التشخيص:

### 1. افتح Developer Tools:
- اضغط `F12` أو `Ctrl+Shift+I`
- اذهب إلى تبويب **Console**

### 2. امسح الـ Console:
- اضغط على أيقونة 🚫 لمسح جميع الرسائل

### 3. جرب تسجيل الدخول بجوجل مرة أخرى

### 4. ابحث عن هذه الرسائل في Console:

#### أ) رسائل OAuth (يجب أن تظهر):
```
🚀 Starting Google OAuth...
📍 Redirect URL: https://university-l2nm.vercel.app/auth/callback
```

#### ب) رسائل Callback (بعد العودة من Google):
```
🔍 Google user data: {user object}
📧 User email: your@email.com
👤 Existing user found: ...
✅ Session created successfully: ...
💾 Session token saved to localStorage
```

#### ج) رسائل UserContext (في الصفحة الرئيسية):
```
🔄 UserContext: Loading user from session...
🔑 Session token found: Yes
✅ User loaded successfully with all data: ...
```

---

## الحالات المحتملة:

### ⚠️ الحالة 1: لا توجد رسالة "Session token saved"
**المشكلة:** الجلسة لم تُحفظ في localStorage

**الحل:**
1. تأكد من أن المتصفح يسمح بالـ localStorage
2. جرب في متصفح آخر

---

### ⚠️ الحالة 2: "Session token found: No"
**المشكلة:** الجلسة لم تُحفظ أو مُسحت

**الحل:**
افتح Developer Tools → تبويب **Application** → **Local Storage** → `https://university-l2nm.vercel.app`

تأكد من وجود:
- `session_token` = "some-long-token-here"

إذا لم يكن موجود، هذا يعني أن الجلسة لم تُحفظ.

---

### ⚠️ الحالة 3: "User account is not active"
**المشكلة:** الحساب غير مفعل لأنه يحتاج لبيانات أكاديمية

**الحل:**
يجب أن يتم توجيهك تلقائياً لصفحة إكمال التسجيل.
إذا لم يحدث، اذهب يدوياً إلى: `/auth/register?step=1&google=true`

---

### ⚠️ الحالة 4: خطأ في قاعدة البيانات
**الرسالة في Console:**
```
❌ خطأ في البحث عن المستخدم: ...
❌ خطأ في إنشاء المستخدم: ...
```

**الحل:**
تأكد من إعدادات Supabase:
1. الجداول موجودة (`users`, `user_sessions`)
2. الصلاحيات صحيحة (RLS policies)

---

## اختبار يدوي:

### افتح Console واكتب:
```javascript
console.log('Session token:', localStorage.getItem('session_token'));
```

**إذا كانت النتيجة `null`:**
- الجلسة غير محفوظة
- المشكلة في صفحة callback

**إذا كانت النتيجة token طويل:**
- الجلسة محفوظة
- المشكلة في UserContext أو قاعدة البيانات

---

## الحل المؤقت:

إذا استمرت المشكلة، جرب تسجيل الدخول بالطريقة التقليدية:
1. اذهب إلى `/auth/register`
2. سجل حساب جديد بنفس البريد الإلكتروني
3. أكمل البيانات الأكاديمية

---

## ملاحظات للمطور:

### التحقق من الجلسة في قاعدة البيانات:
```sql
-- في Supabase SQL Editor
SELECT * FROM user_sessions 
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'your@email.com'
)
ORDER BY created_at DESC
LIMIT 5;
```

### التحقق من المستخدم:
```sql
SELECT id, email, name, department, year, term, is_active 
FROM users 
WHERE email = 'your@email.com';
```

إذا كان `is_active = false` أو `department = null`:
- المستخدم بحاجة لإكمال التسجيل
- يجب توجيهه لصفحة `/auth/register`

