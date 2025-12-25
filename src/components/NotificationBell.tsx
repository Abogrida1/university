'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/lib/UserContext';
import { notificationsService, UserNotification } from '@/lib/notificationsService';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // جلب الإشعارات عند تغير المستخدم أو فتح القائمة
  useEffect(() => {
    if (user) {
      loadNotifications();

      // الاشتراك في التحديثات الحية
      const unsubscribe = notificationsService.subscribe(user.id, (newNotification) => {
        // عند وصول إشعار جديد
        // 1. تحديث العدد
        setUnreadCount(prev => prev + 1);

        // 2. إذا كانت القائمة مفتوحة، نضيف الإشعار للقائمة
        // أو يمكن ببساطة إعادة تحميل القائمة
        setNotifications(prev => [newNotification, ...prev]);

        // تشغيل صوت تنبيه بسيط (اختياري)
        // const audio = new Audio('/notification.mp3');
        // audio.play().catch(e => console.log('Audio play failed', e));
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIgnoredIds = () => {
    if (!user) return [];
    const stored = localStorage.getItem(`dismissed_notifications_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  };

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const ignoredIds = getIgnoredIds();
      const data = await notificationsService.getUserNotifications(user.id, 20, ignoredIds);
      setNotifications(data);

      // تحديث عدد غير المقروء
      const count = await notificationsService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notification: UserNotification) => {
    e.stopPropagation(); // منع فتح الإشعار عند النقر على الحذف
    if (!user) return;

    // تحديث الواجهة فوراً (Optimistic UI)
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
    if (!notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      if (notification.target_user_id === user.id) {
        // إشعار شخصي - حذف من قاعدة البيانات
        await notificationsService.deletePersonal(notification.id, user.id);
      } else {
        // إشعار عام - تجاهل محلياً
        const ignoredIds = getIgnoredIds();
        if (!ignoredIds.includes(notification.id)) {
          ignoredIds.push(notification.id);
          localStorage.setItem(`dismissed_notifications_${user.id}`, JSON.stringify(ignoredIds));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // إعادة تحميل القائمة في حالة الخطأ
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;

    const success = await notificationsService.markAsRead(notificationId, user.id);
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    await notificationsService.markAllAsRead(user.id);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'update':
        return '🔄';
      case 'announcement':
        return '📢';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
      case 'error':
        return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
      case 'update':
        return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
      case 'announcement':
        return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="الإشعارات"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* رأس القائمة */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              الإشعارات
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* قائمة الإشعارات */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                جاري التحميل...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                لا توجد إشعارات
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group relative ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-semibold ${!notification.is_read
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                              title="حذف الإشعار"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(notification.created_at)}
                          </span>
                          {notification.created_by_name && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              من: {notification.created_by_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
