import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

// أنواع البيانات
export interface AdminScope {
  id: string;
  userId: string;
  department: string | null;
  year: number | null;
  term: 'FIRST' | 'SECOND' | null;
  canManageMaterials: boolean;
  canManagePdfs: boolean;
  canManageVideos: boolean;
  canManageSchedules: boolean;
  canManageMessages: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canManageAdmins: boolean;
  description: string | null;
  grantedBy: string | null;
  grantedByName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  scopesCount: number;
  createdAt: string;
  scopes?: AdminScope[];
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
}

export interface CreateScopeData {
  userId: string;
  department?: string | null;
  year?: number | null;
  term?: 'FIRST' | 'SECOND' | null;
  canManageMaterials?: boolean;
  canManagePdfs?: boolean;
  canManageVideos?: boolean;
  canManageSchedules?: boolean;
  canManageMessages?: boolean;
  canViewAnalytics?: boolean;
  canManageUsers?: boolean;
  canManageAdmins?: boolean;
  description?: string;
  grantedBy: string;
}

export class AdminService {
  /**
   * إنشاء أدمن جديد
   */
  static async createAdmin(adminData: CreateAdminData, createdBy: string): Promise<{ success: boolean; adminId?: string; error?: string }> {
    try {
      // التحقق من أن المنشئ هو super_admin
      const { data: creator } = await supabase
        .from('users')
        .select('role')
        .eq('id', createdBy)
        .single();

      if (!creator || creator.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه إنشاء أدمنز' };
      }

      // التحقق من عدم وجود البريد الإلكتروني
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminData.email)
        .single();

      if (existingUser) {
        return { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' };
      }

      // تشفير كلمة المرور
      const passwordHash = await bcrypt.hash(adminData.password, 10);

      // إنشاء المستخدم
      const { data: newAdmin, error } = await supabase
        .from('users')
        .insert({
          email: adminData.email,
          password_hash: passwordHash,
          name: adminData.name,
          role: adminData.role,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('خطأ في إنشاء الأدمن:', error);
        return { success: false, error: 'خطأ في إنشاء الأدمن' };
      }

      // تسجيل النشاط
      await supabase
        .from('user_activities')
        .insert({
          user_id: createdBy,
          activity_type: 'create_admin',
          description: `إنشاء أدمن جديد: ${adminData.email}`,
          metadata: { admin_id: newAdmin.id, role: adminData.role }
        });

      return { success: true, adminId: newAdmin.id };
    } catch (error) {
      console.error('خطأ في إنشاء الأدمن:', error);
      return { success: false, error: 'خطأ في إنشاء الأدمن' };
    }
  }

  /**
   * إنشاء نطاق صلاحيات لأدمن
   */
  static async createAdminScope(scopeData: CreateScopeData): Promise<{ success: boolean; scopeId?: string; error?: string }> {
    try {
      // التحقق من أن المنشئ له صلاحية
      const { data: creator } = await supabase
        .from('users')
        .select('role')
        .eq('id', scopeData.grantedBy)
        .single();

      if (!creator || creator.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه منح الصلاحيات' };
      }

      // إنشاء النطاق
      const { data: scope, error } = await supabase
          .from('admin_scopes')
        .insert({
          user_id: scopeData.userId,
          department: scopeData.department || null,
          year: scopeData.year || null,
          term: scopeData.term || null,
          can_manage_materials: scopeData.canManageMaterials || false,
          can_manage_pdfs: scopeData.canManagePdfs || false,
          can_manage_videos: scopeData.canManageVideos || false,
          can_manage_schedules: scopeData.canManageSchedules || false,
          can_manage_messages: scopeData.canManageMessages || false,
          can_view_analytics: scopeData.canViewAnalytics || false,
          can_manage_users: scopeData.canManageUsers || false,
          can_manage_admins: scopeData.canManageAdmins || false,
          description: scopeData.description || null,
          granted_by: scopeData.grantedBy,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('خطأ في إنشاء الصلاحية:', error);
        return { success: false, error: 'خطأ في إنشاء الصلاحية' };
      }

      return { success: true, scopeId: scope.id };
    } catch (error) {
      console.error('خطأ في إنشاء الصلاحية:', error);
      return { success: false, error: 'خطأ في إنشاء الصلاحية' };
    }
  }

  /**
   * الحصول على جميع الأدمنز
   */
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_all_admins_with_scopes');

      if (error) {
        console.error('خطأ في الحصول على الأدمنز:', error);
        return [];
      }

      return data.map((admin: any) => ({
        id: admin.user_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active,
        scopesCount: admin.scopes_count,
        createdAt: admin.created_at
      }));
    } catch (error) {
      console.error('خطأ في الحصول على الأدمنز:', error);
      return [];
    }
  }

