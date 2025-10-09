import { AdminService } from './adminService';

/**
 * نظام التحقق من الصلاحيات للأدمنز
 * Permission Checker System for Admins
 */

export interface PermissionContext {
  userId: string;
  userRole: 'super_admin' | 'admin' | 'student';
  department?: string;
  year?: number;
  term?: 'FIRST' | 'SECOND';
}

export class PermissionChecker {
  /**
   * التحقق من صلاحية إدارة المواد
   */
  static async canManageMaterials(context: PermissionContext): Promise<boolean> {
    if (context.userRole === 'super_admin') return true;
    if (context.userRole !== 'admin') return false;

    return await AdminService.checkAdminPermission(
      context.userId,
      'can_manage_materials',
      context.department,
      context.year,
      context.term
    );
  }

  /**
   * التحقق من صلاحية إدارة ملفات PDF
   */
  static async canManagePdfs(context: PermissionContext): Promise<boolean> {
    if (context.userRole === 'super_admin') return true;
    if (context.userRole !== 'admin') return false;

    return await AdminService.checkAdminPermission(
      context.userId,
      'can_manage_pdfs',
      context.department,
      context.year,
      context.term
    );
  }

  /**
   * التحقق من صلاحية إدارة الفيديوهات
   */
  static async canManageVideos(context: PermissionContext): Promise<boolean> {
    if (context.userRole === 'super_admin') return true;
    if (context.userRole !== 'admin') return false;

    return await AdminService.checkAdminPermission(
      context.userId,
      'can_manage_videos',
      context.department,
      context.year,
      context.term
    );
  }

  /**
   * التحقق من صلاحية إدارة الجداول
   */
  static async canManageSchedules(context: PermissionContext): Promise<boolean> {
    if (context.userRole === 'super_admin') return true;
    if (context.userRole !== 'admin') return false;

    return await AdminService.checkAdminPermission(
      context.userId,
      'can_manage_schedules',
      context.department,
      context.year,
      context.term
    );
  }

  /**
   * التحقق من صلاحية إدارة الرسائل
   */
  static async canManageMessages(context: PermissionContext): Promise<boolean> {
    if (context.userRole === 'super_admin') return true;
    if (context.userRole !== 'admin') return false;

    return await AdminService.checkAdminPermission(
      context.userId,
      'can_manage_messages',
      context.department,
      context.year,
      context.term
    );
  }

  /**
   * التحقق من صلاحية عرض الإحصائيات
   */
  static async canViewAnalytics(context: PermissionContext): Promise<boolean> {
    if (context.userRole === 'super_admin') return true;
    if (context.userRole !== 'admin') return false;

    return await AdminService.checkAdminPermission(
      context.userId,
      'can_view_analytics',
      context.department,
      context.year,
      context.term
    );
  }

  /**
   * التحقق من صلاحية إدارة المستخدمين
   */
  static async canManageUsers(context: PermissionContext): Promise<boolean> {
    if (context.userRole === 'super_admin') return true;
    if (context.userRole !== 'admin') return false;

    return await AdminService.checkAdminPermission(
      context.userId,
      'can_manage_users',
      context.department,
      context.year,
      context.term
    );
  }

  /**
   * التحقق من صلاحية إدارة الأدمنز
   */
  static async canManageAdmins(context: PermissionContext): Promise<boolean> {
    // فقط السوبر أدمن يمكنه إدارة الأدمنز
    return context.userRole === 'super_admin';
  }

  /**
   * التحقق من جميع الصلاحيات دفعة واحدة
   */
  static async getAllPermissions(context: PermissionContext): Promise<{
    canManageMaterials: boolean;
    canManagePdfs: boolean;
    canManageVideos: boolean;
    canManageSchedules: boolean;
    canManageMessages: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
    canManageAdmins: boolean;
  }> {
    // السوبر أدمن له جميع الصلاحيات
    if (context.userRole === 'super_admin') {
      return {
        canManageMaterials: true,
        canManagePdfs: true,
        canManageVideos: true,
        canManageSchedules: true,
        canManageMessages: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canManageAdmins: true
      };
    }

    // الطلاب ليس لديهم صلاحيات
    if (context.userRole === 'student') {
      return {
        canManageMaterials: false,
        canManagePdfs: false,
        canManageVideos: false,
        canManageSchedules: false,
        canManageMessages: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canManageAdmins: false
      };
    }

    // للأدمنز، نتحقق من كل صلاحية على حدة
    const [
      canManageMaterials,
      canManagePdfs,
      canManageVideos,
      canManageSchedules,
      canManageMessages,
      canViewAnalytics,
      canManageUsers,
      canManageAdmins
    ] = await Promise.all([
      this.canManageMaterials(context),
      this.canManagePdfs(context),
      this.canManageVideos(context),
      this.canManageSchedules(context),
      this.canManageMessages(context),
      this.canViewAnalytics(context),
      this.canManageUsers(context),
      this.canManageAdmins(context)
    ]);

    return {
      canManageMaterials,
      canManagePdfs,
      canManageVideos,
      canManageSchedules,
      canManageMessages,
      canViewAnalytics,
      canManageUsers,
      canManageAdmins
    };
  }

  /**
   * التحقق من الصلاحية لعنصر معين
   * يأخذ في الاعتبار القسم والسنة والترم للعنصر
   */
  static async canManageItem(
    context: PermissionContext,
    permissionType: 'materials' | 'pdfs' | 'videos' | 'schedules' | 'messages',
    itemDepartment?: string,
    itemYear?: number,
    itemTerm?: 'FIRST' | 'SECOND'
  ): Promise<boolean> {
    const itemContext: PermissionContext = {
      ...context,
      department: itemDepartment,
      year: itemYear,
      term: itemTerm
    };

    switch (permissionType) {
      case 'materials':
        return await this.canManageMaterials(itemContext);
      case 'pdfs':
        return await this.canManagePdfs(itemContext);
      case 'videos':
        return await this.canManageVideos(itemContext);
      case 'schedules':
        return await this.canManageSchedules(itemContext);
      case 'messages':
        return await this.canManageMessages(itemContext);
      default:
        return false;
    }
  }
}

