// حل جذري لـ Supabase - بدون Storage
// Radical Supabase Solution - Without Storage

import { supabase } from './supabase';

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
  bookLink?: string;
  lecturesLink?: string;
  googleDriveLink?: string;
  additionalLinks?: string; // JSON format
  showGoogleDriveOnly?: boolean;
  showMaterialsSection?: boolean;
  showMaterialLinksSection?: boolean;
  showPdfsSection?: boolean;
  showVideosSection?: boolean;
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
  file_data?: string; // Base64 encoded file data
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
  playlist_url?: string;
  playlist_id?: string;
  is_playlist?: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

// تحويل الملف إلى Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // إزالة "data:application/pdf;base64,"
    };
    reader.onerror = error => reject(error);
  });
}

// تحويل Base64 إلى URL
export function base64ToUrl(base64: string, mimeType: string = 'application/pdf'): string {
  return `data:${mimeType};base64,${base64}`;
}

// خدمة المواد
export const materialsService = {
  async getAll(): Promise<Material[]> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // تحويل أسماء الحقول من snake_case إلى camelCase
    return (data || []).map((item: any) => ({
      ...item,
      titleAr: item.title_ar,
      departmentAr: item.department_ar,
      termAr: item.term_ar,
      bookLink: item.book_link,
      lecturesLink: item.lectures_link,
      googleDriveLink: item.google_drive_link,
      additionalLinks: item.additional_links,
      showGoogleDriveOnly: item.show_google_drive_only,
      showMaterialsSection: item.show_materials_section ?? true,
      showMaterialLinksSection: item.show_material_links_section ?? true,
      showPdfsSection: item.show_pdfs_section ?? true,
      showVideosSection: item.show_videos_section ?? true
    }));
  },

  async getById(id: string): Promise<Material | null> {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    
    // تحويل أسماء الحقول من snake_case إلى camelCase
    return {
      ...data,
      titleAr: data.title_ar,
      departmentAr: data.department_ar,
      termAr: data.term_ar,
      bookLink: data.book_link,
      lecturesLink: data.lectures_link,
      googleDriveLink: data.google_drive_link,
      additionalLinks: data.additional_links,
      showGoogleDriveOnly: data.show_google_drive_only,
      showMaterialsSection: data.show_materials_section ?? true,
      showMaterialLinksSection: data.show_material_links_section ?? true,
      showPdfsSection: data.show_pdfs_section ?? true,
      showVideosSection: data.show_videos_section ?? true
    };
  },

  async add(material: Omit<Material, 'id' | 'created_at' | 'updated_at'>): Promise<Material> {
    try {
      console.log('🔄 Adding material to Supabase:', material);
      
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          title: material.title,
          title_ar: material.titleAr,
          code: material.code,
          department: material.department,
          department_ar: material.departmentAr,
          year: material.year,
          term: material.term,
          term_ar: material.termAr,
          description: material.description,
          book_link: material.bookLink,
          lectures_link: material.lecturesLink,
          google_drive_link: material.googleDriveLink,
          additional_links: material.additionalLinks,
          show_google_drive_only: material.showGoogleDriveOnly,
          show_materials_section: material.showMaterialsSection ?? true,
          show_material_links_section: material.showMaterialLinksSection ?? true,
          show_pdfs_section: material.showPdfsSection ?? true,
          show_videos_section: material.showVideosSection ?? true
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw new Error(`خطأ في إضافة المادة: ${error.message}`);
      }
      
      console.log('✅ Material added successfully:', data);
      
      // تحويل أسماء الحقول من snake_case إلى camelCase
      return {
        ...data,
        titleAr: data.title_ar,
        departmentAr: data.department_ar,
        termAr: data.term_ar
      };
    } catch (error) {
      console.error('❌ Error adding material:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Material>): Promise<Material> {
    try {
      console.log('🔄 Updating material in Supabase:', { id, updates });
      
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (updates.title) updateData.title = updates.title;
      if (updates.titleAr) updateData.title_ar = updates.titleAr;
      if (updates.code) updateData.code = updates.code;
      if (updates.department) updateData.department = updates.department;
      if (updates.departmentAr) updateData.department_ar = updates.departmentAr;
      if (updates.year) updateData.year = updates.year;
      if (updates.term) updateData.term = updates.term;
      if (updates.termAr) updateData.term_ar = updates.termAr;
      if (updates.description) updateData.description = updates.description;
      if (updates.bookLink !== undefined) updateData.book_link = updates.bookLink;
      if (updates.lecturesLink !== undefined) updateData.lectures_link = updates.lecturesLink;
      if (updates.googleDriveLink !== undefined) updateData.google_drive_link = updates.googleDriveLink;
      if (updates.additionalLinks !== undefined) updateData.additional_links = updates.additionalLinks;
      if (updates.showGoogleDriveOnly !== undefined) updateData.show_google_drive_only = updates.showGoogleDriveOnly;
      if (updates.showMaterialsSection !== undefined) updateData.show_materials_section = updates.showMaterialsSection;
      if (updates.showMaterialLinksSection !== undefined) updateData.show_material_links_section = updates.showMaterialLinksSection;
      if (updates.showPdfsSection !== undefined) updateData.show_pdfs_section = updates.showPdfsSection;
      if (updates.showVideosSection !== undefined) updateData.show_videos_section = updates.showVideosSection;
      
      const { data, error } = await supabase
        .from('materials')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase update error:', error);
        throw new Error(`خطأ في تحديث المادة: ${error.message}`);
      }
      
      console.log('✅ Material updated successfully:', data);
      
      // تحويل أسماء الحقول من snake_case إلى camelCase
      return {
        ...data,
        titleAr: data.title_ar,
        departmentAr: data.department_ar,
        termAr: data.term_ar,
        bookLink: data.book_link,
        lecturesLink: data.lectures_link,
        googleDriveLink: data.google_drive_link,
        additionalLinks: data.additional_links,
        showGoogleDriveOnly: data.show_google_drive_only
      };
    } catch (error) {
      console.error('❌ Error updating material:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// خدمة PDFs - بدون Storage
export const pdfsService = {
  async getAll(): Promise<Pdf[]> {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Pdf | null> {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async getByMaterialId(materialId: string): Promise<Pdf[]> {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async add(pdf: Omit<Pdf, 'id' | 'created_at' | 'updated_at'>, file?: File): Promise<Pdf> {
    let fileUrl = '';
    let fileName = '';
    let fileData = '';

    if (file) {
      try {
        console.log('📤 Converting file to Base64...', file.name);
        fileData = await fileToBase64(file);
        fileUrl = base64ToUrl(fileData);
        fileName = file.name;
        console.log('✅ File converted to Base64');
      } catch (error) {
        console.error('❌ File conversion failed:', error);
        throw new Error(`فشل في تحويل الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }
    
    const { data, error } = await supabase
      .from('pdfs')
      .insert([{
        ...pdf,
        file_url: fileUrl,
        file_name: fileName,
        file_data: fileData
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Pdf>, file?: File): Promise<Pdf> {
    let fileUrl = updates.file_url;
    let fileName = updates.file_name;
    let fileData = '';

    if (file) {
      try {
        console.log('📤 Converting new file to Base64...', file.name);
        fileData = await fileToBase64(file);
        fileUrl = base64ToUrl(fileData);
        fileName = file.name;
        console.log('✅ New file converted to Base64');
      } catch (error) {
        console.error('❌ File conversion failed:', error);
        throw new Error(`فشل في تحويل الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }
    
    const { data, error } = await supabase
      .from('pdfs')
      .update({ 
        ...updates, 
        file_url: fileUrl,
        file_name: fileName,
        file_data: fileData,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pdfs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// خدمة الفيديوهات
export const videosService = {
  async getAll(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Video | null> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async getByMaterialId(materialId: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('material_id', materialId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async add(video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> {
    const { data, error } = await supabase
      .from('videos')
      .insert([video])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

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

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// خدمة المستخدمين
export const usersService = {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  },

  async add(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

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

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
