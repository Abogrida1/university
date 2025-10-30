'use client';

import React, { useState, useEffect, useRef } from 'react';

// Background sounds - LOCAL FILES (guaranteed to work!)
interface BackgroundSound {
  id: string;
  name: string;
  icon: string;
  url: string;
  startTime?: number; // وقت البداية بالثواني
  backupUrls?: string[];
}

const backgroundSounds: BackgroundSound[] = [
  { 
    id: 'none', 
    name: 'صمت (بدون صوت)', 
    icon: '🔇', 
    url: ''
  },
  { 
    id: 'rain', 
    name: 'صوت المطر الهادئ', 
    icon: '🌧️', 
    url: '/sounds/calming-rain-257596.mp3'
  },
  { 
    id: 'whitenoise', 
    name: 'ضوضاء خفيفة', 
    icon: '🎵', 
    url: '/sounds/relaxing-smoothed-brown-noise-294838.mp3'
  },
  { 
    id: 'maryam', 
    name: 'سورة مريم - مشاري العفاسي', 
    icon: '📖', 
    url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/019.mp3'
  },
  { 
    id: 'najm', 
    name: 'سورة النجم - ناصر القطامي', 
    icon: '📖', 
    url: '/sounds/videoplayback.m4a',
    startTime: 12, // بدء التشغيل من الثانية 12
    backupUrls: [
      'https://download.quranicaudio.com/quran/nasser_al_qatami/053.mp3',
      'https://cdn.islamic.network/quran/audio-surah/128/ar.nasser/053.mp3',
      'https://server8.mp3quran.net/nasser/053.mp3',
      'https://server7.mp3quran.net/nasser/053.mp3',
      'https://server9.mp3quran.net/nasser/053.mp3',
      'https://server10.mp3quran.net/nasser/053.mp3'
    ]
  },
];

interface Task {
  id: number;
  text: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
}

