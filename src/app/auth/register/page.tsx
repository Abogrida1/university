'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterData } from '@/lib/types';
import { validateEmail } from '@/lib/emailValidator';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const { user, register, loading, setUser, loginWithGoogle } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedData, setSelectedData] = useState({
    department: '',
    year: '',
    term: ''
  });
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    department: '',
    year: 1,
    term: 'FIRST'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  // إعادة توجيه المستخدمين المسجلين (فقط إذا كان الحساب نشط وله بيانات أكاديمية)
  // ولكن ليس إذا كانوا بالفعل في صفحة التسجيل (لتجنب الحلقة)
  useEffect(() => {
    if (user && user.isActive && user.department && user.year && user.term) {
      const currentPath = window.location.pathname;
      // فقط إذا لم نكن في صفحة التسجيل (لتجنب الحلقة)
      if (currentPath === '/auth/register') {
        console.log('✅ Active user with academic data detected on register page, redirecting to welcome...');
        console.log('User data:', {
          isActive: user.isActive,
          department: user.department,
          year: user.year,
          term: user.term
        });
        // توجيه إلى Welcome لإكمال البيانات
        router.push('/welcome');
      }
    }
  }, [user, router]);

  // Google OAuth disabled - removed all related logic

  const departments = [
    { value: 'Cyber Security', label: 'الأمن السيبراني', icon: '🛡️', color: 'from-yellow-500 to-yellow-600' },
    { value: 'Artificial Intelligence', label: 'الذكاء الاصطناعي', icon: '🤖', color: 'from-yellow-500 to-yellow-600' },
    { value: 'General Program', label: 'البرنامج العام', icon: '🎓', color: 'from-yellow-500 to-yellow-600' }
  ];

  const years = [
    { value: '1', label: 'السنة الأولى', icon: '1️⃣', color: 'from-yellow-500 to-yellow-600' },
    { value: '2', label: 'السنة الثانية', icon: '2️⃣', color: 'from-yellow-500 to-yellow-600' },
    { value: '3', label: 'السنة الثالثة', icon: '3️⃣', color: 'from-yellow-500 to-yellow-600' },
    { value: '4', label: 'السنة الرابعة', icon: '4️⃣', color: 'from-yellow-500 to-yellow-600' }
  ];

  const terms = [
    { value: 'FIRST', label: 'الترم الأول', icon: '1️⃣', color: 'from-yellow-500 to-yellow-600' },
    { value: 'SECOND', label: 'الترم الثاني', icon: '2️⃣', color: 'from-yellow-500 to-yellow-600' }
  ];

  const handleSelection = (type: string, value: string) => {
    setSelectedData({
      ...selectedData,
      [type]: value
    });
  };

  const handleNext = () => {
    if (!selectedData.department || !selectedData.year || !selectedData.term) {
      setError('يرجى اختيار القسم والسنة والترم');
      return;
    }

    // الانتقال للخطوة التالية
    setFormData({
      ...formData,
      department: selectedData.department,
      year: parseInt(selectedData.year),
      term: selectedData.term as 'FIRST' | 'SECOND'
    });
    setStep(2);
    setError('');
    setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Validate email format and check if it's not a university email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message || 'البريد الإلكتروني غير صحيح');
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    const success = await register(formData);
    if (success) {
      // توجيه المستخدم الجديد إلى صفحة Welcome
      router.push('/welcome');
    } else {
      setError('خطأ في إنشاء الحساب. تأكد من صحة البيانات أو تحقق من اتصال الإنترنت');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim();

    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.message || '');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle({
        department: selectedData.department,
        year: selectedData.year,
        term: selectedData.term
      });

      if (!success) {
        setError('خطأ في تسجيل الدخول بجوجل');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('خطأ في تسجيل الدخول بجوجل');
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden">
      {/* Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-yellow-400 dark:to-yellow-600 rounded-xl sm:rounded-2xl lg:rounded-3xl mb-4 sm:mb-6 lg:mb-8 shadow-2xl shadow-blue-500/40 dark:shadow-yellow-500/25">
            <img
              src="/assets/icons/main-icon.png"
              alt="University Materials"
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-blue-700 to-blue-900 dark:from-yellow-400 dark:to-yellow-500 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4">
            إنشاء حساب جديد
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-700 dark:text-gray-300 px-2 sm:px-4 font-medium">
            {step === 1 ? 'اختر معلوماتك الأكاديمية' : 'أدخل بياناتك الشخصية'}
          </p>
        </div>

        {/* Step 1: Academic Selection */}
        {step === 1 && (
          <div className="max-w-7xl mx-auto">

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 text-red-300 text-center mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-4 lg:mx-0">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-base sm:text-lg lg:text-xl">⚠️</span>
                  <span className="font-medium text-xs sm:text-sm lg:text-base">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 text-green-300 text-center mb-4 sm:mb-6 lg:mb-8 mx-2 sm:mx-4 lg:mx-0">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-base sm:text-lg lg:text-xl">🎉</span>
                  <span className="font-medium text-xs sm:text-sm lg:text-base">
                    تم إكمال التسجيل بنجاح! جاري التوجيه لصفحة الترحيب...
                  </span>
                </div>
              </div>
            )}

            {/* Department Selection */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white text-center mb-4 sm:mb-6 lg:mb-8">اختر القسم</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {departments.map((dept) => (
                  <button
                    key={dept.value}
                    onClick={() => handleSelection('department', dept.value)}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm ${selectedData.department === dept.value
                      ? `bg-gradient-to-r from-blue-600 to-blue-700 dark:${dept.color} shadow-lg sm:shadow-xl lg:shadow-2xl text-white dark:text-black border-2 border-blue-800 dark:border-yellow-600`
                      : 'register-card-unselected border-2 hover:border-blue-500'
                      }`}
                  >
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 lg:mb-4">{dept.icon}</div>
                    <h3 className={`text-sm sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2 ${selectedData.department === dept.value ? 'text-white dark:text-black' : 'text-slate-900 dark:text-white'
                      }`}>{dept.label}</h3>
                    {selectedData.department === dept.value && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-black/20 dark:bg-white/30 rounded-full flex items-center justify-center">
                        <span className="text-white dark:text-black text-xs sm:text-sm font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Selection */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white text-center mb-4 sm:mb-6 lg:mb-8">اختر السنة</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {years.map((year) => (
                  <button
                    key={year.value}
                    onClick={() => handleSelection('year', year.value)}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm ${selectedData.year === year.value
                      ? `bg-gradient-to-r from-indigo-600 to-indigo-700 dark:${year.color} shadow-md sm:shadow-lg lg:shadow-xl text-white dark:text-black border-2 border-indigo-800 dark:border-yellow-600`
                      : 'register-card-unselected register-card-unselected-indigo border-2 hover:border-indigo-500'
                      }`}
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">{year.icon}</div>
                    <h3 className={`text-xs sm:text-sm lg:text-lg font-bold ${selectedData.year === year.value ? 'text-white dark:text-black' : 'text-slate-900 dark:text-white'
                      }`}>{year.label}</h3>
                    {selectedData.year === year.value && (
                      <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-black/20 dark:bg-white/30 rounded-full flex items-center justify-center">
                        <span className="text-white dark:text-black text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Term Selection */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white text-center mb-4 sm:mb-6 lg:mb-8">اختر الترم</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
                {terms.map((term) => (
                  <button
                    key={term.value}
                    onClick={() => handleSelection('term', term.value)}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm ${selectedData.term === term.value
                      ? `bg-gradient-to-r from-purple-600 to-purple-700 dark:${term.color} shadow-md sm:shadow-lg lg:shadow-xl text-white dark:text-black border-2 border-purple-800 dark:border-yellow-600`
                      : 'register-card-unselected register-card-unselected-purple border-2 hover:border-purple-500'
                      }`}
                  >
                    <div className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 lg:mb-4">{term.icon}</div>
                    <h3 className={`text-sm sm:text-lg lg:text-xl font-bold ${selectedData.term === term.value ? 'text-white dark:text-black' : 'text-slate-900 dark:text-white'
                      }`}>{term.label}</h3>
                    {selectedData.term === term.value && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-black/20 dark:bg-white/30 rounded-full flex items-center justify-center">
                        <span className="text-white dark:text-black text-xs sm:text-sm font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Next Button */}
            <div className="text-center px-2 sm:px-4 lg:px-0">
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-yellow-600 dark:hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/40 dark:shadow-yellow-500/30 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </div>
                ) : (
                  'التالي'
                )}
              </button>
            </div>

          </div>
        )}

        {/* Step 2: Personal Info Form */}
        {step === 2 && (
          <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-3 sm:px-4 lg:px-0">
            <div className="register-form backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border-2">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-red-300 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-base sm:text-lg lg:text-xl">⚠️</span>
                      <span className="font-medium text-xs sm:text-sm lg:text-base">{error}</span>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-slate-800 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1 sm:mb-2 lg:mb-3">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-blue-50 dark:bg-gray-700/50 border-2 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 text-sm sm:text-base lg:text-lg ${emailError
                      ? 'border-red-500 focus:border-red-400'
                      : 'border-blue-300 dark:border-gray-600/50 focus:border-blue-600 dark:focus:border-cyan-500'
                      }`}
                    placeholder="example@gmail.com"
                    required
                  />
                  {emailError && (
                    <div className="mt-1 sm:mt-2 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-slate-800 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1 sm:mb-2 lg:mb-3">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-blue-50 dark:bg-gray-700/50 border-2 border-blue-300 dark:border-gray-600/50 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-blue-600 dark:focus:border-cyan-500 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 text-sm sm:text-base lg:text-lg pr-8 sm:pr-10 lg:pr-12"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-yellow-400 hover:text-blue-800 dark:hover:text-yellow-300 transition-colors text-base sm:text-lg lg:text-xl"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-slate-800 dark:text-gray-300 text-xs sm:text-sm font-bold mb-1 sm:mb-2 lg:mb-3">
                    تأكيد كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-blue-50 dark:bg-gray-700/50 border-2 border-blue-300 dark:border-gray-600/50 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-blue-600 dark:focus:border-cyan-500 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 text-sm sm:text-base lg:text-lg pr-8 sm:pr-10 lg:pr-12"
                      placeholder="أعد إدخال كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-yellow-400 hover:text-blue-800 dark:hover:text-yellow-300 transition-colors text-base sm:text-lg lg:text-xl"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black py-2 sm:py-3 lg:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-yellow-600 dark:hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/40 dark:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                </button>

                {/* Back Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base"
                  >
                    ← العودة للاختيارات
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-300 text-xs sm:text-sm">
                    لديك حساب بالفعل؟{' '}
                    <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                      تسجيل الدخول
                    </Link>
                  </p>
                </div>

                {/* Home Link */}
                <div className="text-center mt-4">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    العودة للصفحة الرئيسية
                  </Link>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}