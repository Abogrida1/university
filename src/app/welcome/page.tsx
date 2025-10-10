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
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // تشغيل الرسوم المتحركة بعد تحميل الصفحة
    const timer = setTimeout(() => setShowAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // إعادة توجيه المستخدمين غير المسجلين
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('يرجى إدخال اسمك المفضل');
      return;
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

      // إعادة التوجيه إلى الصفحة الرئيسية
      router.push('/');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-bounce delay-700"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-500/10 rounded-full blur-2xl animate-bounce delay-300"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-300"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Main Welcome Card */}
          <div className={`bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl border border-gray-700/50 transition-all duration-1000 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl mb-8 shadow-2xl shadow-cyan-500/30 animate-pulse">
                <span className="text-5xl">🎓</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 leading-tight" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                مرحباً بك في Our Goal
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                منصة تعليمية متطورة لاختبار القدرات
              </p>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                نحن سعداء لانضمامك إلى مجتمعنا التعليمي المتعاون. ابدأ رحلتك نحو النجاح معنا!
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center p-6 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-bold text-cyan-300 mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  مواد دراسية شاملة
                </h3>
                <p className="text-sm text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  مكتبة ضخمة من المحتوى التعليمي
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-bold text-blue-300 mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  تتبع التقدم
                </h3>
                <p className="text-sm text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  إحصائيات مفصلة لتقدمك الدراسي
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-bold text-purple-300 mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  مجتمع متعاون
                </h3>
                <p className="text-sm text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  انضم لمجتمع الطلاب النشط
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-bold text-green-300 mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  أدوات ذكية
                </h3>
                <p className="text-sm text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  تقنيات متقدمة للتعلم
                </p>
              </div>
            </div>

            {/* Personalization Form */}
            <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-3xl p-8 border border-gray-600/30">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  دعنا نتعرف عليك أكثر! 👋
                </h2>
                <p className="text-lg text-gray-300" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  ما الاسم الذي تود أن نناديك به في منصتنا؟
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="max-w-md mx-auto">
                  <label className="block text-gray-300 text-lg font-bold mb-4 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    اسمك المفضل
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="مثال: أحمد، فاطمة، محمد..."
                    className="w-full px-6 py-4 bg-gray-600/50 border-2 border-gray-500/50 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-lg text-center"
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                    required
                  />
                  <p className="text-sm text-gray-400 mt-3 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    سيظهر هذا الاسم في ملفك الشخصي وعند التفاعل مع المجتمع
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-300 text-center max-w-md mx-auto" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    {error}
                  </div>
                )}

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-12 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الحفظ...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl">🚀</span>
                        <span>ابدأ رحلتك التعليمية</span>
                        <span className="text-2xl">✨</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* What's Next Section */}
            <div className="mt-12 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-3xl p-8 border border-cyan-500/30">
              <h3 className="text-2xl font-bold text-white mb-6 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                🌟 ما ينتظرك بعد ذلك:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ul className="space-y-4 text-gray-300" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  <li className="flex items-center gap-4">
                    <span className="text-2xl">📚</span>
                    <span>الوصول إلى مكتبة شاملة من المواد الدراسية</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-2xl">📊</span>
                    <span>تتبع تقدمك الدراسي وإحصائيات مفصلة</span>
                  </li>
                </ul>
                <ul className="space-y-4 text-gray-300" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  <li className="flex items-center gap-4">
                    <span className="text-2xl">👥</span>
                    <span>الانضمام إلى مجتمع متعاون من الطلاب</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <span className="text-2xl">🎯</span>
                    <span>استخدام أدوات التعلم المتقدمة</span>
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
