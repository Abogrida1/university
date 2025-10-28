'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden flex items-center justify-center px-4">
      {/* Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="text-center relative z-10 max-w-2xl mx-auto">
        {/* Icon */}
        <div className="text-8xl sm:text-9xl mb-8">📡</div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
          لا يوجد اتصال بالإنترنت
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
          يبدو أنك غير متصل بالإنترنت حالياً
        </p>
        
        {/* Description */}
        <div className="bg-blue-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-blue-300 dark:border-yellow-500/30">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-yellow-400 mb-4">
            ما يمكنك فعله:
          </h2>
          <ul className="text-left text-gray-700 dark:text-gray-300 space-y-2">
            <li className="flex items-center gap-3">
              <span className="text-blue-600 dark:text-yellow-400">🔌</span>
              تحقق من اتصالك بالإنترنت
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-600 dark:text-yellow-400">🔄</span>
              أعد تحميل الصفحة
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-600 dark:text-yellow-400">⏰</span>
              انتظر قليلاً ثم حاول مرة أخرى
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-600 dark:text-yellow-400">📱</span>
              تحقق من إعدادات الشبكة
            </li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 dark:hover:from-yellow-600 dark:hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/40 dark:shadow-yellow-500/30 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            إعادة المحاولة
          </button>
          
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 dark:from-gray-700 dark:to-gray-800 text-white rounded-2xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/40 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            الصفحة الرئيسية
          </Link>
        </div>
        
        {/* Status */}
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>سيتم إعادة التوجيه تلقائياً عند عودة الاتصال</p>
        </div>
      </div>
    </div>
  );
}
