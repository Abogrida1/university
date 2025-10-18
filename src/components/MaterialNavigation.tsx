'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  
  const handleBackToMaterials = () => {
    console.log('🔄 Back to materials clicked');
    if (program && year && term) {
      console.log('📍 Using current selection:', { program, year, term });
      router.push(`/?program=${program}&year=${year}&term=${term}`);
    } else {
      // Try to get from localStorage
      const savedSelection = localStorage.getItem('lastMaterialSelection');
      if (savedSelection) {
        try {
          const { program: savedProgram, year: savedYear, term: savedTerm } = JSON.parse(savedSelection);
          console.log('📍 Using saved selection:', { savedProgram, savedYear, savedTerm });
          router.push(`/?program=${savedProgram}&year=${savedYear}&term=${savedTerm}`);
        } catch (error) {
          console.log('❌ Error parsing saved selection, going to home');
          router.push('/');
        }
      } else {
        console.log('📍 No saved selection, going to home');
        router.push('/');
      }
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        {/* Back to Materials Button - Top Left */}
        <button
          type="button"
          onClick={handleBackToMaterials}
          className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg sm:rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30 text-sm sm:text-base cursor-pointer relative z-20"
          style={{ pointerEvents: 'auto' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة للمواد
        </button>

        {/* Home Link - Top Right */}
        <button
          type="button"
          onClick={() => {
            console.log('🏠 Home button clicked');
            // Clear any saved selection when going to home
            if (typeof window !== 'undefined') {
              localStorage.removeItem('lastMaterialSelection');
            }
            router.push('/');
          }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-white hover:text-yellow-400 transition-colors font-medium text-sm sm:text-base cursor-pointer relative z-20"
          style={{ pointerEvents: 'auto' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          الرئيسية
        </button>
      </div>

    </>
  );
}