  /**
   * الحصول على صلاحيات أدمن معين
   */
  static async getAdminScopes(userId: string): Promise<AdminScope[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_admin_scopes', { p_user_id: userId });

      if (error) {
        console.error('خطأ في الحصول على الصلاحيات:', error);
        return [];
      }

      return data.map((scope: any) => ({
        id: scope.scope_id,
        userId: userId,
          department: scope.department,
          year: scope.year,
          term: scope.term,
        canManageMaterials: scope.can_manage_materials,
        canManagePdfs: scope.can_manage_pdfs,
        canManageVideos: scope.can_manage_videos,
        canManageSchedules: scope.can_manage_schedules,
        canManageMessages: scope.can_manage_messages,
        canViewAnalytics: scope.can_view_analytics,
        canManageUsers: scope.can_manage_users,
        canManageAdmins: scope.can_manage_admins,
        description: scope.description,
        grantedByName: scope.granted_by_name,
        isActive: scope.is_active,
        createdAt: scope.created_at,
        updatedAt: scope.created_at,
        grantedBy: null
      }));
    } catch (error) {
      console.error('خطأ في الحصول على الصلاحيات:', error);
      return [];
    }
  }

  /**
   * التحقق من صلاحية أدمن
   */
  static async checkAdminPermission(
    userId: string,
    permission: string,
    department?: string,
    year?: number,
    term?: 'FIRST' | 'SECOND'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('check_admin_permission', {
          p_user_id: userId,
          p_permission: permission,
          p_department: department || null,
          p_year: year || null,
          p_term: term || null
        });

      if (error) {
        console.error('خطأ في التحقق من الصلاحية:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('خطأ في التحقق من الصلاحية:', error);
      return false;
    }
  }

  /**
   * تحديث نطاق صلاحيات
   */
  static async updateAdminScope(
    scopeId: string,
    updates: Partial<CreateScopeData>,
    updatedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // التحقق من أن المحدّث له صلاحية
      const { data: updater } = await supabase
        .from('users')
        .select('role')
        .eq('id', updatedBy)
        .single();

      if (!updater || updater.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه تحديث الصلاحيات' };
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.department !== undefined) updateData.department = updates.department;
      if (updates.year !== undefined) updateData.year = updates.year;
      if (updates.term !== undefined) updateData.term = updates.term;
      if (updates.canManageMaterials !== undefined) updateData.can_manage_materials = updates.canManageMaterials;
      if (updates.canManagePdfs !== undefined) updateData.can_manage_pdfs = updates.canManagePdfs;
      if (updates.canManageVideos !== undefined) updateData.can_manage_videos = updates.canManageVideos;
      if (updates.canManageSchedules !== undefined) updateData.can_manage_schedules = updates.canManageSchedules;
      if (updates.canManageMessages !== undefined) updateData.can_manage_messages = updates.canManageMessages;
      if (updates.canViewAnalytics !== undefined) updateData.can_view_analytics = updates.canViewAnalytics;
      if (updates.canManageUsers !== undefined) updateData.can_manage_users = updates.canManageUsers;
      if (updates.canManageAdmins !== undefined) updateData.can_manage_admins = updates.canManageAdmins;
      if (updates.description !== undefined) updateData.description = updates.description;

      const { error } = await supabase
        .from('admin_scopes')
        .update(updateData)
        .eq('id', scopeId);

      if (error) {
        console.error('خطأ في تحديث الصلاحية:', error);
        return { success: false, error: 'خطأ في تحديث الصلاحية' };
      }

      return { success: true };
    } catch (error) {
      console.error('خطأ في تحديث الصلاحية:', error);
      return { success: false, error: 'خطأ في تحديث الصلاحية' };
    }
  }

  /**
   * حذف نطاق صلاحيات
   */
  static async deleteAdminScope(scopeId: string, deletedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      // التحقق من أن الحاذف له صلاحية
      const { data: deleter } = await supabase
        .from('users')
        .select('role')
        .eq('id', deletedBy)
        .single();

      if (!deleter || deleter.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه حذف الصلاحيات' };
      }

      const { error } = await supabase
        .from('admin_scopes')
        .delete()
        .eq('id', scopeId);

      if (error) {
        console.error('خطأ في حذف الصلاحية:', error);
        return { success: false, error: 'خطأ في حذف الصلاحية' };
      }

      return { success: true };
    } catch (error) {
      console.error('خطأ في حذف الصلاحية:', error);
      return { success: false, error: 'خطأ في حذف الصلاحية' };
    }
  }

  /**
   * تفعيل/إلغاء تفعيل أدمن
   */
  static async toggleAdminStatus(adminId: string, isActive: boolean, changedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      // التحقق من أن المغير له صلاحية
      const { data: changer } = await supabase
        .from('users')
        .select('role')
        .eq('id', changedBy)
        .single();

      if (!changer || changer.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه تغيير حالة الأدمن' };
      }

      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', adminId);

      if (error) {
        console.error('خطأ في تغيير حالة الأدمن:', error);
        return { success: false, error: 'خطأ في تغيير حالة الأدمن' };
      }

      // تسجيل النشاط
      await supabase
        .from('user_activities')
        .insert({
          user_id: changedBy,
          activity_type: isActive ? 'activate_admin' : 'deactivate_admin',
          description: `${isActive ? 'تفعيل' : 'إلغاء تفعيل'} أدمن`,
          metadata: { admin_id: adminId }
        });

      return { success: true };
    } catch (error) {
      console.error('خطأ في تغيير حالة الأدمن:', error);
      return { success: false, error: 'خطأ في تغيير حالة الأدمن' };
    }
  }

  /**
   * حذف أدمن
   */
  static async deleteAdmin(adminId: string, deletedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      // التحقق من أن الحاذف له صلاحية
      const { data: deleter } = await supabase
        .from('users')
        .select('role')
        .eq('id', deletedBy)
        .single();

      if (!deleter || deleter.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه حذف الأدمنز' };
      }

      // التأكد من عدم حذف نفسه
      if (adminId === deletedBy) {
        return { success: false, error: 'لا يمكنك حذف حسابك الخاص' };
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error('خطأ في حذف الأدمن:', error);
        return { success: false, error: 'خطأ في حذف الأدمن' };
      }

      // تسجيل النشاط
      await supabase
        .from('user_activities')
        .insert({
          user_id: deletedBy,
          activity_type: 'delete_admin',
          description: 'حذف أدمن',
          metadata: { admin_id: adminId }
        });

      return { success: true };
    } catch (error) {
      console.error('خطأ في حذف الأدمن:', error);
      return { success: false, error: 'خطأ في حذف الأدمن' };
    }
  }

  /**
   * الحصول على سجل تغييرات الصلاحيات
   */
  static async getAdminScopeAudit(scopeId?: string, userId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('admin_scope_audit')
        .select(`
          *,
          users!admin_scope_audit_performed_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (scopeId) {
        query = query.eq('scope_id', scopeId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('خطأ في الحصول على سجل التغييرات:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('خطأ في الحصول على سجل التغييرات:', error);
      return [];
    }
  }
}

