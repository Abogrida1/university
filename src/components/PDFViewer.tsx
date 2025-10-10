'use client';

import { useState } from 'react';

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
  title: string;
}

export default function PDFViewer({ pdfUrl, fileName, title }: PDFViewerProps) {
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleDownload = () => {
    try {
      console.log('📥 Attempting to download PDF:', pdfUrl);
      
      if (!pdfUrl || pdfUrl === '#') {
        setError('رابط الملف غير متاح');
        return;
      }
      
      // إنشاء رابط تحميل للـ PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName || 'document.pdf';
      link.target = '_blank';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ PDF download initiated');
    } catch (err) {
      console.error('❌ Error downloading PDF:', err);
      setError('خطأ في تحميل الملف');
    }
  };


  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
        <div className="text-red-400 text-xs sm:text-sm mb-2">❌ خطأ في الملف</div>
        <p className="text-red-300 text-sm">{error}</p>
         <div className="flex gap-2 mt-3">
           <button
             onClick={handleDownload}
             className="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-600 text-white rounded-md sm:rounded-lg text-xs sm:text-sm hover:bg-red-700 transition-colors"
           >
             محاولة التحميل
           </button>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-800/70 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600/20 rounded-md sm:rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-xs sm:text-sm">{title}</h3>
            <p className="text-gray-400 text-xs">{fileName}</p>
          </div>
        </div>
        
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={togglePreview}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-600/20 text-purple-400 rounded-md sm:rounded-lg text-xs hover:bg-purple-600/30 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? 'إخفاء' : 'معاينة'}
          </button>
          
          <button
            onClick={handleDownload}
            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600/20 text-green-400 rounded-md sm:rounded-lg text-xs hover:bg-green-600/30 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            تحميل
          </button>
        </div>
      </div>
      
      {/* معاينة PDF */}
      {showPreview && (
        <div className="mt-3">
          {pdfUrl && pdfUrl.startsWith('data:') ? (
            <iframe
              src={pdfUrl}
              className="w-full h-64 rounded-lg border border-gray-700/50"
              onError={() => {
                setError('لا يمكن عرض الملف');
              }}
              title={title}
            />
          ) : (
            <div className="w-full h-64 bg-gray-700/30 rounded-lg border border-gray-700/50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 text-4xl mb-2">📄</div>
                <p className="text-gray-400 text-sm">معاينة غير متاحة</p>
                <p className="text-gray-500 text-xs mt-1">اضغط على "عرض" لفتح الملف</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}