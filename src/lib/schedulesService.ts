import { supabase } from './supabase';

export interface Schedule {
  id: string;
  title: string;
  department: string;
  departmentAr: string;
  year: number;
  term: 'FIRST' | 'SECOND';
  termAr: string;
  size?: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
  updatedAt: string;
}

export const schedulesService = {
  async getByCriteria(department: string, year: number, term: 'FIRST' | 'SECOND'): Promise<Schedule | null> {
    // تحويل term إلى التنسيق الصحيح
    const normalizedTerm = term === 'FIRST' ? 'FIRST' : 'SECOND';
    
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('department', department)
      .eq('year', year)
      .eq('term', normalizedTerm)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching schedule:', error);
      return null;
    }
    if (!data) {
      console.log('📅 No schedule found for:', { department, year, normalizedTerm });
      return null;
    }
    
    console.log('📅 Schedule found:', {
      id: data.id,
      title: data.title,
      department: data.department,
      year: data.year,
      term: data.term,
      file_name: data.file_name,
      file_url: data.file_url ? `${data.file_url.substring(0, 50)}...` : null,
      file_url_length: data.file_url ? data.file_url.length : 0,
      has_file_url: !!data.file_url
    });

    return {
      id: data.id,
      title: data.title,
      department: data.department,
      departmentAr: data.department_ar,
      year: data.year,
      term: data.term,
      termAr: data.term_ar,
      size: data.size ?? undefined,
      fileUrl: data.file_url ?? undefined,
      fileName: data.file_name ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async getAll(): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      department: row.department,
      departmentAr: row.department_ar,
      year: row.year,
      term: row.term,
      termAr: row.term_ar,
      size: row.size ?? undefined,
      fileUrl: row.file_url ?? undefined,
      fileName: row.file_name ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async add(input: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>, file?: File): Promise<Schedule | null> {
    let fileUrl = input.fileUrl;
    let fileName = input.fileName;
    let size = input.size;

    if (file) {
      // Check file size first
      const fileSizeMB = file.size / (1024 * 1024);
      console.log(`📁 File size: ${fileSizeMB.toFixed(2)} MB`);
      
      // Limit file size to prevent memory issues
      if (fileSizeMB > 5) {
        console.error('❌ File too large for Base64 conversion (max 5MB)');
        return null;
      }
      
      // Use Base64 directly since Storage bucket might not exist
      try {
        console.log('🔄 Converting file to Base64...');
        
        // Use FileReader for better Base64 conversion
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const result = reader.result as string;
              // Remove data URL prefix if present
              const base64Data = result.includes(',') ? result.split(',')[1] : result;
              resolve(base64Data);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
        
        fileUrl = `data:application/pdf;base64,${base64}`;
        fileName = file.name;
        size = `${fileSizeMB.toFixed(2)} MB`;
        console.log('✅ File converted to Base64 successfully');
      } catch (base64Error) {
        console.error('❌ Base64 conversion failed:', base64Error);
        return null;
      }
    }
    // تحويل term إلى التنسيق الصحيح
    const normalizedTerm = input.term === 'FIRST' ? 'FIRST' : 'SECOND';
    
    console.log('💾 Inserting schedule to database:', {
      title: input.title,
      department: input.department,
      department_ar: input.departmentAr,
      year: input.year,
      term: normalizedTerm,
      term_ar: input.termAr,
      size: size ?? null,
      file_url: fileUrl ? `${fileUrl.substring(0, 50)}...` : null, // Show only first 50 chars
      file_name: fileName ?? null,
    });
    
    const { data, error } = await supabase
      .from('schedules')
      .insert([
        {
          title: input.title,
          department: input.department,
          department_ar: input.departmentAr,
          year: input.year,
          term: normalizedTerm,
          term_ar: input.termAr,
          size: size ?? null,
          file_url: fileUrl ?? null,
          file_name: fileName ?? null,
        },
      ])
      .select()
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      department: data.department,
      departmentAr: data.department_ar,
      year: data.year,
      term: data.term,
      termAr: data.term_ar,
      size: data.size ?? undefined,
      fileUrl: data.file_url ?? undefined,
      fileName: data.file_name ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async update(id: string, updates: Partial<Schedule>): Promise<Schedule | null> {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.departmentAr !== undefined) payload.department_ar = updates.departmentAr;
    if (updates.year !== undefined) payload.year = updates.year;
    if (updates.term !== undefined) {
      const normalizedTerm = updates.term === 'FIRST' ? 'FIRST' : 'SECOND';
      payload.term = normalizedTerm;
    }
    if (updates.termAr !== undefined) payload.term_ar = updates.termAr;
    if (updates.size !== undefined) payload.size = updates.size;
    if (updates.fileUrl !== undefined) payload.file_url = updates.fileUrl;
    if (updates.fileName !== undefined) payload.file_name = updates.fileName;

    console.log('🔄 Updating schedule:', { 
      id, 
      payload,
      originalUpdates: updates
    });
    
    const { data, error } = await supabase
      .from('schedules')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;
    return {
      id: data.id,
      title: data.title,
      department: data.department,
      departmentAr: data.department_ar,
      year: data.year,
      term: data.term,
      termAr: data.term_ar,
      size: data.size ?? undefined,
      fileUrl: data.file_url ?? undefined,
      fileName: data.file_name ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async delete(id: string): Promise<boolean> {
    console.log('🗑️ Deleting schedule:', id);
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) {
      console.error('❌ Error deleting schedule:', error);
      return false;
    }
    console.log('✅ Schedule deleted successfully');
    return true;
  },
};

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Ensure data URL format
      if (result.startsWith('data:')) {
        resolve(result);
      } else {
        resolve(`data:application/pdf;base64,${result}`);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}


