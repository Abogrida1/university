// تسجيل Service Worker
// Service Worker Registration

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      console.log('🔧 Registering Service Worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered successfully:', registration);
      
      // تحديث Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New Service Worker available');
              // يمكن إضافة إشعار للمستخدم هنا
            }
          });
        }
      });
      
      // إرسال رسائل للـ Service Worker
      if (registration.active) {
        // تخزين URLs مهمة
        const importantUrls = [
          '/',
          '/materials',
          '/pomodoro',
          '/profile',
          '/about',
          '/contact'
        ];
        
        registration.active.postMessage({
          type: 'CACHE_URLS',
          urls: importantUrls
        });
      }
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  });
  
  // التعامل مع تحديثات Service Worker
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker controller changed');
    // إعادة تحميل الصفحة عند تغيير Service Worker
    window.location.reload();
  });
  
  // التعامل مع رسائل Service Worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('📦 Cache updated:', event.data.url);
    }
  });
}
