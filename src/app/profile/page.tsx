'use client';

import React, { useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout, updateProfile, changePassword } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    year: user?.year || 1,
    term: user?.term || 'FIRST'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    { value: 'General Program', label: 'البرنامج العام' },
    { value: 'Cyber Security', label: 'الأمن السيبراني' },
    { value: 'Artificial Intelligence', label: 'الذكاء الاصطناعي' }
  ];

  const terms = [
    { value: 'FIRST', label: 'الترم الأول' },
    { value: 'SECOND', label: 'الترم الثاني' }
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const success = await updateProfile(formData);
    if (success) {
      setMessage('تم تحديث الملف الشخصي بنجاح');
      setIsEditing(false);
    } else {
      setMessage('خطأ في تحديث الملف الشخصي');
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      setLoading(false);
      return;
    }

    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (success) {
      setMessage('تم تغيير كلمة المرور بنجاح');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setMessage('خطأ في تغيير كلمة المرور. تأكد من كلمة المرور الحالية');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden">
      {/* Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="text-center max-w-md mx-auto">
          <div className="text-4xl sm:text-6xl mb-4">🔒</div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            غير مصرح لك بالوصول
          </h1>
          <p className="text-slate-700 dark:text-gray-400 mb-6 text-sm sm:text-base font-medium" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            يرجى تسجيل الدخول أولاً
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 dark:hover:from-yellow-600 dark:hover:to-yellow-700 transition-all duration-300 text-sm sm:text-base shadow-lg shadow-blue-500/40"
            style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden">
      {/* Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-yellow-400 dark:to-yellow-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 lg:mb-8 shadow-2xl shadow-blue-500/40 dark:shadow-yellow-500/25">
              <img 
                src="/assets/icons/main-icon.png" 
                alt="University Materials" 
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-700 to-blue-900 dark:from-yellow-400 dark:to-yellow-500 bg-clip-text text-transparent mb-3 sm:mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
              الملف الشخصي
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-700 dark:text-gray-300 px-2 font-medium" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
              إدارة حسابك ومعلوماتك الشخصية
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl text-center text-sm sm:text-base ${
              message.includes('نجاح') 
                ? 'bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500/50 text-green-700 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300'
            }`} style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-blue-200 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                    معلومات الحساب
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 dark:hover:from-yellow-600 dark:hover:to-yellow-700 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto shadow-lg shadow-blue-500/40"
                      style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                    >
                      تعديل
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600/50 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-yellow-500 transition-colors text-gray-900 dark:text-white text-base sm:text-lg"
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        القسم
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 sm:px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors text-white text-base sm:text-lg"
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        {departments.map(dept => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          السنة الدراسية
                        </label>
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                          className="w-full px-3 sm:px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors text-white text-base sm:text-lg"
                          style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                        >
                          {[1,2,3,4].map(year => (
                            <option key={year} value={year}>
                              السنة {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          الفصل الدراسي
                        </label>
                        <select
                          value={formData.term}
                          onChange={(e) => setFormData({ ...formData, term: e.target.value as 'FIRST' | 'SECOND' })}
                          className="w-full px-3 sm:px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors text-white text-base sm:text-lg"
                          style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                        >
                          {terms.map(term => (
                            <option key={term.value} value={term.value}>
                              {term.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 sm:px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            department: user.department || '',
                            year: user.year || 1,
                            term: user.term || 'FIRST'
                          });
                        }}
                        className="px-4 sm:px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          الاسم الكامل
                        </label>
                        <p className="text-white text-base sm:text-lg" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          {user.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          البريد الإلكتروني
                        </label>
                        <p className="text-white text-base sm:text-lg break-all" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          {user.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          القسم
                        </label>
                        <p className="text-white text-base sm:text-lg" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          {departments.find(d => d.value === user.department)?.label || user.department}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          السنة الدراسية
                        </label>
                        <p className="text-white text-base sm:text-lg" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          السنة {user.year}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          الفصل الدراسي
                        </label>
                        <p className="text-white text-base sm:text-lg" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          {terms.find(t => t.value === user.term)?.label || user.term}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          نوع الحساب
                        </label>
                        <p className="text-white text-base sm:text-lg" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                          {user.role === 'student' ? 'طالب' : user.role === 'admin' ? 'مدير' : 'مدير رئيسي'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 sm:space-y-6">
              {/* Change Password */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-700/50">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  كلمة المرور
                </h3>
                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-3 sm:px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors text-white text-base sm:text-lg"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 sm:px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors text-white text-base sm:text-lg"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 sm:px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-yellow-500 transition-colors text-white text-base sm:text-lg"
                        required
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        تغيير
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                        style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all duration-300 text-sm sm:text-base"
                    style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                  >
                    تغيير كلمة المرور
                  </button>
                )}
              </div>

              {/* Logout */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-700/50">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  الحساب
                </h3>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300 text-sm sm:text-base"
                  style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
