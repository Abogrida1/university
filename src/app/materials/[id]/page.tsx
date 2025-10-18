'use client';

import Link from 'next/link';
import { materialsService, pdfsService, videosService } from '@/lib/supabaseServiceFixed';
import PDFViewer from '@/components/PDFViewer';
import MaterialNavigation from '@/components/MaterialNavigation';
import VideoCard from '@/components/VideoCard';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MaterialPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string };
  searchParams: { program?: string; year?: string; term?: string };
}) {
  const materialId = params.id;
  const { program, year, term } = searchParams;
  
  try {
    // Optimized parallel data fetching with error handling
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden flex items-center justify-center px-4">
          {/* Golden Light Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="text-center relative z-10">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">📚</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">المادة غير موجودة</h1>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">المادة المطلوبة غير متاحة حالياً</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg sm:rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 text-sm sm:text-base"
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

  // No static data - use database only

  // PDFs will be loaded from database

  // Videos will be loaded from database

  // Use data from Supabase only
  const materialData = material;
  const pdfsData = materialPdfs;
  const videosData = materialVideos;

  if (!material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="text-8xl mb-8">❌</div>
            <h1 className="text-4xl font-black text-white mb-6">المادة غير موجودة</h1>
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

   return (
     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
       {/* Golden Light Effects */}
       <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 pointer-events-none"></div>
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
       <div className="container mx-auto px-4 pt-4 pb-10 relative z-10">
        {/* Navigation */}
        <MaterialNavigation 
          program={program}
          year={year}
          term={term}
          materialTitle={material.title}
        />

        {/* Material Header - Improved */}
        <div className="bg-gradient-to-br from-gray-800/80 to-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/30">
                <span className="text-xl" role="img" aria-label="book">📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white mb-1">{materialData.title}</h1>
                <p className="text-base text-gray-300 mb-1">{materialData.titleAr}</p>
                <p className="text-yellow-400 font-bold text-base">{materialData.code}</p>
              </div>
            </div>
            <div className="text-right bg-gray-700/50 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-yellow-400 font-bold text-base">Year {materialData.year}</div>
              <div className="text-sm text-gray-400">السنة {materialData.year}</div>
              <div className="text-gray-300 font-medium text-sm">{materialData.term}</div>
            </div>
          </div>
        </div>

        {/* Material Links Section - Improved */}
        {(materialData.bookLink || materialData.lecturesLink || materialData.googleDriveLink || materialData.additionalLinks) && !materialData.showGoogleDriveOnly && materialData.showMaterialLinksSection !== false && (
          <div className="bg-gradient-to-br from-gray-800/80 to-black/80 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border border-yellow-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <span className="text-yellow-400 font-bold text-lg">🔗</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Material Links</h2>
                <p className="text-sm text-gray-400">روابط مفيدة للمادة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Book Link */}
              {materialData.bookLink && (
                <a
                  href={materialData.bookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-400 text-xl">📖</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-yellow-300 transition-colors">Book</h3>
                      <p className="text-sm text-gray-400">كتاب المادة</p>
                    </div>
                  </div>
                </a>
              )}

              {/* Lectures Link */}
              {materialData.lecturesLink && (
                <a
                  href={materialData.lecturesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-400 text-xl">🎥</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-green-300 transition-colors">Lectures</h3>
                      <p className="text-sm text-gray-400">محاضرات المادة</p>
                    </div>
                  </div>
                </a>
              )}

              {/* Google Drive Link */}
              {materialData.googleDriveLink && (
                <a
                  href={materialData.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-400 text-xl">☁️</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-yellow-300 transition-colors">Google Drive</h3>
                      <p className="text-sm text-gray-400">ملفات Google Drive</p>
                    </div>
                  </div>
                </a>
              )}

              {/* Additional Links */}
              {materialData.additionalLinks && (() => {
                try {
                  const additionalLinks = JSON.parse(materialData.additionalLinks);
                  return additionalLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-gradient-to-r from-indigo-600/20 to-indigo-700/20 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-indigo-400 text-2xl">🔗</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{link.name}</h3>
                          <p className="text-sm text-gray-400">رابط إضافي</p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">انقر للوصول إلى {link.name}</p>
                    </a>
                  ));
                } catch (error) {
                  return null;
                }
              })()}
            </div>
          </div>
        )}

        {/* Google Drive Section - Compact Design */}
        {materialData.showGoogleDriveOnly && materialData.googleDriveLink && (
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
                  href={materialData.googleDriveLink}
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

        {/* PDFs Section - Improved */}
        {!materialData.showGoogleDriveOnly && materialData.showPdfsSection !== false && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                <span className="text-red-400 font-bold text-lg">📄</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Material</h2>
                <p className="text-sm text-gray-400">المواد الدراسية</p>
              </div>
            </div>
             <span className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full font-bold border border-red-500/30 text-sm">
               {pdfsData.length} PDF Files
             </span>
          </div>

          {pdfsData.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <div className="text-6xl sm:text-7xl md:text-8xl mb-6 sm:mb-8">📝</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">لا توجد ملفات PDF</h3>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">لا توجد ملفات PDF متاحة لهذه المادة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {pdfsData.map((pdf: any) => (
                <PDFViewer
                  key={pdf.id}
                  pdfUrl={pdf.file_url || '#'}
                  fileName={pdf.file_name || pdf.title}
                  title={pdf.title}
                />
              ))}
            </div>
          )}
        </div>
        )}

        {/* Videos Section - Improved */}
        {!materialData.showGoogleDriveOnly && materialData.showVideosSection !== false && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                <span className="text-yellow-400 font-bold text-lg">🎥</span>
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Video Lectures</h2>
                <p className="text-sm text-gray-400">شرح الفيديوهات</p>
              </div>
            </div>
             <span className="bg-yellow-500/20 text-blue-300 px-4 py-2 rounded-full font-bold border border-yellow-500/30 text-sm">
               {videosData.length} {videosData.some((v: any) => v.is_playlist) ? 'Playlist' : 'Videos'}
               {videosData.some((v: any) => v.is_playlist) && (
                 <span className="text-sm text-blue-200 ml-1">
                   (متعدد الفيديوهات)
                 </span>
               )}
             </span>
          </div>

          {videosData.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-8">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-4">لا توجد فيديوهات</h3>
              <p className="text-gray-400 text-lg">لا توجد فيديوهات متاحة لهذه المادة بعد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {videosData.map((video: any, index: number) => {
                // Separate regular videos from playlists
                if (video.is_playlist) {
                  // Keep original design for playlists
                  return (
                    <div key={video.id} className="group bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-blue-500/50 hover:bg-gray-700/50 transition-all duration-300">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Video Embed */}
                        <div className="lg:col-span-2">
                          <div className="relative w-full h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
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
                          
                          {/* Playlist Info */}
                          <div className="mt-3 p-3 bg-blue-500/10 border border-yellow-500/30 rounded-lg">
                            <p className="text-blue-300 text-sm text-center">
                              📺 هذا playlist يحتوي على عدة فيديوهات - استخدم أزرار التحكم للتنقل
                            </p>
                          </div>
                        </div>
                        
                        {/* Video Info */}
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">{video.title}</h3>
                              <span className="bg-yellow-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                                📺 Playlist
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center justify-between">
                              <span>النوع:</span>
                              <span className="text-white font-medium">Playlist</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>تاريخ الرفع:</span>
                              <span className="text-white font-medium">{video.uploadedAt}</span>
                            </div>
                          </div>
                          
                          <div className="pt-4">
                            <a
                              href={video.playlist_url || `https://www.youtube.com/playlist?list=${video.playlist_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
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
                  // New design for regular videos - numbered rectangles
                  return <VideoCard key={video.id} video={video} index={index + 1} />;
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
          {/* Golden Light Effects */}
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
}
