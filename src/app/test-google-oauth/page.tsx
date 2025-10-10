'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestGoogleOAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // التحقق من الجلسة الحالية
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    checkSession();

    // الاستماع لتغييرات الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setError(error.message);
      } else {
        console.log('Google OAuth initiated:', data);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        setError(error.message);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">اختبار Google OAuth</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <h3 className="text-red-300 font-semibold mb-2">خطأ:</h3>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">حالة المصادقة:</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>معرف المستخدم:</strong> {user.id}</p>
              <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
              <p><strong>الاسم:</strong> {user.user_metadata?.full_name || 'غير محدد'}</p>
              <p><strong>مزود المصادقة:</strong> {user.app_metadata?.provider || 'غير محدد'}</p>
              <p><strong>تاريخ الإنشاء:</strong> {new Date(user.created_at).toLocaleString('ar-EG')}</p>
              <p><strong>آخر تحديث:</strong> {new Date(user.updated_at).toLocaleString('ar-EG')}</p>
            </div>
          ) : (
            <p className="text-gray-400">لم يتم تسجيل الدخول</p>
          )}
        </div>

        <div className="space-y-4">
          {!user ? (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول بجوجل'}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 transition-all duration-300"
            >
              تسجيل الخروج
            </button>
          )}

          <div className="text-center">
            <a
              href="/"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              العودة للصفحة الرئيسية
            </a>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">معلومات التصحيح:</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>URL الحالي:</strong> {typeof window !== 'undefined' ? window.location.href : 'غير متاح'}</p>
            <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'غير متاح'}</p>
            <p><strong>Redirect URL:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'غير متاح'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
