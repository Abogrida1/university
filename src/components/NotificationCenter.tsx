'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/UserContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'announcement' | 'warning' | 'info';
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      loadNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setNotifications(result.data.notifications || []);
          setUnreadCount(result.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ action: 'mark-read' }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications/all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  if (!user) return null;

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <>
      {/* Notification Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
        aria-label="الإشعارات"
      >
        <svg
          className="w-6 h-6 text-gray-700 dark:text-gray-300"
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
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:!bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:!border-gray-700 z-[9999] max-h-[500px] flex flex-col backdrop-blur-sm notification-panel">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <h3 className="font-bold text-gray-900 dark:text-white">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  جاري التحميل...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-500 dark:text-gray-400">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const iconMap = {
                      update: '🆕',
                      announcement: '📢',
                      warning: '⚠️',
                      info: 'ℹ️',
                    };
                    const colorMap = {
                      update: 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700/50',
                      announcement: 'bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-700/50',
                      warning: 'bg-yellow-50 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-700/50',
                      info: 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700/50',
                    };

                    return (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 notification-item ${
                          !notification.is_read
                            ? 'bg-blue-50/80 dark:!bg-blue-900/20 border-l-blue-500 dark:!border-l-blue-400 shadow-sm notification-item-unread'
                            : 'bg-white dark:!bg-gray-900 border-l-transparent notification-item-read'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 ${
                              colorMap[notification.type]
                            }`}
                          >
                            {iconMap[notification.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4
                                className={`font-bold text-sm ${
                                  !notification.is_read
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:!text-gray-400 mt-2 font-medium">
                              {new Date(notification.created_at).toLocaleString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {unreadCount > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <button
                  onClick={markAllAsRead}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-yellow-500 dark:to-yellow-600 hover:from-blue-600 hover:to-blue-700 dark:hover:from-yellow-600 dark:hover:to-yellow-700 text-white dark:text-black rounded-lg font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  تحديد الكل كمقروء
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

