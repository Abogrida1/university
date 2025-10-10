'use client';

import Link from 'next/link';

interface MaterialNavigationProps {
  program?: string;
  year?: string;
  term?: string;
  materialTitle: string;
}

export default function MaterialNavigation({ 
  program, 
  year, 
  term, 
  materialTitle 
}: MaterialNavigationProps) {
  const handleBackToMaterials = () => {
    if (program && year && term) {
      window.location.href = `/?program=${program}&year=${year}&term=${term}`;
    } else {
      // Try to get from localStorage
      const savedSelection = localStorage.getItem('lastMaterialSelection');
      if (savedSelection) {
        try {
          const { program: savedProgram, year: savedYear, term: savedTerm } = JSON.parse(savedSelection);
          window.location.href = `/?program=${savedProgram}&year=${savedYear}&term=${savedTerm}`;
        } catch (error) {
          window.location.href = '/';
        }
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        {/* Back to Materials Button - Top Left */}
        <button
          onClick={handleBackToMaterials}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 text-sm sm:text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة للمواد
        </button>

        {/* Home Link - Top Right */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-300 hover:text-cyan-400 transition-colors font-medium text-sm sm:text-base"
          onClick={() => {
            // Clear any saved selection when going to home
            if (typeof window !== 'undefined') {
              localStorage.removeItem('lastMaterialSelection');
            }
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          الرئيسية
        </Link>
      </div>

      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8">
        <ol className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-400">
          <li>
            <Link 
              href="/" 
              className="hover:text-cyan-400 transition-colors"
              onClick={() => {
                // Clear any saved selection when going to home
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('lastMaterialSelection');
                }
              }}
            >
              الرئيسية
            </Link>
          </li>
          <li className="text-gray-600">/</li>
          <li>
            <button 
              onClick={handleBackToMaterials}
              className="hover:text-cyan-400 transition-colors"
            >
              المواد
            </button>
          </li>
          <li className="text-gray-600">/</li>
          <li className="text-cyan-400 font-medium">{materialTitle}</li>
        </ol>
      </nav>
    </>
  );
}
