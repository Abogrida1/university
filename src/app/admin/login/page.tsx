'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserService } from '@/lib/userService';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // استخدام UserService للتحقق من بيانات الدخول
      const result = await UserService.login({
        email: formData.email,
        password: formData.password
      });

      if (result && result.user) {
        // التحقق من أن المستخدم أدمن أو سوبر أدمن
        if (result.user.role === 'admin' || result.user.role === 'super_admin') {
          // حفظ بيانات الجلسة في localStorage
          localStorage.setItem('superAdmin', JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            loginTime: new Date().toISOString()
          }));
          
          // حفظ session token
          localStorage.setItem('sessionToken', result.session.sessionToken);
          
          // التوجه إلى لوحة التحكم
          router.push('/admin/dashboard');
        } else {
          setError('هذا الحساب ليس لديه صلاحيات إدارية');
        }
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      setError('حدث خطأ في تسجيل الدخول. تأكد من بيانات الدخول.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl mb-6 shadow-2xl shadow-red-500/25">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-400 via-red-400 to-red-400 bg-clip-text text-transparent mb-4">
            Super Admin
          </h1>
          <p className="text-xl text-gray-300">
            تسجيل دخول مدير النظام
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white font-medium mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500"
                placeholder="admin@university.edu"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">كلمة المرور</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
            <h3 className="text-white font-medium mb-2">👑 حساب المدير الرئيسي:</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>البريد:</strong> admin@university.edu</p>
              <p><strong>كلمة المرور:</strong> password</p>
            </div>
            <p className="text-xs text-yellow-400 mt-2">⚠️ غيّر كلمة المرور بعد أول تسجيل دخول</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
