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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-gray-400 mb-6">يرجى تسجيل الدخول أولاً</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl mb-8 shadow-2xl shadow-cyan-500/25">
              <span className="text-4xl">👤</span>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              الملف الشخصي
            </h1>
            <p className="text-xl text-gray-300">إدارة حسابك ومعلوماتك الشخصية</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-8 p-4 rounded-xl text-center ${
              message.includes('نجاح') 
                ? 'bg-green-900/30 border border-green-500/50 text-green-300' 
                : 'bg-red-900/30 border border-red-500/50 text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white">معلومات الحساب</h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                    >
                      تعديل
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2">
                        القسم
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors text-white"
                      >
                        {departments.map(dept => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">
                          السنة الدراسية
                        </label>
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors text-white"
                        >
                          {[1,2,3,4].map(year => (
                            <option key={year} value={year}>
                              السنة {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">
                          الفصل الدراسي
                        </label>
                        <select
                          value={formData.term}
                          onChange={(e) => setFormData({ ...formData, term: e.target.value as 'FIRST' | 'SECOND' })}
                          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors text-white"
                        >
                          {terms.map(term => (
                            <option key={term.value} value={term.value}>
                              {term.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50"
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
                        className="px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">الاسم الكامل</label>
                        <p className="text-white text-lg">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">البريد الإلكتروني</label>
                        <p className="text-white text-lg">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">القسم</label>
                        <p className="text-white text-lg">
                          {departments.find(d => d.value === user.department)?.label || user.department}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">السنة الدراسية</label>
                        <p className="text-white text-lg">السنة {user.year}</p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">الفصل الدراسي</label>
                        <p className="text-white text-lg">
                          {terms.find(t => t.value === user.term)?.label || user.term}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm font-bold mb-2">نوع الحساب</label>
                        <p className="text-white text-lg">
                          {user.role === 'student' ? 'طالب' : user.role === 'admin' ? 'مدير' : 'مدير رئيسي'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">كلمة المرور</h3>
                {isChangingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2">
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-bold mb-2">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors text-white"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 text-sm"
                      >
                        تغيير
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-700 transition-all duration-300"
                  >
                    تغيير كلمة المرور
                  </button>
                )}
              </div>

              {/* Logout */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">الحساب</h3>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition-all duration-300"
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
