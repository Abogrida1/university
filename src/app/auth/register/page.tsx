'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisterData } from '@/lib/types';
import { validateNonUniversityEmail } from '@/lib/emailValidator';

export default function RegisterPage() {
  const { user, register, loading } = useUser();
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
    firstName: '',
    department: '',
    year: 1,
    term: 'FIRST'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // إعادة توجيه المستخدمين المسجلين
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const departments = [
    { value: 'Cyber Security', label: 'الأمن السيبراني', icon: '🛡️', color: 'from-red-500 to-pink-600' },
    { value: 'Artificial Intelligence', label: 'الذكاء الاصطناعي', icon: '🤖', color: 'from-blue-500 to-purple-600' },
    { value: 'General Program', label: 'البرنامج العام', icon: '🎓', color: 'from-green-500 to-teal-600' }
  ];

  const years = [
    { value: '1', label: 'السنة الأولى', icon: '1️⃣', color: 'from-orange-500 to-red-600' },
    { value: '2', label: 'السنة الثانية', icon: '2️⃣', color: 'from-yellow-500 to-orange-600' },
    { value: '3', label: 'السنة الثالثة', icon: '3️⃣', color: 'from-green-500 to-emerald-600' },
    { value: '4', label: 'السنة الرابعة', icon: '4️⃣', color: 'from-blue-500 to-indigo-600' }
  ];

  const terms = [
    { value: 'FIRST', label: 'الترم الأول', icon: '1️⃣', color: 'from-purple-500 to-pink-600' },
    { value: 'SECOND', label: 'الترم الثاني', icon: '2️⃣', color: 'from-cyan-500 to-blue-600' }
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

    if (!formData.email || !formData.password || !formData.firstName) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Validate email format and check if it's not a university email
    const emailValidation = validateNonUniversityEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'البريد الإلكتروني غير صحيح');
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
              router.push('/');
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
      const emailValidation = validateNonUniversityEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || '');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl sm:rounded-2xl lg:rounded-3xl mb-4 sm:mb-6 lg:mb-8 shadow-2xl shadow-cyan-500/25">
            <span className="text-xl sm:text-2xl lg:text-3xl">👤</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4">
            إنشاء حساب جديد
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 px-2 sm:px-4">
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

            {/* Department Selection */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6 lg:mb-8">اختر القسم</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {departments.map((dept) => (
                  <button
                    key={dept.value}
                    onClick={() => handleSelection('department', dept.value)}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedData.department === dept.value
                        ? `bg-gradient-to-r ${dept.color} shadow-lg sm:shadow-xl lg:shadow-2xl`
                        : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 lg:mb-4">{dept.icon}</div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2">{dept.label}</h3>
                    {selectedData.department === dept.value && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs sm:text-sm">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Selection */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6 lg:mb-8">اختر السنة</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                {years.map((year) => (
                  <button
                    key={year.value}
                    onClick={() => handleSelection('year', year.value)}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 text-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedData.year === year.value
                        ? `bg-gradient-to-r ${year.color} shadow-md sm:shadow-lg lg:shadow-xl`
                        : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">{year.icon}</div>
                    <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-white">{year.label}</h3>
                    {selectedData.year === year.value && (
                      <div className="absolute top-1 right-1 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Term Selection */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6 lg:mb-8">اختر الترم</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
                {terms.map((term) => (
                  <button
                    key={term.value}
                    onClick={() => handleSelection('term', term.value)}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      selectedData.term === term.value
                        ? `bg-gradient-to-r ${term.color} shadow-md sm:shadow-lg lg:shadow-xl`
                        : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    <div className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 lg:mb-4">{term.icon}</div>
                    <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white">{term.label}</h3>
                    {selectedData.term === term.value && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs sm:text-sm">✓</span>
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
                className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30 w-full sm:w-auto"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Info Form */}
        {step === 2 && (
          <div className="max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-3 sm:px-4 lg:px-0">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-gray-700/50">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
                {error && (
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-red-300 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-base sm:text-lg lg:text-xl">⚠️</span>
                      <span className="font-medium text-xs sm:text-sm lg:text-base">{error}</span>
                    </div>
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-1 sm:mb-2 lg:mb-3">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-sm sm:text-base lg:text-lg"
                    placeholder="أدخل اسمك الأول"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-1 sm:mb-2 lg:mb-3">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleEmailBlur}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-gray-700/50 border-2 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none transition-all duration-300 text-white placeholder-gray-400 text-sm sm:text-base lg:text-lg ${
                      emailError 
                        ? 'border-red-500 focus:border-red-400' 
                        : 'border-gray-600/50 focus:border-cyan-500'
                    }`}
                    placeholder="example@gmail.com"
                    required
                  />
                  {emailError && (
                    <div className="mt-1 sm:mt-2 text-red-400 text-xs sm:text-sm flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{emailError}</span>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-1 sm:mb-2 lg:mb-3">
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-sm sm:text-base lg:text-lg pr-8 sm:pr-10 lg:pr-12"
                      placeholder="أدخل كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-base sm:text-lg lg:text-xl"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-1 sm:mb-2 lg:mb-3">
                    تأكيد كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-gray-700/50 border-2 border-gray-600/50 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-cyan-500 transition-all duration-300 text-white placeholder-gray-400 text-sm sm:text-base lg:text-lg pr-8 sm:pr-10 lg:pr-12"
                      placeholder="أعد إدخال كلمة المرور"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-base sm:text-lg lg:text-xl"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 sm:py-3 lg:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}