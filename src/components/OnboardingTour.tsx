'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

type TourStep = {
  id: string;
  title: string;
  description: string;
  icon: string;
  selector: string; // CSS selector للعنصر المراد توجيه الانتباه إليه
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
};

const tourSteps: TourStep[] = [
  {
    id: 'home-section',
    title: '🏠 الصفحة الرئيسية',
    description: 'هنا يمكنك استعراض واختيار موادك الدراسية حسب برنامجك الدراسي، السنة، والفصل الدراسي. جميع المواد منظمة بشكل احترافي وسهل الوصول.',
    icon: '📚',
    selector: 'nav a[href="/"], header a[href="/"]',
    position: 'bottom'
  },
  {
    id: 'pomodoro-section',
    title: '🍅 مؤقت الدراسة (Pomodoro)',
    description: 'أداة احترافية لإدارة وقت الدراسة. استخدم تقنية البومودورو لزيادة إنتاجيتك وتركيزك مع إشعارات صوتية وبيئة مخصصة للدراسة.',
    icon: '⏱️',
    selector: 'nav a[href="/pomodoro"], header a[href="/pomodoro"]',
    position: 'bottom'
  },
  {
    id: 'about-section',
    title: 'ℹ️ من نحن',
    description: 'تعرف على المزيد عن منصة المواد الدراسية ورسالتنا ومهمتنا في مساعدة الطلاب.',
    icon: '📖',
    selector: 'nav a[href="/about"], header a[href="/about"]',
    position: 'bottom'
  },
  {
    id: 'contact-section',
    title: '📧 تواصل معنا',
    description: 'تواصل معنا لأي استفسار أو مساعدة. نحن هنا لخدمتك.',
    icon: '💬',
    selector: 'nav a[href="/contact"], header a[href="/contact"]',
    position: 'bottom'
  },
  {
    id: 'profile-section',
    title: '👤 حسابك الشخصي',
    description: 'ادارة معلوماتك الشخصية والأكاديمية، تحديث بياناتك، ومتابعة إعدادات حسابك من مكان واحد.',
    icon: '⚙️',
    selector: 'nav a[href="/profile"], nav a[href="/login"], header a[href="/profile"], header a[href="/login"]',
    position: 'bottom'
  },
  {
    id: 'final-welcome',
    title: '🎉 مرحباً بك!',
    description: 'أنت الآن جاهز للبدء! استكشف جميع الميزات والمواد المتاحة. نحن هنا لمساعدتك في رحلتك الأكاديمية.',
    icon: '🚀',
    selector: '',
    position: 'center'
  }
];

