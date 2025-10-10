'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';
import { supabase } from '@/lib/supabase';

export default function WelcomePage() {
  const { user, updateProfile } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // تشغيل الرسوم المتحركة بعد تحميل الصفحة
    const timer = setTimeout(() => setShowAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // إعادة توجيه المستخدمين غير المسجلين فقط
  useEffect(() => {
    // انتظار قليل للتأكد من تحميل بيانات المستخدم
    const timer = setTimeout(() => {
      if (!user && !hasRedirected) {
        console.log('No user found after timeout, redirecting to login...');
        setHasRedirected(true);
        window.location.href = '/login';
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, hasRedirected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('يرجى إدخال اسمك المفضل');
      return;
    }

    if (success) {
      return; // منع إرسال النموذج مرة أخرى إذا كان في حالة نجاح
    }

    setIsSubmitting(true);
    setError('');

    try {
      // تحديث اسم المستخدم في قاعدة البيانات
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: displayName.trim() })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      // تحديث البيانات في السياق المحلي
      await updateProfile({ name: displayName.trim() });

      // إظهار رسالة النجاح
      setSuccess(true);
      console.log('Name updated successfully, redirecting to home...');
      
      // إعادة التوجيه إلى الصفحة الرئيسية
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('خطأ في حفظ الاسم:', err);
      setError('حدث خطأ في حفظ الاسم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white p-4 sm:p-8 lg:p-12">
      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 mb-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm shadow-lg shadow-primary/10">
            <span className="text-primary font-bold text-xl sm:text-2xl" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              مرحباً بك في University Planner
            </span>
            <span className="text-accent text-2xl sm:text-3xl">🎉</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4 sm:mb-6" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            أهلاً وسهلاً!
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            نحن سعداء لانضمامك إلى مجتمعنا التعليمي المتعاون
          </p>
        </div>

        {/* Info Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-700/50 mb-12 sm:mb-16">
          <p className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 leading-relaxed" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            لإكمال عملية التسجيل، يرجى إضافة اسم المستخدم الخاص بك أدناه. هذا ضروري للوصول إلى جميع ميزات المنصة بما في ذلك المواد الدراسية والفعاليات.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="p-4 sm:p-6 bg-background/50 rounded-2xl border border-primary/10 backdrop-blur-sm text-center">
              <span className="block w-12 h-12 sm:w-14 sm:h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl sm:text-3xl">🎯</span>
              <h3 className="font-bold text-foreground mb-2 text-lg sm:text-xl" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                مواد دراسية شاملة
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                مكتبة ضخمة من المحتوى التعليمي
              </p>
            </div>
            <div className="p-4 sm:p-6 bg-background/50 rounded-2xl border border-primary/10 backdrop-blur-sm text-center">
              <span className="block w-12 h-12 sm:w-14 sm:h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl sm:text-3xl">✅</span>
              <h3 className="font-bold text-foreground mb-2 text-lg sm:text-xl" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                تتبع التقدم
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                إحصائيات مفصلة لتقدمك الدراسي
              </p>
            </div>
            <div className="p-4 sm:p-6 bg-background/50 rounded-2xl border border-primary/10 backdrop-blur-sm text-center">
              <span className="block w-12 h-12 sm:w-14 sm:h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl sm:text-3xl">👤</span>
              <h3 className="font-bold text-foreground mb-2 text-lg sm:text-xl" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                ملف شخصي
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                إحصائيات مفصلة
              </p>
            </div>
          </div>

          {/* Name Input Form */}
          <div className="bg-card text-card-foreground bg-gradient-to-br from-card/90 to-card/60 border-0 rounded-3xl backdrop-blur-xl shadow-2xl shadow-primary/10">
            <div className="flex flex-col space-y-1.5 p-6 text-center pb-8 pt-12">
              <div className="w-20 h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-primary text-4xl">👋</span>
              </div>
              <h3 className="tracking-tight text-2xl sm:text-3xl font-bold text-foreground mb-3" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                أخبرنا عن نفسك
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                ما الاسم الذي تود أن نناديك به؟
              </p>
            </div>
            <div className="p-6 pt-0 px-8 sm:px-12 pb-8 sm:pb-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-lg sm:text-xl font-bold text-foreground flex items-center gap-3" htmlFor="username" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-base">
                      <span className="text-xl">📝</span>
                    </div>
                    اسمك المفضل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      className="flex h-12 sm:h-14 w-full border ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-base sm:text-lg p-4 sm:p-6 bg-background/50 rounded-xl text-center font-medium transition-colors border-primary/20 focus:border-primary"
                      placeholder="مثال: أحمد، فاطمة، محمد..."
                      maxLength={50}
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}
                    />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground text-center" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    سيظهر هذا الاسم في ملفك الشخصي وعند التفاعل مع المجتمع
                  </p>
                </div>
                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-3 rounded-lg text-center text-sm" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-900/30 border border-green-500/50 text-green-300 p-3 rounded-lg text-center text-sm" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {success}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-12 sm:h-14 px-6 sm:px-8 w-full py-6 text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent text-black rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🚀</span>
                      <span>ابدأ رحلتك التعليمية</span>
                      <span className="text-2xl">✨</span>
                    </>
                  )}
                </button>
              </form>
              <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <h4 className="font-bold text-primary mb-3 flex items-center gap-2 text-lg sm:text-xl" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  <span className="text-2xl">🌟</span>
                  ما ينتظرك بعد ذلك:
                </h4>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground" style={{ fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    الوصول إلى مكتبة شاملة من المواد الدراسية
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    تتبع تقدمك الدراسي وإحصائيات مفصلة
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    الانضمام إلى مجتمع متعاون من الطلاب
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    استخدام أدوات التعلم المتقدمة
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}