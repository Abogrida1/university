export default function Footer() {
  return (
    <footer className="hidden lg:block bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 sm:gap-6">
          {/* Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-md sm:rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">📚</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">University Materials</h3>
              <p className="text-xs text-gray-400">جامعة الزقازيق</p>
            </div>
          </div>
          
          {/* Links */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <a href="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              الرئيسية
            </a>
            <a href="/about" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-medium">
              من نحن
            </a>
            <a href="/contact" className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm font-medium">
              <img 
                src="/assets/icons/chat.png" 
                alt="تواصل معنا" 
                className="w-3 h-3"
              />
              تواصل معنا
            </a>
            <a href="/auth/register" className="text-gray-400 hover:text-emerald-400 transition-colors text-xs sm:text-sm font-medium">
              إنشاء حساب
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center lg:text-right">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2024 University Materials. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
