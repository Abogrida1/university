// تحسينات Supabase للأداء العالي
// Supabase Performance Optimizations

import { supabase } from './supabase';

// إعدادات تحسين الاستعلامات
export const SUPABASE_OPTIMIZATIONS = {
  // عدد العناصر في كل صفحة
  PAGE_SIZE: 20,
  // استخدام الفهرس للبحث
  USE_INDEXES: true,
  // تحسين الاستعلامات المعقدة
  OPTIMIZE_COMPLEX_QUERIES: true,
  // استخدام التجميع للبيانات الكبيرة
  USE_AGGREGATION: true,
};

// دالة تحسين استعلام المواد
export async function optimizedMaterialsQuery(filters: {
  department?: string;
  year?: number;
  term?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}) {
  const { department, year, term, searchQuery, limit = SUPABASE_OPTIMIZATIONS.PAGE_SIZE, offset = 0 } = filters;
  
  let query = supabase
    .from('materials')
    .select('*', { count: 'exact' });
  
  // تطبيق الفلاتر
  if (department) {
    query = query.eq('department', department);
  }
  
  if (year) {
    query = query.eq('year', year);
  }
  
  if (term) {
    query = query.eq('term', term);
  }
  
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }
  
  // ترتيب النتائج
  query = query.order('created_at', { ascending: false });
  
  // تطبيق الحد والتحويل
  query = query.range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    data: data || [],
    count: count || 0,
    hasMore: (offset + limit) < (count || 0)
  };
}

// دالة تحسين استعلام PDFs
export async function optimizedPdfsQuery(materialId: string, limit?: number, offset?: number) {
  const { data, error, count } = await supabase
    .from('pdfs')
    .select('*', { count: 'exact' })
    .eq('material_id', materialId)
    .order('created_at', { ascending: false })
    .range(offset || 0, (offset || 0) + (limit || SUPABASE_OPTIMIZATIONS.PAGE_SIZE) - 1);
  
  if (error) throw error;
  
  return {
    data: data || [],
    count: count || 0,
    hasMore: (offset || 0) + (limit || SUPABASE_OPTIMIZATIONS.PAGE_SIZE) < (count || 0)
  };
}

// دالة تحسين استعلام Videos
export async function optimizedVideosQuery(materialId: string, limit?: number, offset?: number) {
  const { data, error, count } = await supabase
    .from('videos')
    .select('*', { count: 'exact' })
    .eq('material_id', materialId)
    .order('created_at', { ascending: true })
    .range(offset || 0, (offset || 0) + (limit || SUPABASE_OPTIMIZATIONS.PAGE_SIZE) - 1);
  
  if (error) throw error;
  
  return {
    data: data || [],
    count: count || 0,
    hasMore: (offset || 0) + (limit || SUPABASE_OPTIMIZATIONS.PAGE_SIZE) < (count || 0)
  };
}

// دالة تحسين استعلام الجداول
export async function optimizedSchedulesQuery(filters: {
  department?: string;
  year?: number;
  term?: string;
}) {
  const { department, year, term } = filters;
  
  let query = supabase
    .from('schedules')
    .select('*');
  
  if (department) {
    query = query.eq('department', department);
  }
  
  if (year) {
    query = query.eq('year', year);
  }
  
  if (term) {
    query = query.eq('term', term);
  }
  
  query = query.order('day_of_week', { ascending: true })
               .order('start_time', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data || [];
}

// دالة تحسين استعلام المستخدمين
export async function optimizedUsersQuery(filters: {
  role?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}) {
  const { role, isActive, limit = SUPABASE_OPTIMIZATIONS.PAGE_SIZE, offset = 0 } = filters;
  
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' });
  
  if (role) {
    query = query.eq('role', role);
  }
  
  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }
  
  query = query.order('created_at', { ascending: false })
               .range(offset, offset + limit - 1);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    data: data || [],
    count: count || 0,
    hasMore: (offset + limit) < (count || 0)
  };
}

// دالة تحسين البحث
export async function optimizedSearchQuery(query: string, filters: {
  department?: string;
  year?: number;
  term?: string;
}) {
  const { department, year, term } = filters;
  
  let searchQuery = supabase
    .from('materials')
    .select('*')
    .or(`title.ilike.%${query}%,code.ilike.%${query}%,description.ilike.%${query}%`);
  
  if (department) {
    searchQuery = searchQuery.eq('department', department);
  }
  
  if (year) {
    searchQuery = searchQuery.eq('year', year);
  }
  
  if (term) {
    searchQuery = searchQuery.eq('term', term);
  }
  
  searchQuery = searchQuery.order('created_at', { ascending: false })
                          .limit(50); // حد أقصى 50 نتيجة
  
  const { data, error } = await searchQuery;
  
  if (error) throw error;
  
  return data || [];
}

// دالة تحسين الإحصائيات
export async function optimizedStatsQuery() {
  const [
    materialsCount,
    pdfsCount,
    videosCount,
    usersCount
  ] = await Promise.all([
    supabase.from('materials').select('*', { count: 'exact', head: true }),
    supabase.from('pdfs').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true })
  ]);
  
  return {
    materials: materialsCount.count || 0,
    pdfs: pdfsCount.count || 0,
    videos: videosCount.count || 0,
    users: usersCount.count || 0
  };
}

// دالة تحسين التحميل المتوازي
export async function parallelDataLoading(materialId: string) {
  const [material, pdfs, videos] = await Promise.allSettled([
    supabase.from('materials').select('*').eq('id', materialId).single(),
    supabase.from('pdfs').select('*').eq('material_id', materialId),
    supabase.from('videos').select('*').eq('material_id', materialId)
  ]);
  
  return {
    material: material.status === 'fulfilled' ? material.value.data : null,
    pdfs: pdfs.status === 'fulfilled' ? pdfs.value.data || [] : [],
    videos: videos.status === 'fulfilled' ? videos.value.data || [] : []
  };
}

// دالة تحسين التخزين المؤقت
export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

// دالة تحسين الاستجابة
export function optimizeResponse(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => optimizeResponse(item));
  }
  
  if (data && typeof data === 'object') {
    const optimized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // تحويل snake_case إلى camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      optimized[camelKey] = optimizeResponse(value);
    }
    
    return optimized;
  }
  
  return data;
}
