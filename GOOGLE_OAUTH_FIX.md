# إصلاح مشكلة Google OAuth

## المشكلة الحالية:
Google OAuth يعيد التوجيه إلى `localhost:3000` بدلاً من الرابط الحقيقي للموقع.

## الحل المطلوب:

### 1. تحديث إعدادات Supabase:
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك: `cuhztjuphamulkgfhhcp`
3. اذهب إلى **Authentication** > **URL Configuration**
4. في **Site URL** ضع: `https://university-3-cuxd.onrender.com`
5. في **Redirect URLs** أضف: `https://university-3-cuxd.onrender.com/auth/callback`
6. **احذف** `http://localhost:3000` من Redirect URLs إذا كان موجود

### 2. تحديث Google Cloud Console:
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. اختر مشروعك
3. اذهب إلى **APIs & Services** > **Credentials**
4. اختر OAuth 2.0 Client ID
5. في **Authorized redirect URIs** أضف: `https://university-3-cuxd.onrender.com/auth/callback`
6. **احذف** `http://localhost:3000` من Authorized redirect URIs إذا كان موجود

### 3. التحقق من الإعدادات:
- **Supabase Site URL**: `https://university-3-cuxd.onrender.com`
- **Supabase Redirect URLs**: `https://university-3-cuxd.onrender.com/auth/callback`
- **Google Authorized redirect URIs**: `https://university-3-cuxd.onrender.com/auth/callback`

### 4. اختبار الحل:
1. امسح cache المتصفح (Ctrl+Shift+Delete)
2. اذهب إلى `https://university-3-cuxd.onrender.com/login`
3. اضغط على "تسجيل الدخول بجوجل"
4. يجب أن يعيدك إلى الموقع الحقيقي وليس localhost

## ملاحظات مهمة:
- تأكد من أن جميع الإعدادات صحيحة في كلا المنصتين
- قد تحتاج إلى انتظار بضع دقائق حتى تنتشر التغييرات
- جرب متصفح مختلف أو وضع incognito للاختبار
