'use client';

import { useEffect, useState } from 'react';

export default function FirstVisitDisclaimer() {
  const [visible, setVisible] = useState(false);
  const [typingText, setTypingText] = useState('');

  const fullText = `⚠️ تحذير مهم ⚠️

🚫 ممنوع منعاً باتاً نشر أي محتوى داخل الموقع يخص الكلية
🚫 نشرك لهذا المحتوى يعرضك للمساءلة القانونية
🚫 ممنوع منعاً باتاً استخدام إيميلك الجامعي عند تسجيل الدخول في الموقع

📋 شروط الاستخدام:
• هذا الموقع غير رسمي ولا يتبع الجامعة
• جميع المحتويات مخصصة للاستخدام الشخصي فقط
• أي انتهاك للشروط يعرضك للمساءلة القانونية
• استخدامك للموقع يعني موافقتك على هذه الشروط

⚖️ تحذير قانوني:
نحن غير مسؤولين عن أي استخدام خاطئ للمحتوى أو انتهاك للقوانين.`;

  useEffect(() => {
    try {
      const seen = localStorage.getItem('first_visit_disclaimer_ack');
      if (!seen) {
        setVisible(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!visible) return;
    // typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      setTypingText(fullText.slice(0, i + 1));
      i += 1;
      if (i >= fullText.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      onClick={() => {/* click outside disabled to force reading */}}
    >
      <div className="relative w-full max-w-2xl bg-gray-900 text-white rounded-2xl sm:rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/95 sticky top-0">
          <h2 id="disclaimer-title" className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">⚠️ تحذير مهم</h2>
          {/* no close here to force read-to-accept */}
        </div>
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto leading-6 sm:leading-8 text-sm sm:text-base md:text-lg">
          <p className="whitespace-pre-wrap">{typingText}</p>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-800 bg-gray-900/95 sticky bottom-0">
          <div className="flex justify-center">
            <button
              onClick={() => {
                try { localStorage.setItem('first_visit_disclaimer_ack', '1'); } catch {}
                setVisible(false);
              }}
              className="w-full max-w-md bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl shadow-lg shadow-red-500/30 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg"
            >
              ⚖️ أوافق على الشروط
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