export default function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAlign, setTooltipAlign] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('bottom');
  const [pathname, setPathname] = useState<string>('');
  const [isDesktop, setIsDesktop] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= 1024);
      }
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const resetElementStyles = useCallback((selector: string) => {
    if (!selector) return;
    let element = document.querySelector(selector);
    if (!element && selector.includes(',')) {
      const selectors = selector.split(',').map(s => s.trim());
      for (const sel of selectors) {
        element = document.querySelector(sel);
        if (element) break;
      }
    }
    if (element) {
      (element as HTMLElement).style.transform = '';
      (element as HTMLElement).style.zIndex = '';
      (element as HTMLElement).style.filter = '';
    }
  }, []);

  const updateTooltipPosition = useCallback(() => {
    if (currentStep >= tourSteps.length) return;

    const step = tourSteps[currentStep];
    
    // Final step doesn't need positioning
    if (step.id === 'final-welcome') {
      setTooltipPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
      setTooltipAlign('bottom'); // Will be handled as center in render
      return;
    }

    // Try both selectors (profile or login)
    let element = document.querySelector(step.selector);
    
    // If selector has comma, try both parts
    if (!element && step.selector.includes(',')) {
      const selectors = step.selector.split(',').map(s => s.trim());
      for (const sel of selectors) {
        element = document.querySelector(sel);
        if (element) break;
      }
    }

    if (!element) {
      // If element not found, skip to next step
      setTimeout(() => {
        if (currentStep < tourSteps.length - 1) {
          setCurrentStep(prev => {
            const next = prev + 1;
            setTimeout(() => {
              updateTooltipPosition();
            }, 100);
            return next;
          });
        } else {
          handleComplete();
        }
      }, 100);
      return;
    }

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Determine position
    let top = 0;
    let left = 0;
    let align: 'top' | 'bottom' | 'left' | 'right' | 'center' = step.position || 'bottom';

    switch (align) {
      case 'bottom':
        top = rect.bottom + scrollTop + 12;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'top':
        top = rect.top + scrollTop - 12;
        left = rect.left + scrollLeft + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.left + scrollLeft - 12;
        break;
      case 'right':
        top = rect.top + scrollTop + rect.height / 2;
        left = rect.right + scrollLeft + 12;
        break;
      case 'center':
        top = window.innerHeight / 2;
        left = window.innerWidth / 2;
        break;
    }

    setTooltipPosition({ top, left });
    setTooltipAlign(align);

    // Scroll element into view
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    // Highlight element
    (element as HTMLElement).style.transition = 'all 0.3s ease';
    (element as HTMLElement).style.transform = 'scale(1.1)';
    (element as HTMLElement).style.zIndex = '9998';
    (element as HTMLElement).style.filter = 'brightness(1.2)';
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    // Reset all elements
    tourSteps.forEach(step => {
      resetElementStyles(step.selector);
    });

    try {
      localStorage.setItem('onboarding_tour_completed', '1');
      setIsVisible(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setIsVisible(false);
    }
  }, [resetElementStyles]);

  const handleNext = useCallback(() => {
    // Reset previous element
    const prevStep = tourSteps[currentStep];
    if (prevStep) {
      resetElementStyles(prevStep.selector);
    }

    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, resetElementStyles, handleComplete]);

  const handleSkip = useCallback(() => {
    // Reset all elements
    tourSteps.forEach(step => {
      resetElementStyles(step.selector);
    });
    handleComplete();
  }, [resetElementStyles, handleComplete]);

  // Get pathname from window.location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
      
      const handlePathChange = () => {
        setPathname(window.location.pathname);
      };
      
      // Listen for pathname changes (Next.js client-side navigation)
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        originalPushState.apply(history, args);
        handlePathChange();
      };
      
      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        handlePathChange();
      };
      
      window.addEventListener('popstate', handlePathChange);
      
      return () => {
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
        window.removeEventListener('popstate', handlePathChange);
      };
    }
  }, []);

  useEffect(() => {
    // Desktop: show full tour on home page
    // Mobile: show desktop recommendation message
    if (!pathname) return;

    const checkDesktop = () => {
      if (typeof window === 'undefined') return false;
      return window.innerWidth >= 1024;
    };

    try {
      const hasCompletedTour = localStorage.getItem('onboarding_tour_completed');
      const hasSeenMobileMessage = localStorage.getItem('mobile_desktop_recommendation');
      
      if (checkDesktop()) {
        // Desktop: show tour on home page
        if (!hasCompletedTour && pathname === '/') {
          const timer = setTimeout(() => {
            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
              setIsVisible(true);
            }
          }, 1500);
          return () => clearTimeout(timer);
        }
      } else {
        // Mobile: show desktop recommendation message (only once)
        if (!hasSeenMobileMessage && pathname === '/') {
          const timer = setTimeout(() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsVisible(true);
            }
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  }, [pathname, isDesktop]);

  useEffect(() => {
    if (!isVisible) return;

    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const isNowDesktop = window.innerWidth >= 1024;
        setIsDesktop(isNowDesktop);
        
        if (isNowDesktop && window.innerWidth < 1024) {
          // Switched to mobile while tour is showing
          setIsVisible(false);
          tourSteps.forEach(step => {
            resetElementStyles(step.selector);
          });
          return;
        }
        if (!isNowDesktop && window.innerWidth >= 1024) {
          // Switched to desktop while mobile message is showing
          setIsVisible(false);
        }
      }
      if (isDesktop) {
        updateTooltipPosition();
      }
    };

    const handleScroll = () => {
      if (isDesktop) {
        updateTooltipPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, isDesktop, updateTooltipPosition, resetElementStyles]);

  useEffect(() => {
    if (isVisible && isDesktop && currentStep < tourSteps.length) {
      // Wait a bit for nav to render
      const timer = setTimeout(() => {
        updateTooltipPosition();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible, isDesktop, updateTooltipPosition]);

  if (!isVisible) return null;

  // Mobile: Show desktop recommendation message
  if (!isDesktop) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            try {
              localStorage.setItem('mobile_desktop_recommendation', '1');
            } catch {}
            setIsVisible(false);
          }
        }}
      >
        <div
          className="relative w-full max-w-md bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-3xl shadow-2xl border-2 border-blue-200/50 dark:border-yellow-500/30 overflow-hidden transform transition-all duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-blue-200/50 dark:border-yellow-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl sm:text-5xl animate-bounce">💻</div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-400 dark:to-yellow-500 bg-clip-text text-transparent">
                    نسخة الديسكتوب أفضل
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-6 py-6">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center font-medium mb-6">
              نوصي بشدة باستخدام نسخة الديسكتوب للحصول على أفضل تجربة استخدام مع واجهة أكبر وإمكانيات متقدمة.
            </p>

            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-yellow-500/20 dark:to-orange-500/20 rounded-2xl border border-blue-300/50 dark:border-yellow-500/30">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl">💡</div>
                <div>
                  <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-semibold mb-2">
                    لماذا نسخة الديسكتوب؟
                  </p>
                  <ul className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-2 list-disc list-inside">
                    <li>واجهة أكبر وأسهل في القراءة</li>
                    <li>تجربة تصفح محسّنة</li>
                    <li>إمكانيات متقدمة في عرض المواد</li>
                    <li>أداء أفضل وسرعة أعلى</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-5 border-t border-blue-200/50 dark:border-yellow-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  try {
                    localStorage.setItem('mobile_desktop_recommendation', '1');
                  } catch {}
                  setIsVisible(false);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-500 dark:to-orange-500 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-yellow-600 dark:hover:to-orange-600 text-white dark:text-black font-bold text-base rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-yellow-500/30 transform hover:scale-105 transition-all duration-300"
              >
                ✓ فهمت
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Show full tour
  const step = tourSteps[currentStep];
  if (!step) return null;

  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isCenterStep = step.id === 'final-welcome';

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9997] bg-black/40"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      {isCenterStep ? (
        // Center popup for final step
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            ref={tooltipRef}
            className="relative w-full max-w-md bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-3xl shadow-2xl border-2 border-blue-200/50 dark:border-yellow-500/30 overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            {/* Header */}
            <div className="relative px-6 py-5 border-b border-blue-200/50 dark:border-yellow-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl sm:text-5xl animate-bounce">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-400 dark:to-yellow-500 bg-clip-text text-transparent">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                      {currentStep + 1} من {tourSteps.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  aria-label="إغلاق"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-yellow-400 dark:via-yellow-500 dark:to-orange-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative px-6 py-6">
              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center font-medium">
                {step.description}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-5 border-t border-blue-200/50 dark:border-yellow-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  تخطي
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-500 dark:to-orange-500 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-yellow-600 dark:hover:to-orange-600 text-white dark:text-black font-bold text-base rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-yellow-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  {isLastStep ? '🎉 ابدأ الاستكشاف' : 'التالي →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Tooltip next to element
        <div
          ref={tooltipRef}
          className="fixed z-[9999] pointer-events-auto"
          style={{
            top: tooltipAlign === 'bottom' ? `${tooltipPosition.top}px` : tooltipAlign === 'top' ? `${tooltipPosition.top}px` : 'auto',
            bottom: tooltipAlign === 'top' ? 'auto' : 'auto',
            left: `${tooltipPosition.left}px`,
            transform: 'translateX(-50%)',
            maxWidth: '400px',
          }}
        >
          <div className="relative w-80 sm:w-96 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-2xl shadow-2xl border-2 border-blue-200/50 dark:border-yellow-500/30 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

            {/* Arrow pointing to element */}
            <div
              className={`absolute w-0 h-0 border-8 ${
                tooltipAlign === 'bottom'
                  ? 'bottom-full left-1/2 -translate-x-1/2 border-transparent border-b-blue-200/50 dark:border-b-yellow-500/30'
                  : tooltipAlign === 'top'
                  ? 'top-full left-1/2 -translate-x-1/2 border-transparent border-t-blue-200/50 dark:border-t-yellow-500/30'
                  : tooltipAlign === 'left'
                  ? 'left-full top-1/2 -translate-y-1/2 border-transparent border-l-blue-200/50 dark:border-l-yellow-500/30'
                  : 'right-full top-1/2 -translate-y-1/2 border-transparent border-r-blue-200/50 dark:border-r-yellow-500/30'
              }`}
            />

            {/* Header */}
            <div className="relative px-5 py-4 border-b border-blue-200/50 dark:border-yellow-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="text-3xl sm:text-4xl animate-bounce">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-400 dark:to-yellow-500 bg-clip-text text-transparent">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                    {currentStep + 1} من {tourSteps.length}
                  </p>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  aria-label="إغلاق"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 dark:from-yellow-400 dark:via-yellow-500 dark:to-orange-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Content */}
            <div className="relative px-5 py-4">
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center font-medium">
                {step.description}
              </p>
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 border-t border-blue-200/50 dark:border-yellow-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  تخطي
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-yellow-500 dark:to-orange-500 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-yellow-600 dark:hover:to-orange-600 text-white dark:text-black font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-yellow-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  {isLastStep ? '🎉 ابدأ الاستكشاف' : 'التالي →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
