'use client';

import { useState } from 'react';

interface VideoCardProps {
  video: any;
  index: number;
}

export default function VideoCard({ video, index }: VideoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = () => {
    if (!isExpanded) {
      setIsLoading(true);
      // Faster loading for better performance
      setTimeout(() => {
        setIsLoading(false);
        setIsExpanded(true);
      }, 100);
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <div className="group bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700/30 dark:to-gray-800/30 backdrop-blur-sm rounded-2xl border-2 border-blue-300 dark:border-gray-600/30 hover:border-blue-500 dark:hover:border-yellow-500/50 hover:shadow-lg hover:shadow-blue-500/20 dark:hover:bg-gray-700/50 transition-all duration-300 overflow-hidden">
      {/* Video Header - Always Visible */}
      <div 
        className="p-6 cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-4">
          {/* Number Badge */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
            <span className="text-white font-bold text-lg">{index}</span>
          </div>
          
          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors mb-2 truncate">
              {video.title}
            </h3>
            <div className="text-base text-slate-600 dark:text-gray-400">
              <span className="text-sm text-slate-500 dark:text-gray-500">{video.uploadedAt}</span>
            </div>
          </div>
          
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-200 dark:bg-gray-600/50 hover:bg-blue-300 dark:hover:bg-gray-600/70 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-blue-300 dark:group-hover:bg-blue-500/20 group-hover:border-2 group-hover:border-blue-500 dark:group-hover:border dark:group-hover:border-blue-500/30">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-blue-700 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg 
                  className={`w-5 h-5 text-blue-700 dark:text-gray-400 group-hover:text-blue-800 dark:group-hover:text-blue-400 transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Embed - Only when expanded */}
      {isExpanded && (
        <div className="border-t-2 border-blue-300 dark:border-gray-600/30 bg-blue-50 dark:bg-gray-800/30">
          <div className="p-6">
            <div className="relative w-full h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl mb-4 border-2 border-blue-300 dark:border-gray-700">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=0&rel=0&modestbranding=1&showinfo=1&enablejsapi=1`}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder="0"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <a
                href={video.youtube_url || `https://www.youtube.com/watch?v=${video.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-3 px-4 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/40 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>مشاهدة على يوتيوب</span>
              </a>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-3 bg-blue-200 dark:bg-gray-600/50 hover:bg-blue-300 dark:hover:bg-gray-600/70 text-slate-900 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">إغلاق</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
