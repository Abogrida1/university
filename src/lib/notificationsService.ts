import { supabase } from './supabase';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'announcement' | 'warning' | 'info';
  target_user_id: string | null; // null = لجميع المستخدمين
  is_read: boolean;
  created_by: string | null;
  scheduled_at: string | null; // تاريخ الإرسال المجدول
  created_at: string;
  read_at: string | null;
  expires_at: string | null;
  created_by_name?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: 'update' | 'announcement' | 'warning' | 'info';
  target_user_id?: string | null; // null = لجميع المستخدمين
  scheduled_at?: string | null; // تاريخ الإرسال المجدول
  expires_at?: string | null;
}

class NotificationsService {
  // إنشاء إشعار جديد (للمدير الرئيسي فقط)
  async create(data: CreateNotificationData, createdBy: string): Promise<UserNotification> {
    try {
      const notificationData = {
        title: data.title,
        message: data.message,
        type: data.type || 'update',
        target_user_id: data.target_user_id || null,
        created_by: createdBy,
        scheduled_at: data.scheduled_at || null,
        expires_at: data.expires_at || null,
      };

      const { data: notification, error } = await supabase
        .from('user_notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw new Error(`فشل في إنشاء الإشعار: ${error.message}`);
      }

      return notification;
    } catch (error) {
      console.error('Error in create method:', error);
      throw error;
    }
  }

