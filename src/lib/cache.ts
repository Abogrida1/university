// نظام التخزين المؤقت المحلي للأداء العالي
// Local Caching System for High Performance

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class LocalCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 دقائق افتراضياً

  // إضافة عنصر للتخزين المؤقت
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  // الحصول على عنصر من التخزين المؤقت
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // التحقق من انتهاء الصلاحية
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // التحقق من وجود عنصر في التخزين المؤقت
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // حذف عنصر من التخزين المؤقت
  delete(key: string): void {
    this.cache.delete(key);
  }

  // مسح جميع العناصر المنتهية الصلاحية
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // مسح جميع العناصر
  clear(): void {
    this.cache.clear();
  }

  // الحصول على حجم التخزين المؤقت
  size(): number {
    return this.cache.size;
  }
}

// إنشاء مثيل واحد للتخزين المؤقت
export const cache = new LocalCache();

// تنظيف دوري للتخزين المؤقت كل دقيقة
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 60 * 1000);
}

// مفاتيح التخزين المؤقت
export const CACHE_KEYS = {
  MATERIALS: 'materials_all',
  MATERIAL: (id: string) => `material_${id}`,
  PDFS: (materialId: string) => `pdfs_${materialId}`,
  VIDEOS: (materialId: string) => `videos_${materialId}`,
  USER: (id: string) => `user_${id}`,
  SCHEDULES: (department: string, year: number, term: string) => 
    `schedules_${department}_${year}_${term}`,
} as const;

// دالة مساعدة للحصول على البيانات مع التخزين المؤقت
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // محاولة الحصول من التخزين المؤقت أولاً
  const cached = cache.get<T>(key);
  if (cached !== null) {
    console.log(`📦 Cache hit: ${key}`);
    return cached;
  }

  console.log(`🔄 Cache miss: ${key}, fetching...`);
  
  // جلب البيانات من المصدر
  const data = await fetcher();
  
  // حفظ في التخزين المؤقت
  cache.set(key, data, ttl);
  
  return data;
}

// دالة مساعدة لمسح التخزين المؤقت المتعلق بمادة معينة
export function invalidateMaterialCache(materialId: string): void {
  cache.delete(CACHE_KEYS.MATERIAL(materialId));
  cache.delete(CACHE_KEYS.PDFS(materialId));
  cache.delete(CACHE_KEYS.VIDEOS(materialId));
  cache.delete(CACHE_KEYS.MATERIALS); // مسح قائمة المواد أيضاً
}

// دالة مساعدة لمسح جميع التخزين المؤقت
export function invalidateAllCache(): void {
  cache.clear();
}
