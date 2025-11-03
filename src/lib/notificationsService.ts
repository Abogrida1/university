import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'update' | 'announcement';
  is_read: boolean;
  created_by: string | null;
  created_by_name?: string;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  user_id?: string; // إذا كان null، يتم إرسالها لجميع المستخدمين
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'update' | 'announcement';
  scheduled_for?: string | null; // ISO date string أو null للإرسال الفوري
}

class NotificationsService {
  /**
   * إنشاء إشعار جديد
   * فقط super_admin يمكنه إنشاء الإشعارات
   */
  async createNotification(
    data: CreateNotificationData,
    createdBy: string
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      // التحقق من أن المنشئ هو super_admin
      const { data: creator, error: creatorError } = await supabase
        .from('users')
        .select('role')
        .eq('id', createdBy)
        .single();

      if (creatorError || !creator || creator.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه إرسال الإشعارات' };
      }

      // إذا كان user_id محدداً، أرسل لمستخدم واحد
      if (data.user_id) {
        const notificationData: any = {
          user_id: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          created_by: createdBy,
          scheduled_for: data.scheduled_for || null,
          sent_at: data.scheduled_for ? null : new Date().toISOString()
        };

        const { data: notification, error } = await supabase
          .from('notifications')
          .insert([notificationData])
          .select()
          .single();

        if (error) {
          console.error('Error creating notification:', error);
          return { success: false, error: `فشل في إنشاء الإشعار: ${error.message}` };
        }

        return { success: true, notificationId: notification.id };
      } else {
        // إرسال لجميع المستخدمين النشطين
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id')
          .eq('is_active', true)
          .neq('role', 'super_admin'); // استثناء super_admin من تلقي الإشعارات

        if (usersError) {
          console.error('Error fetching users:', usersError);
          return { success: false, error: 'فشل في جلب المستخدمين' };
        }

        if (!users || users.length === 0) {
          return { success: false, error: 'لا يوجد مستخدمون لإرسال الإشعارات لهم' };
        }

        const notifications = users.map(user => ({
          user_id: user.id,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          created_by: createdBy,
          scheduled_for: data.scheduled_for || null,
          sent_at: data.scheduled_for ? null : new Date().toISOString()
        }));

        const { data: createdNotifications, error } = await supabase
          .from('notifications')
          .insert(notifications)
          .select();

        if (error) {
          console.error('Error creating notifications:', error);
          return { success: false, error: `فشل في إنشاء الإشعارات: ${error.message}` };
        }

        return { success: true, notificationId: createdNotifications?.[0]?.id };
      }
    } catch (error: any) {
      console.error('Error in createNotification:', error);
      return { success: false, error: error.message || 'خطأ غير متوقع' };
    }
  }

  /**
   * جلب إشعارات المستخدم
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          created_by_user:users!notifications_created_by_fkey(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        message: item.message,
        type: item.type,
        is_read: item.is_read,
        created_by: item.created_by,
        created_by_name: item.created_by_user?.name,
        scheduled_for: item.scheduled_for,
        sent_at: item.sent_at,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  /**
   * جلب الإشعارات غير المقروءة
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_unread_notifications', { p_user_id: userId });

      if (error) {
        console.error('Error fetching unread notifications:', error);
        return [];
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        user_id: userId,
        title: item.title,
        message: item.message,
        type: item.type,
        is_read: false,
        created_by: null,
        created_by_name: item.created_by_name,
        scheduled_for: null,
        sent_at: null,
        created_at: item.created_at,
        updated_at: item.created_at
      }));
    } catch (error) {
      console.error('Error in getUnreadNotifications:', error);
      return [];
    }
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false)
        .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
        .or(`sent_at.not.is.null,scheduled_for.is.null`);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_as_read', {
          p_notification_id: notificationId,
          p_user_id: userId
        });

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_as_read', { p_user_id: userId });

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      return 0;
    }
  }

  /**
   * حذف إشعار
   * فقط super_admin يمكنه حذف الإشعارات
   */
  async deleteNotification(
    notificationId: string,
    deletedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // التحقق من أن الحاذف هو super_admin
      const { data: deleter, error: deleterError } = await supabase
        .from('users')
        .select('role')
        .eq('id', deletedBy)
        .single();

      if (deleterError || !deleter || deleter.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه حذف الإشعارات' };
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return { success: false, error: `فشل في حذف الإشعار: ${error.message}` };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteNotification:', error);
      return { success: false, error: error.message || 'خطأ غير متوقع' };
    }
  }

  /**
   * جلب جميع المستخدمين لإرسال الإشعارات لهم
   * فقط super_admin يمكنه استخدام هذه الدالة
   */
  async getAllUsersForNotifications(adminId: string): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      // التحقق من أن الطالب هو super_admin
      const { data: admin, error: adminError } = await supabase
        .from('users')
        .select('role')
        .eq('id', adminId)
        .single();

      if (adminError || !admin || admin.role !== 'super_admin') {
        return { success: false, error: 'فقط المدير الرئيسي يمكنه جلب المستخدمين' };
      }

      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, role, department, year, term')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: 'فشل في جلب المستخدمين' };
      }

      return { success: true, users: users || [] };
    } catch (error: any) {
      console.error('Error in getAllUsersForNotifications:', error);
      return { success: false, error: error.message || 'خطأ غير متوقع' };
    }
  }
}

export const notificationsService = new NotificationsService();
