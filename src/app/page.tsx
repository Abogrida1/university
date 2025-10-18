'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { materialsService, Material } from '@/lib/supabaseServiceFixed';
import { useUser } from '@/lib/UserContext';
import LectureSchedule from '@/components/LectureSchedule';
// Diagnostics removed - using fixed service

type ProgramKey = 'General' | 'Cyber Security' | 'Artificial Intelligence';

export default function HomePage() {
  const { user } = useUser();
  const [program, setProgram] = useState<ProgramKey | ''>('');
  const [year, setYear] = useState<number | ''>('');
  const [term, setTerm] = useState<'FIRST' | 'SECOND' | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(0);

  console.log('🏠 HomePage component loaded');

  // Check if user needs to go to welcome page - فقط إذا كان المستخدم موجود ونشط وله بيانات أكاديمية
  useEffect(() => {
    if (user && user.is_active && user.department && user.year && user.term) {
      const emailPrefix = user.email?.split('@')[0] || '';
      const isNewUser = !user.name || 
                       user.name === emailPrefix || 
                       user.name === user.email ||
                       user.name.length < 3;
      
      console.log('=== HOME PAGE USER CHECK ===');
      console.log('User:', user);
      console.log('User name:', user.name);
      console.log('Email prefix:', emailPrefix);
      console.log('Is new user:', isNewUser);
      console.log('Is active:', user.is_active);
      console.log('Has academic data:', !!(user.department && user.year && user.term));
      console.log('============================');
      
      if (isNewUser) {
        console.log('New user detected, redirecting to welcome page...');
        // تأخير قليل لتجنب التوجيه السريع
        setTimeout(() => {
          window.location.href = '/welcome';
        }, 500);
      }
    } else if (user && (!user.is_active || !user.department || !user.year || !user.term)) {
      console.log('Invalid user detected, redirecting to register page...');
      // توجيه المستخدم غير النشط أو بدون بيانات أكاديمية لصفحة إنشاء الحساب
      setTimeout(() => {
        window.location.href = '/auth/register?step=1&google=true';
      }, 500);
    }
  }, [user]);

  // Get unique departments from materials
  const getUniqueDepartments = () => {
    const departments = materials.map(material => material.department);
    const uniqueDepartments = Array.from(new Set(departments));
    
    // Department mapping from English to Arabic
    const departmentMap: { [key: string]: { title: string; subtitle: string; icon: string; disabled?: boolean } } = {
      'General Program': { title: 'General Program', subtitle: 'البرنامج العام', icon: '🎓', disabled: true },
      'Cyber Security': { title: 'Cyber Security', subtitle: 'الأمن السيبراني', icon: '🛡️' },
      'Artificial Intelligence': { title: 'AI', subtitle: 'الذكاء الاصطناعي', icon: '🤖' }
    };
    
    return uniqueDepartments.map((dept, index) => {
      const deptInfo = departmentMap[dept] || { title: dept, subtitle: dept, icon: '🎓' };
      const gradients = [
        'from-slate-600 via-slate-700 to-slate-800',
        'from-blue-600 via-blue-700 to-blue-800', 
        'from-indigo-600 via-indigo-700 to-indigo-800',
        'from-green-600 via-green-700 to-green-800',
        'from-red-600 via-red-700 to-red-800',
        'from-yellow-600 via-yellow-700 to-yellow-800'
      ];
      const bgColors = [
        'bg-slate-800/30',
        'bg-blue-900/30',
        'bg-indigo-900/30',
        'bg-green-900/30',
        'bg-red-900/30',
        'bg-yellow-900/30'
      ];
      const borderColors = [
        'border-slate-600/50',
        'border-blue-600/50',
        'border-indigo-600/50',
        'border-green-600/50',
        'border-red-600/50',
        'border-yellow-600/50'
      ];
      
      return {
        key: dept as ProgramKey,
        title: deptInfo.title,
        subtitle: deptInfo.subtitle,
        gradient: gradients[index % gradients.length],
        icon: deptInfo.icon,
        desc: `قسم ${deptInfo.title}`,
        bgColor: bgColors[index % bgColors.length],
        borderColor: borderColors[index % borderColors.length],
        disabled: deptInfo.disabled || false
      };
    });
  };

  const programCards = getUniqueDepartments();

  // Load materials from Supabase
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Loading materials...');
        
        const materialsData = await materialsService.getAll();
        console.log('✅ Loaded materials:', materialsData);
        
        setMaterials(materialsData);
        
      } catch (error) {
        console.error('❌ Error loading materials:', error);
        setError('خطأ في تحميل البيانات. تأكد من إعداد Supabase بشكل صحيح.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMaterials();
  }, []);

  // Listen for all updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'scheduleUpdated' || e.key === 'materialsUpdated' || e.key === 'pdfsUpdated' || e.key === 'videosUpdated') {
        console.log('🔄 Data updated, refreshing...', e.key);
        setScheduleRefreshTrigger(prev => {
          const newValue = prev + 1;
          console.log('📊 Schedule refresh trigger updated:', newValue);
          return newValue;
        });
        localStorage.removeItem(e.key);
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      console.log('🔄 Custom data update event received:', e.detail);
      setScheduleRefreshTrigger(prev => {
        const newValue = prev + 1;
        console.log('📊 Schedule refresh trigger updated from custom event:', newValue);
        return newValue;
      });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dataUpdated', handleCustomEvent as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dataUpdated', handleCustomEvent as EventListener);
    };
  }, []);

  // Auto-select user's department, year, and term if logged in
  useEffect(() => {
    // Check URL parameters first
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlProgram = urlParams.get('program') as ProgramKey;
      const urlYear = urlParams.get('year');
      const urlTerm = urlParams.get('term') as 'FIRST' | 'SECOND';

      console.log('🔗 URL parameters:', { urlProgram, urlYear, urlTerm });

      if (urlProgram && urlYear && urlTerm) {
        console.log('🔗 Loading from URL parameters:', { urlProgram, urlYear, urlTerm });
        setProgram(urlProgram);
        setYear(parseInt(urlYear));
        setTerm(urlTerm);
        
        // Save to localStorage for backup
        localStorage.setItem('lastMaterialSelection', JSON.stringify({
          program: urlProgram,
          year: parseInt(urlYear),
          term: urlTerm
        }));
        return; // Don't continue to user data if URL params exist
      }
      
      // Check if this is a fresh home page visit (no URL params and no referrer from materials)
      const isFromMaterials = document.referrer && document.referrer.includes('/materials/');
      const isFreshHome = !urlProgram && !urlYear && !urlTerm && !isFromMaterials;
      
      if (!isFreshHome) {
        const savedSelection = localStorage.getItem('lastMaterialSelection');
        if (savedSelection) {
          try {
            const { program: savedProgram, year: savedYear, term: savedTerm } = JSON.parse(savedSelection);
            console.log('💾 Loading from localStorage:', { savedProgram, savedYear, savedTerm });
            setProgram(savedProgram);
            setYear(savedYear);
            setTerm(savedTerm);
            return;
          } catch (error) {
            console.log('❌ Error parsing saved selection:', error);
          }
        }
      } else {
        // Fresh home page visit - clear any saved selection
        console.log('🏠 Fresh home page visit - clearing saved selection');
        localStorage.removeItem('lastMaterialSelection');
      }
    }
    
    if (user && user.department && user.year && user.term) {
      console.log('👤 User data:', {
        department: user.department,
        year: user.year,
        term: user.term
      });
      
      // Map user department to program key
      const departmentToProgram: { [key: string]: ProgramKey } = {
        'General Program': 'General',
        'Cyber Security': 'Cyber Security',
        'Artificial Intelligence': 'Artificial Intelligence'
      };
      
      const userProgram = departmentToProgram[user.department];
      console.log('🔄 Mapping department to program:', {
        userDepartment: user.department,
        mappedProgram: userProgram
      });
      
      if (userProgram) {
        setProgram(userProgram);
        setYear(user.year);
        setTerm(user.term);
        console.log('🎯 Auto-selected user preferences:', {
          program: userProgram,
          year: user.year,
          term: user.term
        });
      } else {
        console.log('❌ No program mapping found for department:', user.department);
      }
    } else {
      console.log('❌ User data incomplete:', {
        hasUser: !!user,
        hasDepartment: !!(user && user.department),
        hasYear: !!(user && user.year),
        hasTerm: !!(user && user.term)
      });
    }
  }, [user]);

  const isReady = program !== '' && year !== '' && term !== '' && program !== null && year !== null && term !== null;

  const filtered = isReady
    ? materials.filter(c => {
        // Map program selection to department
        const programToDepartment: { [key: string]: string } = {
          'General': 'General Program',
          'Cyber Security': 'Cyber Security', 
          'Artificial Intelligence': 'Artificial Intelligence'
        };
        
        const expectedDepartment = programToDepartment[program as string];
        const matchesDepartment = c.department === expectedDepartment;
        const matchesYear = c.year === year;
        const matchesTerm = c.term === term || (term === 'FIRST' && c.term === 'First Semester') || (term === 'SECOND' && c.term === 'Second Semester');
        
        const result = matchesDepartment && matchesYear && matchesTerm &&
        (
          !searchQuery ||
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (isReady) {
          console.log('Filtering material:', c.title, {
            expectedDepartment,
            actualDepartment: c.department,
            matchesDepartment,
            expectedYear: year,
            actualYear: c.year,
            matchesYear,
            expectedTerm: term,
            actualTerm: c.term,
            matchesTerm,
            result
          });
        }
        
        return result;
      })
    : [];

  console.log('📊 Filtering results:', {
    isReady: Boolean(isReady),
    program,
    year,
    term,
    totalMaterials: materials.length,
    filteredCount: filtered.length,
    searchQuery
  });

  const resetSelections = () => {
    console.log('🔄 Reset selections called');
    setProgram('');
    setYear('');
    setTerm('');
    setSearchQuery('');
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lastMaterialSelection');
    }
    console.log('✅ Reset completed');
  };

  // Save selections to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && program && year && term) {
      localStorage.setItem('lastMaterialSelection', JSON.stringify({
        program,
        year,
        term
      }));
    }
  }, [program, year, term]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Golden Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-10 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8">
               <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-2xl shadow-yellow-500/25">
                 <img 
                   src="/assets/icons/main-icon.png" 
                   alt="University Materials" 
                   className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
                 />
               </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-2 sm:mb-4 px-2 drop-shadow-2xl">
            University Materials
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6 px-2 font-medium">
            منصة المواد الدراسية لطلاب كلية الحاسبات والمعلومات - جامعة الزقازيق
          </p>
          
          
          {/* User Welcome */}
          {user && (
            <div className="bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto border border-yellow-500/30 shadow-2xl shadow-yellow-500/20 mb-4 sm:mb-6">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">👋</div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-3 sm:mb-4">مرحباً {user.name}</h2>
              <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
                {user.department && user.year && user.term 
                  ? `${user.department} - السنة ${user.year} - ${user.term === 'FIRST' ? 'الترم الأول' : 'الترم الثاني'}`
                  : 'اختر برنامجك الدراسي للبدء'
                }
              </p>
              {user.department && user.year && user.term && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <p className="text-yellow-400 text-sm font-medium">
                    ✅ تم تحميل موادك الدراسية تلقائياً
                  </p>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <Link
                  href="/profile"
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-2xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30"
                >
                  حسابي الشخصي
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Lecture Schedule - show when user profile is complete OR when selections are made */}
        {(user && (user.department && user.year && user.term)) || (program && year && term) ? (
          <LectureSchedule
            user={user || null}
            departmentOverride={program ? ({
              'General': 'General Program',
              'Cyber Security': 'Cyber Security',
              'Artificial Intelligence': 'Artificial Intelligence'
            } as const)[program] : undefined}
            yearOverride={typeof year === 'number' ? year : undefined}
            termOverride={term || undefined}
            refreshTrigger={scheduleRefreshTrigger}
          />
        ) : null}

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg transition-all duration-500 ${
              program ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-700'
            }`}>
              1
            </div>
            <div className={`w-20 h-1 rounded-full transition-all duration-500 ${program ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-700'}`}></div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg transition-all duration-500 ${
              year && term ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30' : program ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30' : 'bg-gray-700'
            }`}>
              2
            </div>
            <div className={`w-20 h-1 rounded-full transition-all duration-500 ${isReady ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-700'}`}></div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg transition-all duration-500 ${
              isReady ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30' : 'bg-gray-700'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Program Selection */}
        {!program && (
          <section className="mb-6 sm:mb-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 px-2 drop-shadow-2xl">اختر برنامجك الدراسي</h2>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg px-2 font-medium">اختر البرنامج الذي تدرس فيه لعرض المواد المناسبة</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto px-2">
              {programCards.map(card => (
                <button
                  key={card.key}
                  onClick={() => !card.disabled && setProgram(card.key)}
                  disabled={card.disabled}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transition-all duration-500 ${
                    card.disabled 
                      ? 'opacity-60 cursor-not-allowed bg-gray-800 border-gray-600' 
                      : 'transform hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-gray-800 to-black border-2 border-yellow-500/30 hover:border-yellow-400 hover:shadow-yellow-500/30'
                  } backdrop-blur-sm`}
                >
                  {/* Coming Soon Badge */}
                  {card.disabled && (
                    <div className="absolute top-3 left-3 z-20">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg">
                        قريباً
                      </div>
                    </div>
                  )}
                  
                  <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent ${
                    card.disabled ? '' : 'group-hover:from-white/10'
                  } transition-all duration-500`}></div>
                  <div className="relative z-10">
                    <div className={`text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 ${
                      card.disabled ? '' : 'group-hover:scale-110'
                    } transition-transform duration-500`}>{card.icon}</div>
                    <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white ${
                      card.disabled ? '' : 'group-hover:text-yellow-400'
                    } transition-colors duration-300`}>{card.title}</h3>
                    <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-3 sm:mb-4 font-medium">{card.subtitle}</p>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                    <div className="mt-6 flex justify-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        card.disabled 
                          ? 'bg-gray-400 text-gray-600' 
                          : 'bg-yellow-400 text-black group-hover:bg-yellow-500 group-hover:scale-110 shadow-lg'
                      }`}>
                        <span className="text-xl">{card.disabled ? '⏳' : '→'}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Step 2: Year and Term Selection */}
        {program !== '' && !isReady && (
          <section className="mb-6 sm:mb-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 px-2">اختر السنة والفصل الدراسي</h2>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg px-2">البرنامج المختار: <span className="font-bold text-cyan-400 text-base sm:text-lg md:text-xl">
                {programCards.find(p => p.key === program)?.title}
              </span></p>
            </div>
            
            <div className="max-w-6xl mx-auto px-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
                {/* Year Selection */}
                <div className="bg-gradient-to-br from-gray-800/80 to-black/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-yellow-500/30">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-6 sm:mb-8 text-center">السنة الدراسية</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {[1,2,3,4].map(y => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center transition-all duration-500 ${
                          year === y 
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-2xl shadow-yellow-500/30 scale-105' 
                            : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white hover:shadow-lg border border-yellow-500/30 hover:border-yellow-400'
                        }`}
                      >
                        <div className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">السنة {y}</div>
                        <div className="text-xs sm:text-sm opacity-80 font-medium">Year {y}</div>
                        {year === y && (
                          <div className="absolute top-3 right-3 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                            <span className="text-lg text-black">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Term Selection */}
                <div className="bg-gradient-to-br from-gray-800/80 to-black/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-yellow-500/30">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-6 sm:mb-8 text-center">الفصل الدراسي</h3>
                  <div className="space-y-4 sm:space-y-6">
                    <button
                      onClick={() => setTerm('FIRST')}
                      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full text-center transition-all duration-500 ${
                        term === 'FIRST' 
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-2xl shadow-yellow-500/30 scale-105' 
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white hover:shadow-lg border border-yellow-500/30 hover:border-yellow-400'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">الترم الأول</div>
                      <div className="text-xs sm:text-sm opacity-80 font-medium">First Semester</div>
                      {term === 'FIRST' && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                          <span className="text-lg text-black">✓</span>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setTerm('SECOND')}
                      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 w-full text-center transition-all duration-500 ${
                        term === 'SECOND' 
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-2xl shadow-yellow-500/30 scale-105' 
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white hover:shadow-lg border border-yellow-500/30 hover:border-yellow-400'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">الترم الثاني</div>
                      <div className="text-xs sm:text-sm opacity-80 font-medium">Second Semester</div>
                      {term === 'SECOND' && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center">
                          <span className="text-lg text-black">✓</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center mt-8 sm:mt-10">
                <button
                  type="button"
                  onClick={resetSelections}
                  className="px-8 py-3 text-gray-300 hover:text-yellow-400 transition-colors font-medium text-lg cursor-pointer border border-gray-600 rounded-lg hover:border-yellow-400 relative z-20"
                  style={{ pointerEvents: 'auto' }}
                >
                  ← تغيير البرنامج
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Results */}
        {isReady && (
          <section>
             <div className="text-center mb-8">
               <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 px-2 drop-shadow-2xl">المواد المتاحة</h2>
               <p className="text-gray-300 text-sm sm:text-base md:text-lg px-2">
                 {programCards.find(p => p.key === program)?.title} - السنة {year} - {term === 'FIRST' ? 'الترم الأول' : 'الترم الثاني'}
               </p>
             </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مادة أو كود المادة..."
                  className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base sm:text-lg md:text-xl bg-gray-800/50 backdrop-blur-sm border-2 border-yellow-500/30 rounded-xl sm:rounded-2xl focus:outline-none focus:border-yellow-400 transition-all duration-300 text-white placeholder-gray-400"
                />
                <div className="absolute right-3 sm:right-4 md:right-6 top-1/2 transform -translate-y-1/2 text-yellow-400 text-lg sm:text-xl md:text-2xl">
                  🔍
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-gray-300 text-xl">جاري تحميل البيانات...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-20">
                <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8 max-w-2xl mx-auto">
                  <div className="text-red-400 text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold text-red-300 mb-4">خطأ في تحميل البيانات</h3>
                  <p className="text-gray-300 text-lg">{error}</p>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {!loading && !error && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-8xl mx-auto px-2">
                {filtered.map(material => (
                  <div key={material.id} className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-gray-700/50 hover:border-cyan-500/30">
                    <div className="flex items-center justify-between mb-6">
                      <span className="px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm font-bold rounded-full border border-cyan-500/30">
                        {material.code}
                      </span>
                      <div className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-cyan-500/30">
                        📚
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-2 sm:mb-3 group-hover:text-cyan-300 transition-colors duration-300">
                      {material.title}
                    </h3>
                    <p className="text-base sm:text-lg md:text-xl text-cyan-300 mb-4 sm:mb-6 font-bold">{material.titleAr}</p>
                    <Link 
                      href={`/materials/${material.id}?program=${program}&year=${year}&term=${term}`}
                      className="block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
                    >
                      فتح المادة
                    </Link>
                  </div>
                ))}
              </div>
            ) : !loading && !error ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-8">📝</div>
                <h3 className="text-3xl font-black text-white mb-4">لا توجد مواد متاحة</h3>
                <p className="text-gray-300 mb-8 text-lg">لا توجد مواد مطابقة لاختياراتك حالياً</p>
                <button
                  type="button"
                  onClick={resetSelections}
                  className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-2xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg shadow-yellow-500/30 cursor-pointer relative z-20"
                  style={{ pointerEvents: 'auto' }}
                >
                  اختيار جديد
                </button>
              </div>
            ) : null}

            {/* Reset Button */}
            <div className="text-center mt-12">
              <button
                type="button"
                onClick={resetSelections}
                className="px-8 py-3 text-gray-300 hover:text-yellow-400 transition-colors font-medium text-lg cursor-pointer border border-gray-600 rounded-lg hover:border-yellow-400 relative z-20"
                style={{ pointerEvents: 'auto' }}
              >
                ← اختيار جديد
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}