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

  useEffect(() => {
    // تشغيل الرسوم المتحركة بعد تحميل الصفحة
    const timer = setTimeout(() => setShowAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto w-full">
          {/* Welcome Card */}
          <div className={`bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-700/50 transition-all duration-1000 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl shadow-cyan-500/25">
                <span className="text-4xl">🎉</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                مرحباً بك في منصتنا التعليمية
              </h1>
              <p className="text-lg text-gray-300" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                نحن سعداء لانضمامك إلى مجتمعنا التعليمي المتعاون
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="text-sm font-bold text-cyan-300 mb-1" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  مواد دراسية
                </h3>
                <p className="text-xs text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  مكتبة شاملة
                </p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="text-sm font-bold text-blue-300 mb-1" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  تتبع التقدم
                </h3>
                <p className="text-xs text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  إحصائيات مفصلة
                </p>
              </div>
              <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="text-sm font-bold text-purple-300 mb-1" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  مجتمع متعاون
                </h3>
                <p className="text-xs text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  دعم الطلاب
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  أخبرنا عن نفسك
                </h2>
                <p className="text-gray-300 text-center mb-6" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  ما الاسم الذي تود أن نناديك به؟
                </p>
                
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-3" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    اسمك المفضل
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="مثال: أحمد، فاطمة، محمد..."
                    className="w-full px-4 py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-lg"
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                    required
                  />
                  <p className="text-sm text-gray-400 mt-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    سيظهر هذا الاسم في ملفك الشخصي وعند التفاعل مع المجتمع
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 text-red-300 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  'ابدأ رحلتك التعليمية'
                )}
              </button>
            </form>

            {/* What's Next */}
            <div className="mt-8 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl p-6 border border-cyan-500/30">
              <h3 className="text-lg font-bold text-white mb-4 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                ما ينتظرك بعد ذلك:
              </h3>
              <ul className="space-y-2 text-sm text-gray-300" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">📚</span>
                  <span>الوصول إلى مكتبة شاملة من المواد الدراسية</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-blue-400">📊</span>
                  <span>تتبع تقدمك الدراسي وإحصائيات مفصلة</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-purple-400">👥</span>
                  <span>الانضمام إلى مجتمع متعاون من الطلاب</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-400">🎯</span>
                  <span>استخدام أدوات التعلم المتقدمة</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
