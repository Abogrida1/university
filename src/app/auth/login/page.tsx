'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoginCredentials } from '@/lib/types';

export default function LoginPage() {
  const { user, login, loading } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/40 dark:shadow-yellow-500/25 animate-pulse">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-700 to-blue-900 dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 bg-clip-text text-transparent mb-4">
            تسجيل الدخول
          </h1>
          <p className="text-slate-700 dark:text-gray-300 text-lg font-medium">
            مرحباً بعودتك! سجل دخولك للوصول إلى حسابك
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-blue-200 dark:border-gray-700/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-500/50 rounded-2xl p-4 text-red-700 dark:text-red-300 text-center animate-shake">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-bold">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-slate-800 dark:text-gray-300 text-sm font-bold mb-3">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-blue-50 dark:bg-gray-700/50 border-2 border-blue-300 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:border-blue-600 dark:focus:border-yellow-500 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 text-lg"
                    placeholder="example@gmail.com"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-gray-400 text-xl">
                    📧
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-gray-300 text-sm font-bold mb-3">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-blue-50 dark:bg-gray-700/50 border-2 border-blue-300 dark:border-gray-600/50 rounded-2xl focus:outline-none focus:border-blue-600 dark:focus:border-yellow-500 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 text-lg pr-12"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-gray-400 text-xl">
                    🔒
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-cyan-500 dark:to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-cyan-600 dark:hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/40 dark:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

          <div className="mt-8 text-center">
            <p className="text-slate-700 dark:text-gray-400 mb-4 font-medium">
              ليس لديك حساب؟
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-teal-600 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-emerald-800 dark:hover:from-emerald-600 dark:hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/40 dark:shadow-emerald-500/30"
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
            className="inline-flex items-center gap-2 text-slate-700 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
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