# 🔧 إعداد Supabase جديد

## المشكلة:
المشروع الحالي لا يستجيب: `cuhztjuphamulkgfhchcp.supabase.co`

## الحل:
إنشاء مشروع Supabase جديد

---

## 📋 خطوات إنشاء مشروع جديد:

### 1. اذهب لـ [supabase.com](https://supabase.com)
### 2. سجل دخول أو أنشئ حساب
### 3. اضغط "New Project"
### 4. اختر:
   - **Organization**: Default
   - **Name**: `university-materials`
   - **Database Password**: اختر كلمة مرور قوية
   - **Region**: اختر الأقرب لك

### 5. اضغط "Create new project"
### 6. انتظر إنشاء المشروع (2-3 دقائق)

---

## 🔑 الحصول على المفاتيح:

### 1. اذهب لـ **Settings** → **API**
### 2. انسخ:
   - **Project URL** (مثل: `https://xxxxx.supabase.co`)
   - **anon public** key (مثل: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

## 🗄️ إعداد قاعدة البيانات:

### 1. اذهب لـ **SQL Editor**
### 2. اضغط "New Query"
### 3. انسخ والصق الكود من ملف `database/schema.sql`
### 4. اضغط "Run"

---

## 🔄 تحديث الكود:

### 1. افتح `src/lib/supabase.ts`
### 2. استبدل:
```typescript
const supabaseUrl = 'https://YOUR-NEW-PROJECT-ID.supabase.co';
const supabaseAnonKey = 'YOUR-NEW-ANON-KEY';
```

### 3. ارفع التحديث على GitHub

---

## ✅ النتيجة:
- ✅ مشروع Supabase جديد يعمل
- ✅ قاعدة البيانات جاهزة
- ✅ الموقع سيعمل مع البيانات الجديدة

---

## 📞 للمساعدة:
إذا واجهت أي مشاكل:
1. تأكد من أن المشروع نشط
2. تأكد من صحة المفاتيح
3. تأكد من تشغيل SQL schema
