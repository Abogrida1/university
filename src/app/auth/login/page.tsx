'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginCredentials } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { user, login, loading } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // إعادة توجيه المستخدمين المسجلين
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    const success = await login(formData);
    if (success) {
      router.push('/');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setError('');

      // تسجيل الدخول بجوجل عبر Supabase
      console.log('🚀 Starting Google OAuth from login page...');
      
      // تحديد redirect URL
      const isProduction = process.env.NODE_ENV === 'production';
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      let redirectUrl;
      if (isProduction && !isLocalhost) {
        redirectUrl = 'https://university-3-cuxd.onrender.com/auth/callback';
      } else if (isLocalhost) {
        redirectUrl = 'http://localhost:3000/auth/callback';
      } else {
        redirectUrl = 'https://university-3-cuxd.onrender.com/auth/callback';
      }
      
      console.log('📍 Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      console.log('📊 OAuth Response:', { data, error });

      if (error) {
        console.error('خطأ في تسجيل الدخول بجوجل:', error);
        setError('خطأ في تسجيل الدخول بجوجل');
        return;
      }

      // حفظ علامة أن هذا من صفحة تسجيل الدخول
      localStorage.setItem('loginSource', 'login');

    } catch (error) {
      console.error('خطأ في تسجيل الدخول بجوجل:', error);
      setError('خطأ في تسجيل الدخول بجوجل');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl mb-6 shadow-2xl shadow-yellow-500/25 animate-pulse">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
            تسجيل الدخول
          </h1>
          <p className="text-gray-300 text-lg">
            مرحباً بعودتك! سجل دخولك للوصول إلى حسابك
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4 text-red-300 text-center animate-shake">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-bold">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-2xl focus:outline-none focus:border-yellow-500 transition-all duration-300 text-white placeholder-gray-400 text-lg"
                    placeholder="example@gmail.com"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    📧
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-2xl focus:outline-none focus:border-yellow-500 transition-all duration-300 text-white placeholder-gray-400 text-lg pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                    🔒
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري تسجيل الدخول...</span>
                </div>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 text-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800/50 text-gray-400">أو</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || loading}
            className="w-full bg-white text-gray-800 py-4 px-6 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {isGoogleLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
                <span>جاري تسجيل الدخول...</span>
              </div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>تسجيل الدخول بجوجل</span>
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">
              ليس لديك حساب؟
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/30"
            >
              <span>إنشاء حساب جديد</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}