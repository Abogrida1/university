// تحسينات الأداء العامة للموقع
// General Performance Optimizations

import { NextRequest, NextResponse } from 'next/server';

// إعدادات الضغط والتحسين
export const compressionConfig = {
  // ضغط النصوص
  textCompression: true,
  // ضغط الصور
  imageCompression: true,
  // ضغط الخطوط
  fontCompression: true,
  // ضغط CSS/JS
  assetCompression: true,
};

// إعدادات التخزين المؤقت
export const cacheConfig = {
  // مدة التخزين المؤقت للصفحات الثابتة
  staticPages: 24 * 60 * 60, // 24 ساعة
  // مدة التخزين المؤقت للبيانات الديناميكية
  dynamicData: 5 * 60, // 5 دقائق
  // مدة التخزين المؤقت للصور
  images: 7 * 24 * 60 * 60, // 7 أيام
  // مدة التخزين المؤقت للخطوط
  fonts: 30 * 24 * 60 * 60, // 30 يوم
};

// إعدادات تحسين الاستعلامات
export const queryOptimization = {
  // عدد العناصر في كل صفحة
  pageSize: 20,
  // استخدام الفهرس للبحث
  useIndexes: true,
  // تحسين الاستعلامات المعقدة
  optimizeComplexQueries: true,
  // استخدام التجميع للبيانات الكبيرة
  useAggregation: true,
};

// إعدادات تحسين الشبكة
export const networkOptimization = {
  // ضغط البيانات
  enableCompression: true,
  // تحسين البروتوكول
  useHTTP2: true,
  // تحسين الاتصال
  keepAlive: true,
  // تحسين التحميل المتوازي
  parallelLoading: true,
};

// دالة تحسين الاستجابة
export function optimizeResponse(response: NextResponse): NextResponse {
  // إضافة رؤوس التحسين
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // إضافة رؤوس التخزين المؤقت
  response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  
  // إضافة رؤوس الضغط
  response.headers.set('Content-Encoding', 'gzip');
  
  return response;
}

// دالة تحسين الصور
export function optimizeImageUrl(url: string, width?: number, height?: number): string {
  if (!url) return url;
  
  // إضافة معاملات التحسين
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', '80'); // جودة 80%
  params.set('f', 'auto'); // تنسيق تلقائي
  
  return `${url}?${params.toString()}`;
}

// دالة تحسين الخطوط
export function optimizeFonts(): string[] {
  return [
    // خطوط أساسية محسنة
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap',
  ];
}

// دالة تحسين CSS
export function optimizeCSS(): string {
  return `
    /* تحسينات الأداء العامة */
    * {
      box-sizing: border-box;
    }
    
    /* تحسين التمرير */
    html {
      scroll-behavior: smooth;
    }
    
    /* تحسين الخطوط */
    body {
      font-display: swap;
      text-rendering: optimizeSpeed;
    }
    
    /* تحسين الصور */
    img {
      loading: lazy;
      decoding: async;
    }
    
    /* تحسين الفيديوهات */
    video {
      loading: lazy;
    }
    
    /* تحسين الروابط */
    a {
      text-decoration: none;
    }
    
    /* تحسين الأزرار */
    button {
      cursor: pointer;
    }
    
    /* تحسين النماذج */
    input, textarea, select {
      font-family: inherit;
    }
  `;
}

// دالة تحسين JavaScript
export function optimizeJS(): string {
  return `
    // تحسينات الأداء العامة
    (function() {
      // تحسين التحميل
      if ('requestIdleCallback' in window) {
        requestIdleCallback(function() {
          // تحميل العناصر غير الحرجة
          loadNonCriticalElements();
        });
      }
      
      // تحسين الذاكرة
      if ('memory' in performance) {
        setInterval(function() {
          if (performance.memory.usedJSHeapSize > 50 * 1024 * 1024) {
            // تنظيف الذاكرة عند الحاجة
            cleanupMemory();
          }
        }, 30000);
      }
      
      // تحسين الشبكة
      if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          // تحسين للاتصالات البطيئة
          optimizeForSlowConnection();
        }
      }
    })();
    
    function loadNonCriticalElements() {
      // تحميل العناصر غير الحرجة
    }
    
    function cleanupMemory() {
      // تنظيف الذاكرة
    }
    
    function optimizeForSlowConnection() {
      // تحسين للاتصالات البطيئة
    }
  `;
}
