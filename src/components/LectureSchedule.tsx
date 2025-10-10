'use client';

import React, { useState, useEffect } from 'react';
import { CourseSchedule, courseService } from '@/lib/courseService';
import { schedulesService, Schedule } from '@/lib/schedulesService';
import { UserProfile } from '@/lib/types';

interface LectureScheduleProps {
  user: UserProfile | null;
  departmentOverride?: string;
  yearOverride?: number;
  termOverride?: 'FIRST' | 'SECOND';
  refreshTrigger?: number; // إضافة trigger للتحديث
}

export default function LectureSchedule({ user, departmentOverride, yearOverride, termOverride, refreshTrigger }: LectureScheduleProps) {
  const [courses, setCourses] = useState<CourseSchedule[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const effectiveDepartment = departmentOverride || user?.department;
  const effectiveYear = typeof yearOverride === 'number' ? yearOverride : user?.year;
  const effectiveTerm = termOverride || user?.term;
  
  // تحويل term إلى التنسيق الصحيح للقاعدة
  const normalizedTerm = effectiveTerm === 'FIRST' || effectiveTerm === 'First Semester' ? 'FIRST' : 'SECOND';

  useEffect(() => {
    const loadCourses = async () => {
      if (!effectiveDepartment || !effectiveYear || !effectiveTerm) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Loading courses and schedule...', { effectiveDepartment, effectiveYear, effectiveTerm, refreshTrigger });
        
        const userCourses = await courseService.getCoursesByCriteria(
          effectiveDepartment,
          effectiveYear as number,
          effectiveTerm as 'FIRST' | 'SECOND'
        );
        
        setCourses(userCourses);

        // Also try to load PDF schedule for this cohort
        const cohortSchedule = await schedulesService.getByCriteria(
          effectiveDepartment,
          effectiveYear as number,
          normalizedTerm as 'FIRST' | 'SECOND'
        );
        console.log('📅 Loaded schedule:', cohortSchedule);
        setSchedule(cohortSchedule);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('خطأ في تحميل جدول المحاضرات');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [effectiveDepartment, effectiveYear, effectiveTerm, normalizedTerm, refreshTrigger]);

  if (!effectiveDepartment || !effectiveYear || !effectiveTerm) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-3xl p-8 max-w-6xl mx-auto border border-blue-500/30 shadow-2xl shadow-blue-500/20 mb-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-300 text-lg">جاري تحميل جدول المحاضرات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-900/30 via-pink-900/30 to-rose-900/30 backdrop-blur-sm rounded-3xl p-8 max-w-6xl mx-auto border border-red-500/30 shadow-2xl shadow-red-500/20 mb-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-white mb-4">خطأ في التحميل</h3>
          <p className="text-red-300 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0 && !schedule) {
    return (
      <div className="bg-gradient-to-r from-yellow-900/30 via-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-3xl p-8 max-w-6xl mx-auto border border-yellow-500/30 shadow-2xl shadow-yellow-500/20 mb-8">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📅</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">جدول المحاضرات غير متاح</h3>
          <p className="text-yellow-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">
            لم يتم إعداد جدول المحاضرات للقسم والسنة والترم المحدد بعد
          </p>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 max-w-md mx-auto">
            <p className="text-yellow-300 text-xs sm:text-sm font-medium">
              💡 سيتم إضافة جدول المحاضرات قريباً من قبل الإدارة
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If an official PDF schedule exists, render controls with optional preview
  if (schedule) {
    console.log('📅 Rendering schedule with fileUrl:', {
      hasFileUrl: !!schedule.fileUrl,
      fileUrlLength: schedule.fileUrl ? schedule.fileUrl.length : 0,
      fileName: schedule.fileName,
      size: schedule.size
    });
    
    return (
      <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-6xl mx-auto border border-blue-500/30 shadow-2xl shadow-blue-500/20 mb-6 sm:mb-8">
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📅</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">جدول المحاضرات (PDF)</h2>
          <p className="text-blue-300 text-sm sm:text-base md:text-lg">
            {effectiveDepartment} - السنة {effectiveYear} - {effectiveTerm === 'FIRST' ? 'الترم الأول' : 'الترم الثاني'}
          </p>
          {schedule.size && (
            <p className="text-xs sm:text-sm text-blue-300 mt-2">الحجم: {schedule.size}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
          {schedule.fileUrl && (
            <>
              {/* Preview button - hidden on mobile only */}
              <button
                type="button"
                onClick={() => setShowPreview(prev => !prev)}
                className="hidden md:flex bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 items-center gap-2 text-sm sm:text-base"
                title={showPreview ? 'إخفاء المعاينة' : 'معاينة الجدول'}
              >
                {showPreview ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
                {showPreview ? 'إخفاء المعاينة' : 'معاينة الجدول'}
              </button>
              
              {/* Download button - responsive design */}
              <a
                href={schedule.fileUrl}
                download={schedule.fileName || 'schedule.pdf'}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 text-center text-sm sm:text-base"
                title="تحميل الجدول"
                onClick={() => {
                  console.log('📥 Downloading schedule:', {
                    fileName: schedule.fileName,
                    fileUrl: schedule.fileUrl ? `${schedule.fileUrl.substring(0, 50)}...` : null,
                    hasFileUrl: !!schedule.fileUrl
                  });
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                تحميل الجدول
              </a>
            </>
          )}
        </div>

        {/* Optional Preview - hidden on mobile */}
        {showPreview ? (
          schedule.fileUrl ? (
            <div className="hidden md:block w-full h-[80vh] bg-black/30 rounded-xl overflow-hidden border border-blue-500/30">
              {schedule.fileUrl.startsWith('data:') ? (
                // For Base64 URLs, use object tag
                <object
                  data={schedule.fileUrl}
                  type="application/pdf"
                  className="w-full h-full"
                  title={schedule.title}
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-gray-300 mb-4">لا يمكن عرض PDF في هذا المتصفح</p>
                      <a
                        href={schedule.fileUrl}
                        download={schedule.fileName || 'schedule.pdf'}
                        className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
                      >
                        تحميل PDF
                      </a>
                    </div>
                  </div>
                </object>
              ) : (
                // For regular URLs, use iframe
                <iframe
                  title={schedule.title}
                  src={schedule.fileUrl}
                  className="w-full h-full"
                />
              )}
            </div>
          ) : (
            <div className="hidden md:block text-center py-16">
              <p className="text-gray-300">لا يوجد ملف PDF مرفق</p>
            </div>
          )
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-3xl p-8 max-w-6xl mx-auto border border-blue-500/30 shadow-2xl shadow-blue-500/20 mb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-3xl font-bold text-white mb-4">جدول المحاضرات</h2>
        <p className="text-blue-300 text-lg">
          {effectiveDepartment} - السنة {effectiveYear} - {effectiveTerm === 'FIRST' ? 'الترم الأول' : 'الترم الثاني'}
        </p>
        <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 inline-block">
          <p className="text-blue-300 text-sm font-medium">
            📊 إجمالي المواد: {courses.length} مادة
          </p>
        </div>
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600/50 to-purple-600/50">
              <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">
                كود المادة
              </th>
              <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">
                اسم المادة
              </th>
              <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">
                القسم
              </th>
              <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">
                السنة
              </th>
              <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">
                الترم
              </th>
              <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr 
                key={course.id} 
                className={`hover:bg-white/10 transition-all duration-300 ${
                  index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'
                }`}
              >
                <td className="px-6 py-4 text-right text-white font-semibold border-b border-white/10">
                  <span className="bg-blue-500/30 px-3 py-1 rounded-lg text-sm">
                    {course.code}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-white border-b border-white/10">
                  <div>
                    <p className="font-semibold text-lg">{course.titleAr}</p>
                    <p className="text-gray-300 text-sm">{course.title}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-white border-b border-white/10">
                  <span className="bg-purple-500/30 px-3 py-1 rounded-lg text-sm">
                    {course.departmentAr}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-white border-b border-white/10">
                  <span className="bg-green-500/30 px-3 py-1 rounded-lg text-sm font-semibold">
                    السنة {course.year}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-white border-b border-white/10">
                  <span className="bg-orange-500/30 px-3 py-1 rounded-lg text-sm font-semibold">
                    {course.termAr}
                  </span>
                </td>
                <td className="px-6 py-4 text-center border-b border-white/10">
                  <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30">
                    عرض التفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-2">📚</div>
          <p className="text-green-300 font-semibold text-sm sm:text-base">إجمالي المواد</p>
          <p className="text-white text-xl sm:text-2xl font-bold">{courses.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-2">🏛️</div>
          <p className="text-blue-300 font-semibold text-sm sm:text-base">القسم</p>
          <p className="text-white text-base sm:text-lg font-bold">{effectiveDepartment}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-2">📅</div>
          <p className="text-purple-300 font-semibold text-sm sm:text-base">الترم</p>
          <p className="text-white text-base sm:text-lg font-bold">
            {effectiveTerm === 'FIRST' ? 'الترم الأول' : 'الترم الثاني'}
          </p>
        </div>
      </div>
    </div>
  );
}
