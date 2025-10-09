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
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl mb-8 shadow-2xl shadow-cyan-500/25">
            <span className="text-4xl">🎓</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            من نحن
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            منصة المواد الدراسية الرائدة لطلاب كلية الحاسبات والمعلومات - جامعة الزقازيق
          </p>
        </div>

        {/* About Content */}
        <div className="mb-16">
          <style jsx>{`
            @keyframes blink {
              50% { border-color: transparent; }
            }
          `}</style>
          <section style={{fontFamily: 'Cairo, sans-serif', direction: 'rtl', textAlign: 'right', background: 'linear-gradient(135deg, #1e293b, #334155)', padding: '60px 20px'}}>
            <div style={{maxWidth: '900px', margin: '0 auto', background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '25px', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', border: '1px solid rgba(148, 163, 184, 0.2)', padding: '50px 40px'}}>
              
              <h2 style={{textAlign: 'center', fontSize: '2.5rem', color: '#06b6d4', marginBottom: '30px', background: 'linear-gradient(45deg, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                من نحن
              </h2>

              <div 
                id="typing" 
                style={{
                  fontSize: '1.2rem',
                  lineHeight: '2',
                  whiteSpace: 'pre-wrap',
                  borderRight: '3px solid #06b6d4',
                  paddingRight: '5px',
                  animation: 'blink 0.7s infinite',
                  color: '#e2e8f0'
                }}
              >
                {displayedText}
              </div>

              <div style={{textAlign: 'center', marginTop: '40px'}}>
                <hr style={{width: '60px', border: '2px solid #06b6d4', borderRadius: '5px', marginBottom: '15px'}}/>
                <p style={{fontSize: '1rem', color: '#94a3b8'}}>
                  ❤️ صُنع بحب من طلاب الأمن السيبراني – جامعة الزقازيق
                </p>
              </div>
              
            </div>
          </section>
        </div>


        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">انضم إلينا اليوم</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            ابدأ رحلتك التعليمية معنا واحصل على أفضل تجربة في الوصول للمواد الدراسية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
            >
              إنشاء حساب جديد
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
