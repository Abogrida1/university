import { supabase } from './supabase';
import { uploadFileWithFallback, deleteFileWithFallback } from './storageFallback';

export interface Material {
  id: string;
  title: string;
  titleAr: string;
  code: string;
  department: string;
  departmentAr: string;
  year: number;
  term: string;
  termAr: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Pdf {
  id: string;
  title: string;
  material_id: string;
  material: string;
  material_ar: string;
  size: string;
  uploads: number;
  file_url: string;
  file_name: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  material_id: string;
  material: string;
  material_ar: string;
  duration: string;
  views: number;
  youtube_id: string;
  youtube_url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Materials Service
export const materialsService = {
  // Get all materials
  async getAll(): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get material by ID
  async getById(id: string): Promise<Material | null> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  // Add new material
  async add(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update material
  async update(id: string, updates: Partial<Material>): Promise<Material> {
    const { data, error } = await supabase
      .from('materials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete material
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Listen to materials changes
  onMaterialsChange(callback: (materials: Material[]) => void) {
    return supabase
      .channel('materials-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'materials' },
        () => {
          this.getAll().then(callback);
        }
      )
      .subscribe();
  }
};

// PDFs Service
export const pdfsService = {
  // Get all PDFs
  async getAll(): Promise<Pdf[]> {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get PDFs by material ID
  async getByMaterialId(materialId: string): Promise<Pdf[]> {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add new PDF
  async add(pdf: Omit<Pdf, 'id' | 'created_at' | 'updated_at'>, file?: File): Promise<Pdf> {
    let fileUrl = '';
    let fileName = '';
    
    if (file) {
      try {
        console.log('📤 Uploading file...', file.name);
        
        const fileExt = file.name.split('.').pop();
        const generatedFileName = `${Date.now()}.${fileExt}`;
        const filePath = `pdfs/${generatedFileName}`;
        
        console.log('📁 File path:', filePath);
        
        // استخدام الحل البديل للرفع
        const uploadResult = await uploadFileWithFallback(file, filePath);
        
        if (!uploadResult.success) {
          throw new Error(`فشل في رفع الملف: ${uploadResult.error}`);
        }
        
        fileUrl = uploadResult.url;
        fileName = file.name;
        
        console.log('🔗 File URL:', fileUrl);
        
        if (uploadResult.error) {
          console.warn('⚠️ Using fallback storage:', uploadResult.error);
        }
        
      } catch (error) {
        console.error('❌ File upload failed:', error);
        throw new Error(`فشل في رفع الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }
    
    try {
      console.log('💾 Saving PDF data to database...', pdf);
      
      const { data, error } = await supabase
        .from('pdfs')
        .insert([{
          ...pdf,
          file_url: fileUrl,
          file_name: fileName
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Database insert error:', error);
        throw new Error(`فشل في حفظ البيانات: ${error.message}`);
      }
      
      console.log('✅ PDF saved successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Database operation failed:', error);
      throw error;
    }
  },

  // Update PDF
  async update(id: string, updates: Partial<Pdf>, file?: File): Promise<Pdf> {
    let fileUrl = updates.file_url;
    let fileName = updates.file_name;
    
    if (file) {
      try {
        console.log('📤 Uploading new file...', file.name);
        
        const fileExt = file.name.split('.').pop();
        const generatedFileName = `${Date.now()}.${fileExt}`;
        const filePath = `pdfs/${generatedFileName}`;
        
        console.log('📁 File path:', filePath);
        
        // استخدام الحل البديل للرفع
        const uploadResult = await uploadFileWithFallback(file, filePath);
        
        if (!uploadResult.success) {
          throw new Error(`فشل في رفع الملف: ${uploadResult.error}`);
        }
        
        fileUrl = uploadResult.url;
        fileName = file.name;
        
        console.log('🔗 File URL:', fileUrl);
        
        if (uploadResult.error) {
          console.warn('⚠️ Using fallback storage:', uploadResult.error);
        }
        
      } catch (error) {
        console.error('❌ File upload failed:', error);
        throw new Error(`فشل في رفع الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }
    
    try {
      console.log('💾 Updating PDF data in database...', { id, updates });
      
      const { data, error } = await supabase
        .from('pdfs')
        .update({ 
          ...updates, 
          file_url: fileUrl,
          file_name: fileName,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Database update error:', error);
        throw new Error(`فشل في تحديث البيانات: ${error.message}`);
      }
      
      console.log('✅ PDF updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Database operation failed:', error);
      throw error;
    }
  },

  // Delete PDF
  async delete(id: string): Promise<void> {
    // Get PDF data first to delete file from storage
    const { data: pdfData } = await supabase
      .from('pdfs')
      .select('file_url')
      .eq('id', id)
      .single();
    
    if (pdfData?.file_url) {
      // استخدام الحل البديل لحذف الملف
      await deleteFileWithFallback(pdfData.file_url);
    }
    
    const { error } = await supabase
      .from('pdfs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Videos Service
export const videosService = {
  // Get all videos
  async getAll(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get videos by material ID
  async getByMaterialId(materialId: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add new video
  async add(video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .insert([video])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update video
  async update(id: string, updates: Partial<Video>): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete video
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Users Service
export const usersService = {
  // Get all users
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add new user
  async add(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user
  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete user
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
