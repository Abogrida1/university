import Link from 'next/link';
import { materialsService, pdfsService, videosService } from '@/lib/supabaseServiceFixed';
import PDFViewer from '@/components/PDFViewer';
import MaterialNavigation from '@/components/MaterialNavigation';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

// Generate static params (required for Next.js)
export async function generateStaticParams() {
  // Return empty array to avoid Supabase connection during build
  // Dynamic routes will be generated on-demand
  return [];
}

export default async function MaterialPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string };
  searchParams: { program?: string; year?: string; term?: string };
}) {
  const materialId = params.id;
  const { program, year, term } = searchParams;
  
  console.log('🔍 Material page searchParams:', { program, year, term });
  
  try {
    // Fetch data from Supabase
    const [material, materialPdfs, materialVideos] = await Promise.all([
      materialsService.getById(materialId),
      pdfsService.getByMaterialId(materialId),
      videosService.getByMaterialId(materialId)
    ]);

    if (!material) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">📚</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">المادة غير موجودة</h1>
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">المادة المطلوبة غير متاحة حالياً</p>
            <Link 
              href="/" 
              className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg sm:rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 text-sm sm:text-base"
            >
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="text-8xl mb-8">❌</div>
            <h1 className="text-4xl font-black text-white mb-6">المادة غير موجودة</h1>
            <Link href="/" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-10">
        {/* Navigation */}
        <MaterialNavigation 
          program={program}
          year={year}
          term={term}
          materialTitle={material.title}
        />

        {/* Material Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 md:mb-10 shadow-2xl border border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 sm:mb-8 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <span className="text-2xl sm:text-3xl">📚</span>
                </div>
                <div>
                 <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">{materialData.title}</h1>
                 <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-2">{materialData.titleAr}</p>
                 <p className="text-lg sm:text-xl md:text-2xl text-cyan-400 font-bold">{materialData.code}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-2">{materialData.department}</p>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{materialData.departmentAr}</p>
            </div>
            <div className="text-right bg-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-600/50">
              <div className="text-cyan-400 font-bold text-base sm:text-lg mb-2">Year {materialData.year}</div>
              <div className="text-xs sm:text-sm text-gray-500 mb-2">السنة {materialData.year}</div>
              <div className="text-gray-300 font-medium text-sm sm:text-base">{materialData.term}</div>
              <div className="text-sm text-gray-500">{materialData.termAr}</div>
            </div>
          </div>
        </div>

        {/* Material Links Section */}
        {(materialData.bookLink || materialData.lecturesLink || materialData.googleDriveLink || materialData.additionalLinks) && !materialData.showGoogleDriveOnly && materialData.showMaterialLinksSection !== false && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 mb-10 shadow-2xl border border-gray-700/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                <span className="text-yellow-400 font-bold text-xl">🔗</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Material Links</h2>
                <p className="text-sm text-gray-400">روابط مفيدة للمادة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Book Link */}
              {materialData.bookLink && (
                <a
                  href={materialData.bookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-blue-600/20 to-blue-700/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-blue-400 text-2xl">📖</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Book</h3>
                      <p className="text-sm text-gray-400">كتاب المادة</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">انقر للوصول إلى كتاب المادة</p>
                </a>
              )}

              {/* Lectures Link */}
              {materialData.lecturesLink && (
                <a
                  href={materialData.lecturesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-green-400 text-2xl">🎥</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-green-300 transition-colors">Lectures</h3>
                      <p className="text-sm text-gray-400">محاضرات المادة</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">انقر للوصول إلى محاضرات المادة</p>
                </a>
              )}

              {/* Google Drive Link */}
              {materialData.googleDriveLink && (
                <a
                  href={materialData.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-yellow-400 text-2xl">☁️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors">Google Drive</h3>
                      <p className="text-sm text-gray-400">ملفات Google Drive</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">انقر للوصول إلى ملفات Google Drive</p>
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
                      className="group bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <span className="text-purple-400 text-2xl">🔗</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{link.name}</h3>
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
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
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
                  className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-2"
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
        {!materialData.showGoogleDriveOnly && materialData.showPdfsSection !== false && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 mb-6 sm:mb-8 md:mb-10 shadow-2xl border border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-red-500/30">
                <span className="text-red-400 font-bold text-lg sm:text-xl">📄</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">Material</h2>
                <p className="text-xs sm:text-sm text-gray-400">المواد الدراسية</p>
              </div>
            </div>
             <span className="bg-red-500/20 text-red-300 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold border border-red-500/30 text-xs sm:text-sm">
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

        {/* Videos Section */}
        {!materialData.showGoogleDriveOnly && materialData.showVideosSection !== false && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-gray-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-blue-500/30">
                <span className="text-blue-400 font-bold text-lg sm:text-xl">🎥</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">Video Lectures</h2>
                <p className="text-xs sm:text-sm text-gray-400">شرح الفيديوهات</p>
              </div>
            </div>
             <span className="bg-blue-500/20 text-blue-300 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold border border-blue-500/30 text-xs sm:text-sm">
               {videosData.length} {videosData.some((v: any) => v.is_playlist) ? 'Playlist' : 'Videos'}
               {videosData.some((v: any) => v.is_playlist) && (
                 <span className="text-xs text-blue-200 ml-1">
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
            <div className="space-y-8">
              {videosData.map((video: any) => {
                console.log('🎥 Video data:', {
                  id: video.id,
                  title: video.title,
                  is_playlist: video.is_playlist,
                  playlist_id: video.playlist_id,
                  playlist_url: video.playlist_url,
                  youtube_id: video.youtube_id
                });
                
                // Log playlist embed URL for debugging
                if (video.is_playlist && video.playlist_id) {
                  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${video.playlist_id}&autoplay=0&rel=0&modestbranding=1&showinfo=1&controls=1&loop=1&playlist=${video.playlist_id}`;
                  console.log('📺 Playlist embed URL:', embedUrl);
                }
                
                return (
                <div key={video.id} className="group bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-blue-500/50 hover:bg-gray-700/50 transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Embed */}
                    <div className="lg:col-span-2">
                      <div className="relative w-full h-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl">
                        {video.is_playlist && video.playlist_id ? (
                          <>
                            <iframe
                              src={`https://www.youtube.com/embed/videoseries?list=${video.playlist_id}&autoplay=0&rel=0&modestbranding=1&showinfo=1&controls=1&loop=1&playlist=${video.playlist_id}`}
                              title={video.title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                              frameBorder="0"
                              loading="lazy"
                            ></iframe>
                            {/* Fallback for playlist */}
                            <div className="absolute inset-0 bg-gray-800/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <div className="text-center">
                                <p className="text-white text-sm mb-3">إذا لم يعمل الـ Playlist</p>
                                <a
                                  href={video.playlist_url || `https://www.youtube.com/playlist?list=${video.playlist_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors duration-300 flex items-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                  فتح Playlist على YouTube
                                </a>
                              </div>
                            </div>
                          </>
                        ) : (
                        <iframe
                            src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=0&rel=0&modestbranding=1&showinfo=1`}
                          title={video.title}
                          className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                            frameBorder="0"
                        ></iframe>
                        )}
                      </div>
                      
                      {/* Playlist Info */}
                      {video.is_playlist && video.playlist_id && (
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm text-center">
                            📺 هذا playlist يحتوي على عدة فيديوهات - استخدم أزرار التحكم للتنقل
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{video.title}</h3>
                          {video.is_playlist && (
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
                              📺 Playlist
                            </span>
                          )}
                        </div>
                        
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>المدة:</span>
                          <span className="text-white font-medium">
                            {video.is_playlist ? 'Playlist' : video.duration}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>المشاهدات:</span>
                          <span className="text-white font-medium">
                            {video.is_playlist ? 'متعدد' : (video.views?.toLocaleString() || '0')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>تاريخ الرفع:</span>
                          <span className="text-white font-medium">{video.uploadedAt}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <a
                          href={video.is_playlist && video.playlist_url 
                            ? video.playlist_url 
                            : (video.youtube_url || `https://www.youtube.com/watch?v=${video.youtube_id}`)
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-3 px-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="hidden sm:inline">مشاهدة على يوتيوب</span>
                          <span className="sm:hidden">مشاهدة</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                );
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-4xl font-bold text-white mb-4">خطأ في تحميل الصفحة</h1>
          <p className="text-gray-300 mb-6">حدث خطأ أثناء تحميل بيانات المادة</p>
          <Link 
            href="/" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }
}
