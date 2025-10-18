'use client';

import Link from 'next/link';
import { useUser } from '@/lib/UserContext';
import { useState } from 'react';

export default function SimpleHeader() {
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block bg-black/95 backdrop-blur-sm sticky top-0 z-50 shadow-2xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
               <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:shadow-yellow-500/50 transition-all duration-300 group-hover:scale-105">
                 <img 
                   src="/assets/icons/main-icon.png" 
                   alt="University Materials" 
                   className="w-6 h-6 sm:w-7 sm:h-7"
                 />
               </div>
              <div>
                <span className="text-xl sm:text-2xl font-black text-white">
                  University Materials
                </span>
                <p className="text-sm text-gray-300 -mt-1 font-medium">طلاب جامعة الزقازيق</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="flex space-x-8 sm:space-x-10">
              <Link href="/" className="text-white hover:text-yellow-400 transition-all duration-300 font-semibold text-sm sm:text-base group px-3 py-2 rounded-lg hover:bg-yellow-500/10">
                <span className="group-hover:scale-105 transition-transform duration-300">الرئيسية</span>
              </Link>
              <Link href="/about" className="text-white hover:text-yellow-400 transition-all duration-300 font-semibold text-sm sm:text-base group px-3 py-2 rounded-lg hover:bg-yellow-500/10">
                <span className="group-hover:scale-105 transition-transform duration-300">من نحن</span>
              </Link>
              <Link href="/contact" className="text-white hover:text-yellow-400 transition-all duration-300 font-semibold text-sm sm:text-base group px-3 py-2 rounded-lg hover:bg-yellow-500/10">
                <span className="group-hover:scale-105 transition-transform duration-300">تواصل معنا</span>
              </Link>
              {user && (user.role === 'admin' || user.role === 'super_admin') && (
                <Link href="/admin" className="text-white hover:text-red-400 transition-all duration-300 font-semibold text-sm sm:text-base group px-3 py-2 rounded-lg hover:bg-red-500/10">
                  <span className="group-hover:scale-105 transition-transform duration-300">الإدارة</span>
                </Link>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white font-medium">{user.name}</span>
                    <span className="text-gray-400 text-sm">▼</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <p className="text-cyan-400 text-sm font-medium">
                          {user.role === 'student' ? 'طالب' : user.role === 'admin' ? 'مدير' : 'مدير رئيسي'}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        حسابي الشخصي
                      </Link>
                      {user.department && user.year && user.term && (
                        <div className="px-4 py-2 text-gray-400 text-sm">
                          {user.department} - السنة {user.year} - {user.term === 'FIRST' ? 'الترم الأول' : 'الترم الثاني'}
                        </div>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-3 text-red-400 hover:bg-red-900/30 transition-colors"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 text-white hover:text-yellow-400 transition-all duration-300 font-semibold group px-3 py-2 rounded-lg hover:bg-yellow-500/10"
                  >
                    <img 
                      src="/assets/icons/enter.png" 
                      alt="تسجيل الدخول" 
                      className="w-4 h-4 group-hover:scale-110 transition-all duration-300 brightness-0 invert"
                    />
                    <span>تسجيل الدخول</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-bold text-sm hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-50 shadow-2xl">
        <div className="px-1 sm:px-2 py-2 sm:py-3">
          <div className="flex justify-around items-center">
            {/* Home */}
            <Link
              href="/"
              className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 group min-w-0 flex-1"
            >
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-white group-hover:text-yellow-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </div>
              <span className="text-xs sm:text-sm text-white group-hover:text-yellow-400 font-medium">الرئيسية</span>
            </Link>

            {/* About */}
            <Link
              href="/about"
              className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 group min-w-0 flex-1"
            >
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-white group-hover:text-yellow-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs sm:text-sm text-white group-hover:text-yellow-400 font-medium">من نحن</span>
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 group min-w-0 flex-1"
            >
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                <svg className="w-5 h-5 text-white group-hover:text-yellow-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
              </div>
              <span className="text-xs sm:text-sm text-white group-hover:text-yellow-400 font-medium">تواصل معنا</span>
            </Link>

            {/* Profile/Account */}
            <Link
              href={user ? "/profile" : "/login"}
              className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 group min-w-0 flex-1"
            >
              <div className="w-6 h-6 flex items-center justify-center mb-1">
                {user ? (
                  <svg className="w-5 h-5 text-white group-hover:text-yellow-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <img 
                    src="/assets/icons/enter.png" 
                    alt="تسجيل الدخول" 
                    className="w-4 h-4 group-hover:scale-110 transition-all duration-300 brightness-0 invert"
                  />
                )}
              </div>
              <span className="text-xs sm:text-sm text-white group-hover:text-yellow-400 font-medium">
                {user ? 'حسابي' : 'تسجيل الدخول'}
              </span>
            </Link>

            {/* Admin (if user is admin) */}
            {user && (user.role === 'admin' || user.role === 'super_admin') && (
              <Link
                href="/admin"
                className="flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 group min-w-0 flex-1"
              >
                <div className="w-6 h-6 flex items-center justify-center mb-1">
                  <svg className="w-5 h-5 text-white group-hover:text-red-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-xs sm:text-sm text-white group-hover:text-red-400 font-medium">الإدارة</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
