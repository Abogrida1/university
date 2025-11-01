'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export interface BackgroundSound {
  id: string;
  name: string;
  icon: string;
  url: string;
  startTime?: number;
  backupUrls?: string[];
}

export const BACKGROUND_SOUNDS: BackgroundSound[] = [
  { id: 'none', name: 'صمت (بدون صوت)', icon: '🔇', url: '' },
  { id: 'rain', name: 'صوت المطر الهادئ', icon: '🌧️', url: '/sounds/calming-rain-257596.mp3' },
  { id: 'whitenoise', name: 'ضوضاء خفيفة', icon: '🎵', url: '/sounds/relaxing-smoothed-brown-noise-294838.mp3' },
  { id: 'maryam', name: 'سورة مريم - مشاري العفاسي', icon: '📖', url: 'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/019.mp3' },
  { id: 'najm', name: 'سورة النجم - ناصر القطامي', icon: '📖', url: '/sounds/videoplayback.m4a', startTime: 12, backupUrls: [
      'https://download.quranicaudio.com/quran/nasser_al_qatami/053.mp3',
      'https://cdn.islamic.network/quran/audio-surah/128/ar.nasser/053.mp3',
      'https://server8.mp3quran.net/nasser/053.mp3',
      'https://server7.mp3quran.net/nasser/053.mp3',
      'https://server9.mp3quran.net/nasser/053.mp3',
      'https://server10.mp3quran.net/nasser/053.mp3'
    ] }
];

type GlobalAudioContextType = {
  selectedSound: string;
  setSelectedSound: (id: string) => void;
  volume: number;
  setVolume: (v: number) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  restart: () => void;
};

const GlobalAudioContext = createContext<GlobalAudioContextType | undefined>(undefined);

export const GlobalAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const enableOnClickRef = useRef<((e: any) => void) | null>(null);
  const [selectedSound, setSelectedSoundState] = useState<string>('none');
  const [volume, setVolumeState] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // hydrate from storage
  useEffect(() => {
    try {
      const s = localStorage.getItem('pomodoroSelectedSound');
      const v = localStorage.getItem('pomodoroVolume');
      if (s) setSelectedSoundState(s);
      if (v) setVolumeState(Number(v));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try { localStorage.setItem('pomodoroSelectedSound', selectedSound); } catch {}
  }, [selectedSound]);
  useEffect(() => {
    try { localStorage.setItem('pomodoroVolume', String(volume)); } catch {}
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // create audio once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = volume / 100;
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));

      const enableOnClick = () => {
        if (audioRef.current && selectedSound !== 'none' && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
      };
      enableOnClickRef.current = enableOnClick;
      document.addEventListener('click', enableOnClick);
    }

    return () => {
      if (enableOnClickRef.current) document.removeEventListener('click', enableOnClickRef.current);
    };
  }, []);

  // handle source changes, keep position when switching
  useEffect(() => {
    if (!audioRef.current) return;
    const sound = BACKGROUND_SOUNDS.find(s => s.id === selectedSound);
    if (!sound || selectedSound === 'none') {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      return;
    }

    const wasPlaying = !audioRef.current.paused;
    const previousTime = audioRef.current.currentTime;
    const desiredTime = wasPlaying ? previousTime : (sound.startTime ?? 0);

    const urlsToTry = [sound.url, ...(sound.backupUrls || [])];

    const tryPlay = (index = 0) => {
      if (!audioRef.current) return;
      if (index >= urlsToTry.length) return;
      const audio = audioRef.current;
      const onError = () => {
        audio.removeEventListener('error', onError);
        tryPlay(index + 1);
      };
      audio.addEventListener('error', onError);
      audio.src = urlsToTry[index];
      audio.load();
      audio.play().then(() => {
        audio.removeEventListener('error', onError);
        const setTime = () => { try { audio.currentTime = desiredTime; } catch {} };
        if (audio.readyState >= 1) setTime(); else {
          const onLoaded = () => { setTime(); audio.removeEventListener('loadedmetadata', onLoaded); };
          audio.addEventListener('loadedmetadata', onLoaded);
        }
      }).catch(() => {
        audio.removeEventListener('error', onError);
        tryPlay(index + 1);
      });
    };
    tryPlay(0);
  }, [selectedSound]);

  const setSelectedSound = (id: string) => setSelectedSoundState(id);
  const setVolume = (v: number) => setVolumeState(v);
  const play = () => { audioRef.current?.play().catch(() => {}); };
  const pause = () => { audioRef.current?.pause(); };
  const restart = () => {
    if (!audioRef.current) return;
    try { audioRef.current.currentTime = 0; } catch {}
    audioRef.current.play().catch(() => {});
  };

  return (
    <GlobalAudioContext.Provider value={{ selectedSound, setSelectedSound, volume, setVolume, isPlaying, play, pause, restart }}>
      {children}
    </GlobalAudioContext.Provider>
  );
};

export const useGlobalAudio = () => {
  const ctx = useContext(GlobalAudioContext);
  if (!ctx) throw new Error('useGlobalAudio must be used within GlobalAudioProvider');
  return ctx;
};


