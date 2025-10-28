// Service Worker للـ Offline Caching
// Service Worker for Offline Caching

const CACHE_NAME = 'university-materials-v1';
const STATIC_CACHE_NAME = 'university-static-v1';
const DYNAMIC_CACHE_NAME = 'university-dynamic-v1';

// الملفات الثابتة للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/assets/icons/main-icon.png',
  '/sounds/calming-rain-257596.mp3',
  '/sounds/relaxing-smoothed-brown-noise-294838.mp3',
  '/sounds/videoplayback.m4a',
];

// الملفات الديناميكية للتخزين المؤقت
const DYNAMIC_PATTERNS = [
  /^\/materials\/.*$/,
  /^\/api\/.*$/,
  /^\/_next\/static\/.*$/,
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // تخزين الملفات الثابتة
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      // تفعيل Service Worker فوراً
      self.skipWaiting()
    ])
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    Promise.all([
      // تنظيف التخزين المؤقت القديم
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // السيطرة على جميع التبويبات
      self.clients.claim()
    ])
  );
});

// التعامل مع الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // تجاهل طلبات Supabase
  if (url.hostname.includes('supabase')) {
    return;
  }
  
  // تجاهل طلبات YouTube
  if (url.hostname.includes('youtube') || url.hostname.includes('ytimg')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// معالجة الطلبات
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // استراتيجية Cache First للملفات الثابتة
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }
    
    // استراتيجية Network First للملفات الديناميكية
    if (isDynamicAsset(url.pathname)) {
      return await networkFirst(request, DYNAMIC_CACHE_NAME);
    }
    
    // استراتيجية Network Only للطلبات الأخرى
    return await fetch(request);
    
  } catch (error) {
    console.error('❌ Request failed:', error);
    
    // إرجاع صفحة offline للصفحات
    if (request.mode === 'navigate') {
      return await caches.match('/offline');
    }
    
    // إرجاع رد افتراضي للطلبات الأخرى
    return new Response('Offline', { status: 503 });
  }
}

// استراتيجية Cache First
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('📦 Cache hit:', request.url);
    return cachedResponse;
  }
  
  console.log('🌐 Cache miss, fetching:', request.url);
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// استراتيجية Network First
async function networkFirst(request, cacheName) {
  try {
    console.log('🌐 Network first, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// التحقق من الملفات الثابتة
function isStaticAsset(pathname) {
  return STATIC_ASSETS.includes(pathname) ||
         pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/assets/') ||
         pathname.startsWith('/sounds/') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.jpeg') ||
         pathname.endsWith('.gif') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico') ||
         pathname.endsWith('.woff') ||
         pathname.endsWith('.woff2') ||
         pathname.endsWith('.ttf') ||
         pathname.endsWith('.eot');
}

// التحقق من الملفات الديناميكية
function isDynamicAsset(pathname) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.test(pathname));
}

// رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.addAll(urls);
      })
    );
  }
});

// تنظيف دوري للتخزين المؤقت
setInterval(async () => {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('university-')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      // حذف العناصر القديمة (أكثر من 7 أيام)
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const responseDate = new Date(dateHeader).getTime();
            if (responseDate < oneWeekAgo) {
              await cache.delete(request);
            }
          }
        }
      }
    }
  }
}, 24 * 60 * 60 * 1000); // كل 24 ساعة
