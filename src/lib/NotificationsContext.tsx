'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserNotification } from './notificationsService';
import { notificationsService } from './notificationsService';
import { useUser } from './UserContext';

interface NotificationsContextType {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        notificationsService.getUserNotifications(user.id, 50),
        notificationsService.getUnreadCount(user.id)
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    const success = await notificationsService.markAsRead(notificationId, user.id);
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    await notificationsService.markAllAsRead(user.id);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // تحديث الإشعارات عند تغيير المستخدم
  useEffect(() => {
    refreshNotifications();
  }, [user]);

  // تحديث الإشعارات بشكل دوري
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000); // كل 30 ثانية

    return () => clearInterval(interval);
  }, [user]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