export default function PomodoroPage() {
  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check initial dark mode
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Watch for changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'stats' | 'settings'>('timer');
  
  // Timer state
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [sessionNumber, setSessionNumber] = useState(1);
  
  // Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  
  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  
  // Statistics
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  
  // Background sound
  const [selectedSound, setSelectedSound] = useState('none');
  const [volume, setVolume] = useState(50);
  
  // Audio refs
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const enableOnClickRef = useRef<((e: any) => void) | null>(null);

  // Hydrate settings from localStorage (selected sound + volume)
  useEffect(() => {
    try {
      const savedSound = localStorage.getItem('pomodoroSelectedSound');
      const savedVolume = localStorage.getItem('pomodoroVolume');
      if (savedSound) setSelectedSound(savedSound);
      if (savedVolume) setVolume(Number(savedVolume));
    } catch {}
  }, []);

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pomodoroSelectedSound', selectedSound);
    } catch {}
  }, [selectedSound]);

  useEffect(() => {
    try {
      localStorage.setItem('pomodoroVolume', String(volume));
    } catch {}
  }, [volume]);
  
  // Play background sounds
  useEffect(() => {
    if (!backgroundAudioRef.current) {
      backgroundAudioRef.current = new Audio();
      backgroundAudioRef.current.loop = true;
      backgroundAudioRef.current.volume = 0.5;
      
      // Enable audio on first user interaction
      const enableOnClick = () => {
        if (backgroundAudioRef.current && selectedSound !== 'none' && backgroundAudioRef.current.paused) {
          backgroundAudioRef.current.play().catch(() => {});
        }
      };
      enableOnClickRef.current = enableOnClick;
      document.addEventListener('click', enableOnClick);
    }
    
    const selectedSoundObj = backgroundSounds.find(s => s.id === selectedSound);
    
    if (selectedSound !== 'none' && selectedSoundObj && selectedSoundObj.url) {
      // Capture current playback state and position to continue smoothly
      const wasPlaying = backgroundAudioRef.current && !backgroundAudioRef.current.paused;
      const previousTime = backgroundAudioRef.current ? backgroundAudioRef.current.currentTime : 0;
      const desiredTime = wasPlaying
        ? previousTime
        : (selectedSoundObj.startTime ?? 0);

      // Set new source without resetting the desired time
      backgroundAudioRef.current.src = selectedSoundObj.url;
      backgroundAudioRef.current.volume = volume / 100;
      backgroundAudioRef.current.load();
      
      console.log('🎵 تحميل:', selectedSoundObj.name);
      
      // Try to play with backup URLs for Quran recitations
      setTimeout(() => {
        const tryPlay = (urlIndex = 0) => {
          if (!backgroundAudioRef.current) return;
          
          const urlsToTry = [
            selectedSoundObj.url,
            ...(selectedSoundObj.backupUrls || [])
          ];
          
          if (urlIndex >= urlsToTry.length) {
            console.log('❌ جميع المصادر فشلت');
            return;
          }
          
          console.log(`🔄 جاري تجربة المصدر ${urlIndex + 1}: ${urlsToTry[urlIndex]}`);
          backgroundAudioRef.current.src = urlsToTry[urlIndex];
          backgroundAudioRef.current.load();
          
          // Add error event listener for this attempt
          const handleError = () => {
            console.log(`❌ فشل المصدر ${urlIndex + 1}: ${urlsToTry[urlIndex]}`);
            backgroundAudioRef.current?.removeEventListener('error', handleError);
            tryPlay(urlIndex + 1);
          };
          
          backgroundAudioRef.current.addEventListener('error', handleError);
          
          backgroundAudioRef.current.play()
            .then(() => {
              console.log(`✅ يعمل! (المصدر ${urlIndex + 1}): ${urlsToTry[urlIndex]}`);
              backgroundAudioRef.current?.removeEventListener('error', handleError);

              // اضبط وقت التشغيل المطلوب للحفاظ على الاستمرارية
              if (backgroundAudioRef.current) {
                // إذا لم يكن الملف قد حمّل الميتاداتا بعد، انتظر الحدث واضبط الوقت
                const setTime = () => {
                  try {
                    backgroundAudioRef.current!.currentTime = desiredTime;
                  } catch {}
                };
                if (backgroundAudioRef.current.readyState >= 1) {
                  setTime();
                } else {
                  const onLoaded = () => {
                    setTime();
                    backgroundAudioRef.current?.removeEventListener('loadedmetadata', onLoaded);
                  };
                  backgroundAudioRef.current.addEventListener('loadedmetadata', onLoaded);
                }
              }
            })
            .catch(err => {
              console.log(`❌ فشل المصدر ${urlIndex + 1}:`, err.message);
              backgroundAudioRef.current?.removeEventListener('error', handleError);
              tryPlay(urlIndex + 1);
            });
        };
        
        tryPlay();
      }, 500);
      
    } else {
      if (backgroundAudioRef.current?.src) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.src = '';
      }
    }

    // Cleanup on unmount: pause audio and remove listeners
    return () => {
      if (backgroundAudioRef.current) {
        try {
          backgroundAudioRef.current.pause();
        } catch {}
        backgroundAudioRef.current.src = '';
      }
      if (enableOnClickRef.current) {
        document.removeEventListener('click', enableOnClickRef.current);
      }
    };
  }, [selectedSound, volume]);
  
  // Update volume separately (don't restart audio)
  useEffect(() => {
      if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = volume / 100;
      }
  }, [volume]);

  // Pause audio when tab becomes hidden to avoid background playback
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && backgroundAudioRef.current) {
        try { backgroundAudioRef.current.pause(); } catch {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (sessionType === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      setTotalFocusTime(prev => prev + workDuration);
      
      if (currentTaskId) {
        setTasks(tasks.map(task => 
          task.id === currentTaskId 
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
            : task
        ));
      }
      
      const isLongBreak = sessionNumber % 4 === 0;
      const breakTime = isLongBreak ? longBreakDuration : shortBreakDuration;
      
      setSessionType('break');
      setMinutes(breakTime);
      setSeconds(0);
    } else {
      setSessionType('work');
      setSessionNumber(prev => prev + 1);
      setMinutes(workDuration);
      setSeconds(0);
    }
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const duration = sessionType === 'work' ? workDuration : shortBreakDuration;
    setMinutes(duration);
    setSeconds(0);
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: newTaskText.trim(),
        completed: false,
        estimatedPomodoros: 1,
        completedPomodoros: 0,
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
      
      if (!currentTaskId) {
        setCurrentTaskId(newTask.id);
      }
    }
  };

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (currentTaskId === id) {
      setCurrentTaskId(null);
    }
  };

  const progress = ((workDuration * 60 - (minutes * 60 + seconds)) / (workDuration * 60)) * 100;

  // Force English numbers in inputs
  useEffect(() => {
    const convertArabicToEnglish = (value: string) => {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      
      let result = value;
      arabicNumbers.forEach((arabic, index) => {
        result = result.replace(new RegExp(arabic, 'g'), englishNumbers[index]);
      });
      return result;
    };
    
    const forceEnglishNumbers = () => {
      const inputs = document.querySelectorAll('.pomodoro-page input[type="number"], .english-numbers');
      inputs.forEach((input: any) => {
        if (input && input.value) {
          const converted = convertArabicToEnglish(input.value);
          if (converted !== input.value) {
            input.value = converted;
            input.setAttribute('value', converted);
          }
        }
      });
      
      // Also convert text content in english-numbers divs
      const divs = document.querySelectorAll('.pomodoro-page .english-numbers');
      divs.forEach((div: any) => {
        if (div && div.textContent) {
          const converted = convertArabicToEnglish(div.textContent);
          if (converted !== div.textContent) {
            div.textContent = converted;
          }
        }
      });
    };
    
    // Force on mount multiple times to ensure it works
    const timeouts = [0, 50, 100, 200, 500, 1000];
    timeouts.forEach(delay => setTimeout(forceEnglishNumbers, delay));
    
    // Create MutationObserver to watch for DOM changes
    const observer = new MutationObserver(() => {
      forceEnglishNumbers();
    });
    
    const container = document.querySelector('.pomodoro-page');
    if (container) {
      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['value']
      });
    }
    
    const inputs = document.querySelectorAll('.pomodoro-page input[type="number"]');
    const handlers: Array<{ input: any; handler: any }> = [];
    
    // Add event listeners for future changes
    inputs.forEach((input: any) => {
      if (input) {
        const handleInput = (e: any) => {
          const converted = convertArabicToEnglish(e.target.value);
          if (converted !== e.target.value) {
            e.target.value = converted;
          }
        };
        
        const handleFocus = () => {
          forceEnglishNumbers();
        };
        
        input.addEventListener('input', handleInput);
        input.addEventListener('focus', handleFocus);
        handlers.push({ input, handler: handleInput });
      }
    });
    
    return () => {
      observer.disconnect();
      handlers.forEach(({ input, handler }) => {
        input.removeEventListener('input', handler);
      });
    };
  }, [workDuration, shortBreakDuration, longBreakDuration, activeTab]);

  return (
    <div className="pomodoro-page min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-800 py-3 sm:py-4 md:py-6 px-3 sm:px-4 relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
        
        .pomodoro-page * {
          font-feature-settings: "tnum" 1;
        }
        
        .pomodoro-page input[type="number"],
        .pomodoro-page .english-numbers {
          font-family: 'Roboto Mono', 'Courier New', Courier, monospace !important;
          unicode-bidi: plaintext !important;
          -webkit-font-feature-settings: "tnum" !important;
          font-feature-settings: "tnum" !important;
        }
        
        .pomodoro-page input[type="number"]::-webkit-inner-spin-button,
        .pomodoro-page input[type="number"]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}} />
      
      {/* Light Mode Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none dark:hidden"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse dark:hidden"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none animate-pulse dark:hidden"></div>
      
      {/* Dark Mode Effects - Gold/Yellow Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 pointer-events-none hidden dark:block"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none hidden dark:block"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none hidden dark:block"></div>
      
        <div className="container mx-auto max-w-7xl relative z-10">
        {/* Integrated Header */}
        <div className="text-center mb-4 sm:mb-5 md:mb-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border-2 border-blue-300 dark:border-yellow-500/30 p-4 sm:p-6 md:p-8 transition-all duration-500">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 dark:from-yellow-400 dark:via-yellow-400 dark:to-yellow-400 bg-clip-text text-transparent">
              🍅 مؤقت الدراسة
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 font-semibold px-2">
            نظّم وقتك وركّز على دراستك واستغل وقت الراحة في قراءة القرآن
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border-2 border-blue-300 dark:border-yellow-500/30 p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6 transition-all duration-500">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 md:mb-6">
            <button
              onClick={() => setActiveTab('timer')}
              className={`inline-flex items-center px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'timer'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black shadow-lg shadow-blue-500/50 dark:shadow-yellow-500/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              المؤقت
            </button>
            
            <button
              onClick={() => setActiveTab('tasks')}
              className={`inline-flex items-center px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'tasks'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black shadow-lg shadow-blue-500/50 dark:shadow-yellow-500/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              المهام
            </button>
            
            <button
              onClick={() => setActiveTab('stats')}
              className={`inline-flex items-center px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black shadow-lg shadow-blue-500/50 dark:shadow-yellow-500/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path d="M3 3v16a2 2 0 0 0 2 2h16"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
              الإحصائيات
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-black shadow-lg shadow-blue-500/50 dark:shadow-yellow-500/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
              </svg>
              الإعدادات
            </button>
          </div>

          {/* Timer Tab */}
          {activeTab === 'timer' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {/* Timer Card */}
              <div className="xl:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border-2 border-blue-300 dark:border-yellow-500/30 transition-all duration-500">
                  <div className="text-center mb-4 sm:mb-5 md:mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 p-1.5 sm:p-2 rounded-lg shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                          <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
                          <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-blue-600 dark:from-yellow-400 dark:to-yellow-400 bg-clip-text text-transparent">
                        {sessionType === 'work' ? 'وقت الدراسة 📚' : 'وقت الراحة ☕'}
                      </h3>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-blue-600 dark:text-yellow-400 bg-blue-100 dark:bg-yellow-900/30 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full inline-block">
                      الجلسة {sessionNumber}
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4 sm:space-y-5 md:space-y-6">
                    <div dir="ltr" lang="en" className="english-numbers text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 dark:from-yellow-400 dark:via-yellow-400 dark:to-yellow-400 bg-clip-text text-transparent font-mono drop-shadow-lg" style={{ fontVariantNumeric: 'lining-nums' }}>
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    
                    <div className="space-y-2 px-2 sm:px-4">
                      <div className="w-full bg-blue-100 dark:bg-yellow-900/30 rounded-full h-2 sm:h-3 shadow-inner">
                        <div
                          className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 dark:from-yellow-500 dark:via-yellow-500 dark:to-yellow-500 h-full rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-yellow-300">
                        {Math.round(progress)}% مكتمل 🎯
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2 sm:pt-4 px-2 sm:px-0">
                      <button
                        onClick={handleStartPause}
                        className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 hover:from-blue-600 hover:to-blue-700 dark:hover:from-yellow-600 dark:hover:to-yellow-700 text-white dark:text-black font-bold text-base sm:text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        {isRunning ? (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" rx="1"/>
                              <rect x="14" y="4" width="4" height="16" rx="1"/>
                            </svg>
                            <span>إيقاف</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>ابدأ الآن</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 border-2 border-blue-500 dark:border-yellow-500 bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-yellow-400 font-bold text-base sm:text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:bg-blue-100 dark:hover:bg-gray-600 hover:shadow-md"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                        </svg>
                        <span>إعادة</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Add Task */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl border-2 border-indigo-300 dark:border-yellow-500/30 transition-all duration-500">
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-indigo-700 dark:text-yellow-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                    ابدأ مهمة جديدة
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      placeholder="اكتب اسم المهمة الجديدة..."
                      className="flex-1 h-12 sm:h-13 md:h-14 rounded-lg sm:rounded-xl border-2 border-indigo-400/50 dark:border-yellow-500/40 bg-indigo-50/50 dark:bg-gray-800/50 text-indigo-900 dark:text-yellow-100 placeholder:text-indigo-400 dark:placeholder:text-gray-400 px-4 sm:px-5 font-semibold text-base sm:text-lg outline-none focus:border-indigo-500 focus:bg-indigo-100/50 dark:focus:border-yellow-400 dark:focus:bg-gray-700/50 transition-all duration-200"
                    />
                    <button
                      onClick={handleAddTask}
                      disabled={!newTaskText.trim()}
                      className="w-full sm:w-auto px-6 sm:px-7 md:px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 hover:from-blue-600 hover:to-blue-700 dark:hover:from-yellow-600 dark:hover:to-yellow-700 text-white dark:text-black font-black text-base sm:text-lg rounded-lg sm:rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-blue-500/40 dark:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                    >
                      ➕ إضافة
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Current Task */}
                <div className="sidebar-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl border-2 border-blue-300 dark:border-yellow-500/30 transition-all duration-500">
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-blue-700 dark:text-yellow-400 mb-3 sm:mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="6"/>
                      <circle cx="12" cy="12" r="2"/>
                    </svg>
                    المهمة الحالية
                  </h3>
                  
                  {currentTaskId ? (
                    tasks.filter(task => task.id === currentTaskId).map(task => (
                      <div key={task.id} className="p-4 bg-blue-100 dark:bg-yellow-900/30 border-2 border-blue-400 dark:border-yellow-500 rounded-xl shadow-lg">
                        <div className="font-bold text-blue-900 dark:text-yellow-100 mb-2">
                          📌 {task.text}
                        </div>
                        <div dir="ltr" lang="en" className="english-numbers text-sm font-semibold text-blue-700 dark:text-yellow-300" style={{ fontVariantNumeric: 'lining-nums' }}>
                          🍅 {task.completedPomodoros} / {task.estimatedPomodoros} بومودورو
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-gray-100 dark:bg-gray-700/30 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-50">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2"/>
                      </svg>
                      <p className="text-sm font-medium">لا توجد مهمة محددة</p>
                    </div>
                  )}
                </div>

                {/* Background Sounds */}
                <div className="sidebar-card bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl border-2 border-indigo-300 dark:border-yellow-500/30 transition-all duration-500">
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-indigo-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6">
                      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
                      <path d="M16 9a5 5 0 0 1 0 6"/>
                      <path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>
                    </svg>
                    الأصوات المصاحبة
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
                    اختر صوتاً للتركيز والاسترخاء 🎵
                  </p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {backgroundSounds.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => setSelectedSound(sound.id)}
                        className={`w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 transition-all duration-300 transform hover:scale-105 font-semibold border-2 ${
                          selectedSound === sound.id
                            ? 'bg-blue-100 dark:bg-yellow-900/40 border-blue-400 dark:border-yellow-600 shadow-lg text-blue-900 dark:text-yellow-100'
                            : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{sound.icon}</span>
                        <span className="text-xs sm:text-sm flex-1 text-right">
                          {sound.name}
                        </span>
                      </button>
                    ))}
                    
                    {/* Volume Control */}
                    {selectedSound !== 'none' && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-indigo-300 dark:border-yellow-500/30">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <span className="text-xl sm:text-2xl text-indigo-700 dark:text-yellow-400">🔊</span>
                          <span className="text-sm sm:text-base font-black text-indigo-700 dark:text-yellow-400">مستوى الصوت</span>
                          <span className="mr-auto font-black text-lg sm:text-2xl text-indigo-700 dark:text-yellow-400" dir="ltr">{volume}%</span>
                  </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="w-full h-3 sm:h-4 rounded-lg appearance-none cursor-pointer transition-all volume-slider"
                          style={{
                            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
                          }}
                        />
                        <style>{`
                          .dark .volume-slider {
                            background: linear-gradient(to right, #eab308 0%, #eab308 ${volume}%, #4b5563 ${volume}%, #4b5563 100%) !important;
                          }
                        `}</style>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="text-center mb-4 sm:mb-5 md:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  قائمة المهام
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  نظّم مهامك وتتبع إنجازك
                </p>
              </div>
              
              {tasks.length === 0 ? (
                <div className="text-center py-8 sm:py-10 md:py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📝</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 font-semibold text-base sm:text-lg px-4">
                    لا توجد مهام بعد
                  </p>
                  <button
                    onClick={() => setActiveTab('timer')}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 hover:from-blue-600 hover:to-blue-700 dark:hover:from-yellow-600 dark:hover:to-yellow-700 text-white dark:text-black font-bold text-sm sm:text-base rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    ➕ أضف مهمة جديدة
                  </button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                        task.completed
                          ? 'bg-gray-100 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600'
                          : currentTaskId === task.id
                          ? 'bg-blue-50 dark:bg-yellow-900/30 border-blue-400 dark:border-yellow-600 shadow-lg'
                          : 'bg-white dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-yellow-700'
                      }`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-yellow-500 focus:ring-blue-500 dark:focus:ring-yellow-600 bg-white dark:bg-gray-700 cursor-pointer flex-shrink-0"
                          style={{ colorScheme: 'dark' }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-base sm:text-lg ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {task.text}
                          </div>
                          
                          <div dir="ltr" lang="en" className="english-numbers mt-1 sm:mt-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400" style={{ fontVariantNumeric: 'lining-nums' }}>
                            🍅 {task.completedPomodoros} / {task.estimatedPomodoros} بومودورو
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          🗑️ <span className="hidden sm:inline">حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="text-center mb-4 sm:mb-5 md:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  إحصائيات الإنتاجية
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  تتبع تقدمك وإنجازك
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-center border-2 border-blue-300 dark:border-yellow-500/30 shadow-2xl transition-all duration-500">
                  <div dir="ltr" lang="en" className="english-numbers text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-blue-600 dark:from-yellow-400 dark:to-yellow-400 bg-clip-text text-transparent mb-2 sm:mb-3" style={{ fontVariantNumeric: 'lining-nums' }}>
                    {completedPomodoros}
                  </div>
                  <div className="font-bold text-sm sm:text-base md:text-lg text-blue-700 dark:text-yellow-400">
                    🍅 بومودورو مكتمل
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-center border-2 border-indigo-300 dark:border-yellow-500/30 shadow-2xl transition-all duration-500">
                  <div dir="ltr" lang="en" className="english-numbers text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-blue-600 dark:from-yellow-400 dark:to-yellow-400 bg-clip-text text-transparent mb-2 sm:mb-3" style={{ fontVariantNumeric: 'lining-nums' }}>
                    {totalFocusTime}
                  </div>
                  <div className="font-bold text-sm sm:text-base md:text-lg text-indigo-700 dark:text-yellow-400">
                    ⏱️ دقيقة تركيز
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800/80 dark:to-black/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 text-center border-2 border-purple-300 dark:border-yellow-500/30 shadow-2xl transition-all duration-500 sm:col-span-2 md:col-span-1">
                  <div dir="ltr" lang="en" className="english-numbers text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-blue-600 dark:from-yellow-400 dark:to-yellow-400 bg-clip-text text-transparent mb-2 sm:mb-3" style={{ fontVariantNumeric: 'lining-nums' }}>
                    {tasks.filter(t => t.completed).length}
                  </div>
                  <div className="font-bold text-sm sm:text-base md:text-lg text-purple-700 dark:text-yellow-400">
                    ✅ مهمة منجزة
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="text-center mb-4 sm:mb-5 md:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  إعدادات المؤقت
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-4">
                  خصص أوقات العمل والراحة حسب احتياجك
                </p>
              </div>
              
              <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', padding: '20px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '2px solid #334155' }} className="sm:rounded-2xl sm:p-8">
                
                <div style={{ marginBottom: '16px' }} className="sm:mb-6">
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#34d399', marginBottom: '8px' }} className="sm:text-lg sm:mb-3">
                    ⏱️ مدة العمل (دقيقة)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    max="60"
                    value={workDuration}
                    onChange={(e) => setWorkDuration(Number(e.target.value))}
                    dir="ltr"
                    lang="en"
                    className="english-numbers"
                    style={{ width: '100%', height: '48px', borderRadius: '10px', border: '2px solid #475569', backgroundColor: '#334155', color: '#ffffff', padding: '0 16px', fontWeight: 'bold', textAlign: 'center', fontSize: '16px', outline: 'none', fontVariantNumeric: 'lining-nums' }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }} className="sm:mb-6">
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#34d399', marginBottom: '8px' }} className="sm:text-lg sm:mb-3">
                    ☕ مدة الراحة القصيرة (دقيقة)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    max="30"
                    value={shortBreakDuration}
                    onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                    dir="ltr"
                    lang="en"
                    className="english-numbers"
                    style={{ width: '100%', height: '48px', borderRadius: '10px', border: '2px solid #475569', backgroundColor: '#334155', color: '#ffffff', padding: '0 16px', fontWeight: 'bold', textAlign: 'center', fontSize: '16px', outline: 'none', fontVariantNumeric: 'lining-nums' }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }} className="sm:mb-6">
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#34d399', marginBottom: '8px' }} className="sm:text-lg sm:mb-3">
                    🌙 مدة الراحة الطويلة (دقيقة)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    max="60"
                    value={longBreakDuration}
                    onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                    dir="ltr"
                    lang="en"
                    className="english-numbers"
                    style={{ width: '100%', height: '48px', borderRadius: '10px', border: '2px solid #475569', backgroundColor: '#334155', color: '#ffffff', padding: '0 16px', fontWeight: 'bold', textAlign: 'center', fontSize: '16px', outline: 'none', fontVariantNumeric: 'lining-nums' }}
                  />
                </div>
                
                <button
                  onClick={() => {
                    setMinutes(workDuration);
                    setSeconds(0);
                    alert('تم حفظ الإعدادات بنجاح! ✅');
                  }}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(to right, #10b981, #14b8a6)', color: '#ffffff', fontWeight: 'bold', fontSize: '16px', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}
                  className="sm:p-5 sm:text-xl sm:rounded-xl"
                >
                  💾 حفظ الإعدادات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

