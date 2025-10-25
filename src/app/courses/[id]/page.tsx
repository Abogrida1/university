import Link from 'next/link';
import { materialsService } from '@/lib/supabaseServiceFixed';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Generate static params (return empty to avoid build-time Supabase calls)
export async function generateStaticParams() {
  // Return empty array to avoid Supabase connection during build
  // Dynamic routes will be generated on-demand
  return [];
}

export default async function CoursePage({ params }: { params: { id: string } }) {
  const courseId = params.id;

  // Load course data from database
  const course = await materialsService.getById(courseId);

  // Materials will be loaded from database

  const courseMaterials = []; // Will be loaded from database

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Golden Light Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center">
            <div className="text-8xl mb-8">❌</div>
            <h1 className="text-4xl font-black text-white mb-6">الكورس غير موجود</h1>
            <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-2xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-black dark:to-gray-800 relative overflow-hidden">
      {/* Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 dark:from-yellow-500/5 dark:via-transparent dark:to-yellow-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-3 text-sm text-slate-700 dark:text-gray-400 font-medium">
            <li>
              <Link href="/" className="hover:text-blue-700 dark:hover:text-yellow-400 transition-colors inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                الرئيسية
              </Link>
            </li>
            <li className="text-slate-400 dark:text-gray-600">/</li>
            <li><Link href="/" className="hover:text-blue-700 dark:hover:text-yellow-400 transition-colors">الكورسات</Link></li>
            <li className="text-slate-400 dark:text-gray-600">/</li>
            <li className="text-blue-700 dark:text-yellow-400 font-bold">{course.title}</li>
          </ol>
        </nav>

        {/* Course Header */}
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-3xl p-10 mb-10 shadow-2xl border-2 border-blue-200 dark:border-yellow-500/30">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 dark:shadow-yellow-500/30">
                  <span className="text-3xl">📖</span>
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{course.title}</h1>
                  <p className="text-2xl text-blue-700 dark:text-yellow-400 font-bold">{course.code}</p>
                </div>
              </div>
              <p className="text-slate-700 dark:text-gray-300 text-lg mb-4 font-medium">{course.department}</p>
            </div>
            <div className="text-right bg-blue-100 dark:bg-gray-700/50 rounded-2xl p-6 border-2 border-blue-300 dark:border-gray-600/50">
              <div className="text-blue-700 dark:text-yellow-400 font-bold text-lg mb-2">السنة {course.year}</div>
              <div className="text-slate-700 dark:text-gray-300 font-medium">الفصل {course.term}</div>
            </div>
          </div>
        </div>

        {/* Course Links Section */}
        {(course.bookLink || course.lecturesLink || course.googleDriveLink || course.additionalLinks) && (
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-3xl p-10 mb-10 shadow-2xl border-2 border-blue-200 dark:border-yellow-500/30">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-yellow-500/20 rounded-2xl flex items-center justify-center border-2 border-blue-300 dark:border-yellow-500/30">
                <span className="text-blue-700 dark:text-yellow-400 font-bold text-xl">🔗</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Course Links</h2>
                <p className="text-sm text-slate-600 dark:text-gray-400">روابط مفيدة للكورس</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Book Link */}
              {course.bookLink && (
                <a
                  href={course.bookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-yellow-500/20 dark:to-yellow-600/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-300 dark:border-yellow-500/30 hover:border-blue-500 dark:hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-200 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-blue-700 dark:text-yellow-400 text-2xl">📖</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-800 dark:group-hover:text-yellow-300 transition-colors">Book</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">كتاب الكورس</p>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-gray-300 text-sm">انقر للوصول إلى كتاب الكورس</p>
                </a>
              )}

              {/* Lectures Link */}
              {course.lecturesLink && (
                <a
                  href={course.lecturesLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-purple-100 to-purple-200 dark:from-yellow-500/20 dark:to-yellow-600/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-300 dark:border-yellow-500/30 hover:border-purple-500 dark:hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-200 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-purple-700 dark:text-yellow-400 text-2xl">🎥</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-800 dark:group-hover:text-green-300 transition-colors">Lectures</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">محاضرات الكورس</p>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-gray-300 text-sm">انقر للوصول إلى محاضرات الكورس</p>
                </a>
              )}

              {/* Google Drive Link */}
              {course.googleDriveLink && (
                <a
                  href={course.googleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-cyan-100 to-sky-100 dark:from-yellow-600/20 dark:to-yellow-700/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-300 dark:border-yellow-500/30 hover:border-cyan-500 dark:hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-cyan-200 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-cyan-700 dark:text-yellow-400 text-2xl">☁️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-800 dark:group-hover:text-yellow-300 transition-colors">Google Drive</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">ملفات Google Drive</p>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-gray-300 text-sm">انقر للوصول إلى ملفات Google Drive</p>
                </a>
              )}

              {/* Additional Links */}
              {course.additionalLinks && (() => {
                try {
                  const additionalLinks = JSON.parse(course.additionalLinks);
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

        {/* Materials Section */}
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-blue-200 dark:border-yellow-500/30">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">المواد الدراسية</h2>
            <span className="bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-300 px-4 py-2 rounded-full font-bold border-2 border-blue-300 dark:border-cyan-500/30">
              {courseMaterials.length} مادة
            </span>
          </div>

          {courseMaterials.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-8">📝</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">لا توجد مواد متاحة</h3>
              <p className="text-slate-600 dark:text-gray-400 text-lg">لا توجد مواد متاحة لهذا الكورس بعد</p>
            </div>
          ) : (
            <div className="space-y-6">
              {courseMaterials.map((material: any) => (
                <div key={material.id} className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700/30 dark:to-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 dark:border-gray-600/30 hover:border-blue-500 dark:hover:border-yellow-500/50 hover:from-blue-100 hover:to-blue-200 dark:hover:from-gray-700/50 dark:hover:to-gray-800/50 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {material.type === 'PDF' ? (
                          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center border-2 border-red-300 dark:border-red-500/30 group-hover:bg-red-200 dark:group-hover:bg-red-500/30 transition-colors">
                            <span className="text-red-700 dark:text-red-400 font-bold text-xl">📄</span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-purple-100 dark:bg-yellow-500/20 rounded-2xl flex items-center justify-center border-2 border-purple-300 dark:border-yellow-500/30 group-hover:bg-purple-200 dark:group-hover:bg-blue-500/30 transition-colors">
                            <span className="text-purple-700 dark:text-yellow-400 font-bold text-xl">🎥</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-800 dark:group-hover:text-cyan-300 transition-colors">{material.title}</h3>
                        <div className="flex items-center space-x-6 text-sm text-slate-700 dark:text-gray-400">
                          <span className="bg-blue-100 dark:bg-gray-600/50 px-3 py-1 rounded-full font-medium">{material.type}</span>
                          <span>{material.size}</span>
                          <span>{material.downloads} تحميل</span>
                          <span>تم الرفع: {material.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
                      <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 dark:hover:from-cyan-600 dark:hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/40 dark:shadow-yellow-500/30 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        تحميل
                      </button>
                      {material.type === 'Video' && (
                        <button className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 dark:from-emerald-500 dark:to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 dark:hover:from-emerald-600 dark:hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 dark:shadow-emerald-500/30 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          مشاهدة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}