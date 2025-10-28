'use client';

import Link from 'next/link';
import { Suspense, lazy } from 'react';
import { materialsService, pdfsService, videosService } from '@/lib/supabaseServiceFixed';

// تحميل المكونات بشكل كسول (lazy loading)
const PDFViewer = lazy(() => import('@/components/PDFViewer'));
const MaterialNavigation = lazy(() => import('@/components/MaterialNavigation'));
const VideoCard = lazy(() => import('@/components/VideoCard'));

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// مكون تحميل سريع
const QuickLoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden">
    {/* Light Effects */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5 pointer-events-none"></div>
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
    
    <div className="container mx-auto px-4 pt-4 pb-10 relative z-10">
      {/* Navigation Skeleton */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 mb-6 animate-pulse">
        <div className="h-6 bg-blue-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>

      {/* Material Header Skeleton */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border-2 border-blue-300 dark:border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div>
              <div className="h-6 bg-blue-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-32 mb-1 animate-pulse"></div>
              <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-gray-700/50 rounded-lg p-4 border-2 border-blue-300 dark:border-yellow-500/30">
            <div className="h-4 bg-blue-200 dark:bg-gray-700 rounded w-16 mb-1 animate-pulse"></div>
            <div className="h-3 bg-blue-200 dark:bg-gray-700 rounded w-12 mb-1 animate-pulse"></div>
            <div className="h-3 bg-blue-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border-2 border-blue-300 dark:border-yellow-500/30">
          <div className="h-6 bg-blue-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-blue-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-blue-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-blue-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// مكون تحميل المحتوى الرئيسي
const MaterialContent = async ({ 
  materialId, 
  program, 
  year, 
  term 
}: { 
  materialId: string;
  program?: string;
  year?: string;
  term?: string;
}) => {
  try {
    // تحميل البيانات بشكل متوازي مع التخزين المؤقت
    const [material, materialPdfs, materialVideos] = await Promise.allSettled([
      materialsService.getById(materialId),
      pdfsService.getByMaterialId(materialId),
      videosService.getByMaterialId(materialId)
    ]).then(results => [
      results[0].status === 'fulfilled' ? results[0].value : null,
      results[1].status === 'fulfilled' ? results[1].value : [],
      results[2].status === 'fulfilled' ? results[2].value : []
    ]);

    if (!material) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden flex items-center justify-center px-4">
          {/* Light Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="text-center relative z-10">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">📚</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">المادة غير موجودة</h1>
            <p className="text-slate-700 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">المادة المطلوبة غير متاحة حالياً</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black rounded-lg sm:rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 dark:hover:from-yellow-600 dark:hover:to-yellow-700 transition-all duration-300 text-sm sm:text-base shadow-lg shadow-blue-500/30"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden">
        {/* Light Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5 pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 pt-4 pb-10 relative z-10">
          {/* Navigation */}
          <Suspense fallback={<div className="h-16 bg-blue-100 dark:bg-gray-800 rounded-xl animate-pulse mb-6"></div>}>
            <MaterialNavigation 
              program={program}
              year={year}
              term={term}
              materialTitle={material.title}
            />
          </Suspense>

          {/* Material Header */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border-2 border-blue-300 dark:border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-yellow-500/30">
                  <span className="text-xl" role="img" aria-label="book">📚</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{material.title}</h1>
                  <p className="text-base text-slate-700 dark:text-gray-300 mb-1">{material.titleAr}</p>
                  <p className="text-blue-700 dark:text-yellow-400 font-bold text-base">{material.code}</p>
                </div>
              </div>
              <div className="text-right bg-blue-100 dark:bg-gray-700/50 rounded-lg p-4 border-2 border-blue-300 dark:border-yellow-500/30">
                <div className="text-blue-700 dark:text-yellow-400 font-bold text-base">Year {material.year}</div>
                <div className="text-sm text-slate-600 dark:text-gray-400">السنة {material.year}</div>
                <div className="text-slate-700 dark:text-gray-300 font-medium text-sm">{material.term}</div>
              </div>
            </div>
          </div>

          {/* Material Links Section */}
          {(material.bookLink || material.lecturesLink || material.googleDriveLink || material.additionalLinks) && !material.showGoogleDriveOnly && material.showMaterialLinksSection !== false && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border-2 border-indigo-300 dark:border-yellow-500/30">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center border-2 border-blue-300 dark:border-yellow-500/30">
                  <span className="text-blue-700 dark:text-yellow-400 font-bold text-lg">🔗</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Material Links</h2>
                  <p className="text-sm text-slate-600 dark:text-gray-400">روابط مفيدة للمادة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Book Link */}
                {material.bookLink && (
                  <a
                    href={material.bookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-yellow-500/20 dark:to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-300 dark:border-yellow-500/30 hover:border-blue-500 dark:hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-200 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 dark:text-yellow-400 text-xl">📖</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-yellow-300 transition-colors">Book</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400">كتاب المادة</p>
                      </div>
                    </div>
                  </a>
                )}

                {/* Lectures Link */}
                {material.lecturesLink && (
                  <a
                    href={material.lecturesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-yellow-500/20 dark:to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 border-2 border-indigo-300 dark:border-yellow-500/30 hover:border-indigo-500 dark:hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-200 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-700 dark:text-yellow-400 text-xl">🎥</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-green-300 transition-colors">Lectures</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400">محاضرات المادة</p>
                      </div>
                    </div>
                  </a>
                )}

                {/* Google Drive Link */}
                {material.googleDriveLink && (
                  <a
                    href={material.googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-r from-cyan-100 to-sky-100 dark:from-yellow-600/20 dark:to-yellow-700/20 backdrop-blur-sm rounded-lg p-4 border-2 border-cyan-300 dark:border-yellow-500/30 hover:border-cyan-500 dark:hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-200 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-700 dark:text-yellow-400 text-xl">☁️</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-yellow-300 transition-colors">Google Drive</h3>
                        <p className="text-sm text-slate-600 dark:text-gray-400">ملفات Google Drive</p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Google Drive Section */}
          {material.showGoogleDriveOnly && material.googleDriveLink && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 mb-10 shadow-2xl border border-gray-700/50">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30">
                  <span className="text-cyan-400 font-bold text-xl">☁️</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">Google Drive</h2>
                  <p className="text-sm text-gray-400">جميع ملفات المادة</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl">📁</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">ملفات المادة الكاملة</h3>
                      <p className="text-gray-300 text-sm">PDFs، فيديوهات، ملاحظات، وتمارين</p>
                    </div>
                  </div>
                  
                  <a
                    href={material.googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30 flex items-center gap-2"
                  >
                    <span className="text-lg">☁️</span>
                    <span>فتح Drive</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* PDFs Section */}
          {!material.showGoogleDriveOnly && material.showPdfsSection !== false && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border-2 border-blue-300 dark:border-yellow-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-200 dark:bg-red-500/20 rounded-lg flex items-center justify-center border-2 border-blue-400 dark:border-red-500/30">
                    <span className="text-blue-700 dark:text-red-400 font-bold text-lg">📄</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Material</h2>
                    <p className="text-sm text-slate-700 dark:text-gray-400">المواد الدراسية</p>
                  </div>
                </div>
                <span className="bg-blue-200 dark:bg-red-500/20 text-blue-800 dark:text-red-300 px-4 py-2 rounded-full font-bold border-2 border-blue-400 dark:border-red-500/30 text-sm">
                  {materialPdfs.length} PDF Files
                </span>
              </div>

              {materialPdfs.length === 0 ? (
                <div className="text-center py-8 sm:py-12 md:py-16">
                  <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">📝</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">لا توجد ملفات PDF</h3>
                  <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">لا توجد ملفات PDF متاحة لهذه المادة بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {materialPdfs.map((pdf: any) => (
                    <Suspense key={pdf.id} fallback={<div className="bg-blue-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse h-32"></div>}>
                      <PDFViewer
                        pdfUrl={pdf.file_url || '#'}
                        fileName={pdf.file_name || pdf.title}
                        title={pdf.title}
                      />
                    </Suspense>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Videos Section */}
          {!material.showGoogleDriveOnly && material.showVideosSection !== false && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border-2 border-indigo-300 dark:border-yellow-500/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-200 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center border-2 border-indigo-400 dark:border-yellow-500/30">
                    <span className="text-indigo-700 dark:text-yellow-400 font-bold text-lg">🎥</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Video Lectures</h2>
                    <p className="text-sm text-slate-700 dark:text-gray-400">شرح الفيديوهات</p>
                  </div>
                </div>
                <span className="bg-indigo-200 dark:bg-yellow-500/20 text-indigo-800 dark:text-blue-300 px-4 py-2 rounded-full font-bold border-2 border-indigo-400 dark:border-yellow-500/30 text-sm">
                  {materialVideos.length} {materialVideos.some((v: any) => v.is_playlist) ? 'Playlist' : 'Videos'}
                  {materialVideos.some((v: any) => v.is_playlist) && (
                    <span className="text-sm text-indigo-700 dark:text-blue-200 ml-1">
                      (متعدد الفيديوهات)
                    </span>
                  )}
                </span>
              </div>

              {materialVideos.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-8">🎬</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">لا توجد فيديوهات</h3>
                  <p className="text-slate-600 dark:text-gray-400 text-lg">لا توجد فيديوهات متاحة لهذه المادة بعد</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {materialVideos.map((video: any, index: number) => {
                    if (video.is_playlist) {
                      return (
                        <div key={video.id} className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700/30 dark:to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-300 dark:border-gray-600/30 hover:border-purple-500 dark:hover:border-blue-500/50 hover:bg-purple-100 dark:hover:bg-gray-700/50 transition-all duration-300">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                              <div className="relative w-full h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl border-2 border-purple-300 dark:border-gray-700">
                                <iframe
                                  src={`https://www.youtube.com/embed/videoseries?list=${video.playlist_id}&autoplay=0&rel=0&modestbranding=1&showinfo=1&controls=1&loop=1&playlist=${video.playlist_id}&enablejsapi=1`}
                                  title={video.title}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  frameBorder="0"
                                  loading="lazy"
                                  referrerPolicy="strict-origin-when-cross-origin"
                                ></iframe>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-yellow-300 transition-colors">{video.title}</h3>
                                  <span className="bg-purple-200 dark:bg-yellow-500/20 text-purple-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium border-2 border-purple-300 dark:border-yellow-500/30">
                                    📺 Playlist
                                  </span>
                                </div>
                              </div>
                              <div className="pt-4">
                                <a
                                  href={video.playlist_url || `https://www.youtube.com/playlist?list=${video.playlist_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 dark:from-blue-500 dark:to-blue-600 text-white text-center py-3 px-4 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30 dark:shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="hidden sm:inline">مشاهدة Playlist</span>
                                  <span className="sm:hidden">مشاهدة</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <Suspense key={video.id} fallback={<div className="bg-indigo-100 dark:bg-gray-700 rounded-lg p-4 animate-pulse h-48"></div>}>
                          <VideoCard video={video} index={index + 1} />
                        </Suspense>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading material page:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="text-center relative z-10">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-4xl font-bold text-white mb-4">خطأ في تحميل الصفحة</h1>
          <p className="text-gray-300 mb-6">حدث خطأ أثناء تحميل بيانات المادة</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }
};

// الصفحة الرئيسية
export default async function MaterialPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string };
  searchParams: { program?: string; year?: string; term?: string };
}) {
  const materialId = params.id;
  const { program, year, term } = searchParams;

  return (
    <Suspense fallback={<QuickLoadingSkeleton />}>
      <MaterialContent 
        materialId={materialId}
        program={program}
        year={year}
        term={term}
      />
    </Suspense>
  );
}