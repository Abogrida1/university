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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect logged-in users (only if active and has academic data)
  useEffect(() => {
    if (user && user.isActive && user.department && user.year && user.term) {
      console.log('✅ Active user with academic data detected on login page, redirecting to home...');
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول');
      setIsSubmitting(false);
      return;
    }

    const success = await login(formData);
    if (success) {
      // بعد تسجيل الدخول الناجح، سيتم توجيه المستخدم تلقائياً من useEffect في UserContext
      // إذا كان المستخدم جديداً (اسمه فارغ أو هو نفس البريد الإلكتروني)، سيتم توجيهه إلى Welcome
      // وإلا سيتم توجيهه إلى الصفحة الرئيسية
      router.push('/');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Golden Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] -left-[10%] w-[300px] h-[300px] bg-gradient-radial from-yellow-500/8 to-transparent rounded-full animate-float"></div>
        <div className="absolute top-[60%] -right-[5%] w-[200px] h-[200px] bg-gradient-radial from-yellow-500/6 to-transparent rounded-full animate-float" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-[20%] left-[10%] w-[150px] h-[150px] bg-gradient-radial from-yellow-500/4 to-transparent rounded-full animate-float" style={{animationDelay: '-4s'}}></div>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-[400px] relative z-10">
        {/* Login Card */}
        <div className="bg-[#151520] border border-[#2a2a35] rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)] relative backdrop-blur-[20px] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,215,0,0.1),0_0_40px_rgba(255,215,0,0.1)] hover:-translate-y-0.5">
          {/* Neon Top Border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"></div>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="mb-3">
              <img 
                src="/assets/icons/main-icon.png" 
                alt="University Materials" 
                className="w-12 h-12 mx-auto filter drop-shadow-[0_0_20px_rgba(255,215,0,0.3)] animate-pulse"
              />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>تسجيل الدخول</h2>
            <p className="text-[#a0a0b0] text-sm" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>مرحباً بك مرة أخرى! 👋</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="text-red-400 text-lg">⚠️</div>
                <p className="text-red-300 text-sm" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>{error}</p>
              </div>
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="relative">
              <div className="relative">
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a25] border border-[#2a2a35] rounded-md px-4 py-4 text-white text-sm transition-all duration-300 focus:border-yellow-400 focus:bg-[rgba(26,26,37,0.8)] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1),0_4px_20px_rgba(0,255,136,0.1)] outline-none"
                  placeholder=" "
                  required
                />
                <label htmlFor="email" className="absolute left-4 top-4 text-[#a0a0b0] text-sm transition-all duration-300 pointer-events-none origin-left-top" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  البريد الإلكتروني
                </label>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300 transform -translate-x-1/2 rounded-sm"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                  id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                  className="w-full bg-[#1a1a25] border border-[#2a2a35] rounded-md px-4 py-4 pr-12 text-white text-sm transition-all duration-300 focus:border-yellow-400 focus:bg-[rgba(26,26,37,0.8)] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1),0_4px_20px_rgba(0,255,136,0.1)] outline-none"
                  placeholder=" "
                required
              />
                <label htmlFor="password" className="absolute left-4 top-4 text-[#a0a0b0] text-sm transition-all duration-300 pointer-events-none origin-left-top" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  كلمة المرور
                </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#a0a0b0] hover:text-yellow-400 transition-all duration-300 p-2 rounded-md hover:bg-[rgba(255,215,0,0.1)]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
              </button>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300 transform -translate-x-1/2 rounded-sm"></div>
              </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#0a0a0f] font-semibold py-4 px-6 rounded-md transition-all duration-300 relative overflow-hidden uppercase tracking-wider text-sm hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,215,0,0.3),0_0_40px_rgba(255,215,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
            >
              <span className="relative z-10">
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin"></div>
                    جاري تسجيل الدخول...
            </div>
                ) : (
                  'دخول'
                )}
              </span>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full transition-transform duration-500 hover:translate-x-full"></div>
            </button>
          </form>
          

          {/* Links */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-yellow-400 hover:text-cyan-300 transition-colors text-sm font-medium"
                style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
              >
                إنشاء حساب جديد
              </Link>
            </div>
            
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[#a0a0b0] hover:text-white transition-colors text-sm font-medium"
                style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#2a2a35]">
            <p className="text-center text-xs text-[#a0a0b0]" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
              منصة المواد الدراسية - جامعة الزقازيق
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        input:focus + label,
        input:valid + label {
          transform: translateY(-32px) translateX(4px) scale(0.85);
          color: #00ff88;
          font-weight: 500;
        }
        input:focus ~ .absolute.bottom-0 {
          width: 100%;
        }
      `}</style>
    </div>
  );
}