  // جلب إشعارات المستخدم
  // جلب إشعارات المستخدم
  async getUserNotifications(userId: string, limit?: number, ignoredIds: string[] = []): Promise<UserNotification[]> {
    try {
      // جلب الإشعارات الموجهة للمستخدم أو للجميع
      let query = supabase
        .from('user_notifications')
        .select('*')
        .or(`target_user_id.eq.${userId},target_user_id.is.null`)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: notifications, error } = await query;

      if (error) {
        console.error('Error fetching user notifications:', error);
        throw new Error(`فشل في جلب الإشعارات: ${error.message}`);
      }

      // تصفية الإشعارات:
      // 1. المنتهية الصلاحية
      // 2. التي لم يحن وقت إرسالها بعد (scheduled_at في المستقبل)
      // 3. التي تم تجاهلها محلياً (ignoredIds)
      const now = new Date();
      const validNotifications = notifications?.filter(notif => {
        // تصفية الإشعارات المحذوفة محلياً (broadcasts)
        if (ignoredIds.includes(notif.id)) {
          return false;
        }

        // تصفية الإشعارات المجدولة (التي لم يحن وقتها بعد)
        if (notif.scheduled_at && new Date(notif.scheduled_at) > now) {
          return false;
        }

        // تصفية الإشعارات المنتهية الصلاحية
        if (notif.expires_at && new Date(notif.expires_at) < now) {
          return false;
        }

        return true;
      }) || [];

      return validNotifications;
    } catch (error) {
      console.error('Error in getUserNotifications method:', error);
      throw error;
    }
  }

  // جلب إشعارات غير مقروءة فقط
  async getUnreadNotifications(userId: string): Promise<UserNotification[]> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(notif => !notif.is_read);
    } catch (error) {
      console.error('Error in getUnreadNotifications method:', error);
      throw error;
    }
  }

  // تحديد إشعار كمقروء
  async markAsRead(notificationId: string, userId: string): Promise<UserNotification> {
    try {
      // التأكد من أن الإشعار خاص بهذا المستخدم
      const { data: notification, error: fetchError } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (fetchError || !notification) {
        throw new Error('الإشعار غير موجود');
      }

      // التحقق من أن الإشعار خاص بهذا المستخدم أو للجميع
      if (notification.target_user_id && notification.target_user_id !== userId) {
        throw new Error('غير مصرح لك بقراءة هذا الإشعار');
      }

      const { data: updated, error } = await supabase
        .from('user_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        console.error('Error marking notification as read:', error);
        throw new Error(`فشل في تحديث حالة الإشعار: ${error.message}`);
      }

      return updated;
    } catch (error) {
      console.error('Error in markAsRead method:', error);
      throw error;
    }
  }

  // تحديد جميع إشعارات المستخدم كمقروءة
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .or(`target_user_id.eq.${userId},target_user_id.is.null`)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw new Error(`فشل في تحديث الإشعارات: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in markAllAsRead method:', error);
      throw error;
    }
  }

  // جلب جميع الإشعارات (للمدير الرئيسي)
  async getAll(): Promise<UserNotification[]> {
    try {
      const { data: notifications, error } = await supabase
        .from('user_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all notifications:', error);
        throw new Error(`فشل في جلب الإشعارات: ${error.message}`);
      }

      return notifications || [];
    } catch (error) {
      console.error('Error in getAll method:', error);
      throw error;
    }
  }

  // حذف إشعار (للمدير الرئيسي فقط)
  async delete(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw new Error(`فشل في حذف الإشعار: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in delete method:', error);
      throw error;
    }
  }

  // جلب إحصائيات الإشعارات
  async getStats(): Promise<{
    total: number;
    unread: number;
    read: number;
    byType: {
      update: number;
      announcement: number;
      warning: number;
      info: number;
    };
  }> {
    try {
      const notifications = await this.getAll();

      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.is_read).length,
        read: notifications.filter(n => n.is_read).length,
        byType: {
          update: notifications.filter(n => n.type === 'update').length,
          announcement: notifications.filter(n => n.type === 'announcement').length,
          warning: notifications.filter(n => n.type === 'warning').length,
          info: notifications.filter(n => n.type === 'info').length,
        }
      };

      return stats;
    } catch (error) {
      console.error('Error in getStats method:', error);
      throw error;
    }
  }

  // حذف إشعار شخصي (للمستخدم العادي)
  async deletePersonal(notificationId: string, userId: string): Promise<boolean> {
    try {
      // 1. التحقق من أن الإشعار يخص المستخدم فعلاً
      const { data: notification, error: fetchError } = await supabase
        .from('user_notifications')
        .select('target_user_id')
        .eq('id', notificationId)
        .single();

      if (fetchError || !notification) {
        throw new Error('الإشعار غير موجود');
      }

      if (notification.target_user_id !== userId) {
        // إذا لم يكن موجهاً للمستخدم (أي أنه عام/للجميع)، لا يمكن حذفه من قاعدة البيانات
        return false;
      }

      // 2. حذف الإشعار
      const { error: deleteError } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('target_user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePersonal method:', error);
      throw error;
    }
  }

  // الاشتراك في التحديثات الحية
  subscribe(userId: string, onNotification: (payload: any) => void) {
    const subscription = supabase
      .channel('public:user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
        },
        (payload) => {
          const newNotification = payload.new as UserNotification;
          // تصفية الإشعارات: هل هي للمستخدم أو للجميع؟
          if (!newNotification.target_user_id || newNotification.target_user_id === userId) {
            // التحقق من تاريخ النشر (للمجدولة)
            if (newNotification.scheduled_at) {
              const scheduledTime = new Date(newNotification.scheduled_at).getTime();
              const now = new Date().getTime();
              // إذا كان الوقت في المستقبل، لا نعرضه الآن (سيتم جلبه لاحقاً أو يمكن عمل آلية أخرى، 
              // لكن للتنبيه الفوري يفضل أن نعتمد على الفلترة في الواجهة أيضاً أو تجاهله هنا)
              if (scheduledTime > now) return;
            }
            onNotification(newNotification);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  // جلب عدد الإشعارات غير المقروءة للمستخدم
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const unread = await this.getUnreadNotifications(userId);
      return unread.length;
    } catch (error) {
      console.error('Error in getUnreadCount method:', error);
      return 0;
    }
  }
  // جلب جميع المستخدمين للإشعارات
  async getAllUsersForNotifications(adminId: string): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, email, department, role')
        .order('name');

      if (error) {
        throw error;
      }

      return { success: true, users };
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }
  }
}

export const notificationsService = new NotificationsService();

