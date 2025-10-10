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

  useEffect(() => {
    // تشغيل الرسوم المتحركة بعد تحميل الصفحة
    const timer = setTimeout(() => setShowAnimation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // إعادة توجيه المستخدمين غير المسجلين فقط
  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login...');
      router.push('/login');
    }
  }, [user, router]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 transition-all duration-1000 ${
        showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/30">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            مرحباً بك في Our Goal
          </h1>
          <p className="text-gray-300" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            منصة تعليمية متطورة لاختبار القدرات
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
              أخبرنا عن نفسك
            </h2>
            <p className="text-gray-300 text-center mb-6 text-sm" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
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
                className="w-full px-4 py-3 bg-gray-700/50 border-2 border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-center"
                style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                required
                disabled={success}
              />
              <p className="text-xs text-gray-400 mt-2 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                سيظهر هذا الاسم في ملفك الشخصي
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 text-red-300 text-center text-sm" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 text-green-300 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xl">✅</span>
                <span className="font-bold">تم حفظ اسمك بنجاح!</span>
              </div>
              <p className="text-sm">جاري توجيهك إلى الصفحة الرئيسية...</p>
              <div className="w-5 h-5 border-2 border-green-300 border-t-transparent rounded-full animate-spin mx-auto mt-2"></div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري الحفظ...</span>
              </div>
            ) : success ? (
              'تم الحفظ بنجاح'
            ) : (
              'متابعة'
            )}
          </button>
        </form>

        {/* Features */}
        <div className="mt-8 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-xl p-4 border border-cyan-500/30">
          <h3 className="text-sm font-bold text-white mb-3 text-center" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            ما ينتظرك:
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-300" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            <div className="flex items-center gap-2">
              <span>📚</span>
              <span>مواد دراسية</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📊</span>
              <span>تتبع التقدم</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>مجتمع متعاون</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>أدوات ذكية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
