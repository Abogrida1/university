export default function Footer() {
  return (
    <footer className="hidden lg:block bg-black/95 backdrop-blur-sm border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8">
          {/* Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <img 
                src="/assets/icons/main-icon.png" 
                alt="University Materials" 
                className="w-6 h-6 sm:w-7 sm:h-7"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-1">University Materials</h3>
              <p className="text-sm sm:text-base text-gray-300 font-semibold">طلاب جامعة الزقازيق</p>
            </div>
          </div>
          
          {/* Links */}
          <div className="flex items-center space-x-8 sm:space-x-10">
            <a href="/" className="inline-flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 text-sm sm:text-base font-semibold hover:scale-105 group">
              <svg className="w-4 h-4 group-hover:text-yellow-400 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              الرئيسية
            </a>
            <a href="/about" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 text-sm sm:text-base font-semibold hover:scale-105">
              من نحن
            </a>
            <a href="/contact" className="inline-flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 text-sm sm:text-base font-semibold hover:scale-105 group">
              <svg className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              تواصل معنا
            </a>
            <a href="/auth/register" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 text-sm sm:text-base font-semibold hover:scale-105">
              إنشاء حساب
            </a>
          </div>
          
          {/* Copyright */}
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-2 text-yellow-400 text-sm sm:text-base font-semibold">
              <span>© 2025 University Materials. جميع الحقوق محفوظة.</span>
              <svg className="w-5 h-5 text-yellow-400 animate-pulse drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24" style={{filter: 'drop-shadow(0 0 8px #fbbf24)'}}>
                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
