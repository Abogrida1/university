'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const fullText = `نحن مجموعة من طلاب كلية الحاسبات والمعلومات – جامعة الزقازيق، قسم الأمن السيبراني.

جمعنا الشغف بالتكنولوجيا والرغبة في إفادة زملائنا، فأنشأنا هذا الموقع ليكون منصة آمنة وسهلة الاستخدام تساعد جميع طلاب الكلية.

يهدف موقعنا إلى تسهيل الوصول إلى المذكرات، وملفات الـ PDF، والمواد الدراسية بطريقة منظمة وآمنة، تجعل المذاكرة أسهل والتعاون أجمل.

نؤمن أن المشاركة هي مفتاح النجاح، لذلك نسعى لبناء مجتمع طلابي متعاون يدعم بعضه البعض من أجل مستقبل أفضل.

💬 "بدأنا كمجموعة شباب من الكلية، وهدفنا نساعد ونفيد كل زملائنا."`;
  
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 40); // سرعة الكتابة
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 lg:mb-8 shadow-2xl shadow-cyan-500/25">
            <span className="text-2xl sm:text-3xl lg:text-4xl">🎓</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            من نحن
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            منصة المواد الدراسية الرائدة لطلاب كلية الحاسبات والمعلومات - جامعة الزقازيق
          </p>
        </div>

        {/* About Content */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <style jsx>{`
            @keyframes blink {
              50% { border-color: transparent; }
            }
          `}</style>
          <section className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-600/30">
            <div className="max-w-4xl mx-auto">
              
              <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 mb-6 sm:mb-8" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                من نحن
              </h2>

              <div 
                id="typing" 
                className="text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose whitespace-pre-wrap border-r-2 border-cyan-400 pr-2 text-gray-200"
                style={{
                  fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif',
                  direction: 'rtl',
                  textAlign: 'right'
                }}
              >
                {displayedText}
              </div>

              <div className="text-center mt-6 sm:mt-8 lg:mt-10">
                <hr className="w-12 sm:w-16 border-2 border-cyan-400 rounded mx-auto mb-3 sm:mb-4"/>
                <p className="text-sm sm:text-base text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
                  ❤️ صُنع بحب من طلاب الأمن السيبراني – جامعة الزقازيق
                </p>
              </div>
              
            </div>
          </section>
        </div>


        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            انضم إلينا اليوم
          </h2>
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            ابدأ رحلتك التعليمية معنا واحصل على أفضل تجربة في الوصول للمواد الدراسية
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link
              href="/auth/register"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 w-full sm:w-auto"
              style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
            >
              إنشاء حساب جديد
            </Link>
            <Link
              href="/contact"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto"
              style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
