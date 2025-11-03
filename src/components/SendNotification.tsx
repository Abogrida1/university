'use client';

import { useState, useEffect } from 'react';
import { notificationsService, CreateNotificationData } from '@/lib/notificationsService';
import { useUser } from '@/lib/UserContext';

interface SendNotificationProps {
  onSuccess?: () => void;
}

export default function SendNotification({ onSuccess }: SendNotificationProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateNotificationData>({
    title: '',
    message: '',
    type: 'info',
    scheduled_for: null
  });
  const [sendTo, setSendTo] = useState<'all' | 'specific'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // التحقق من أن المستخدم هو super_admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      setErrorMessage('فقط المدير الرئيسي يمكنه إرسال الإشعارات');
    }
  }, [user]);

  // جلب المستخدمين عند فتح المكون
  useEffect(() => {
    if (user && user.role === 'super_admin' && sendTo === 'specific') {
      loadUsers();
    }
  }, [user, sendTo]);

  const loadUsers = async () => {
    if (!user) return;
    
    setLoadingUsers(true);
    try {
      const result = await notificationsService.getAllUsersForNotifications(user.id);
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setErrorMessage(result.error || 'فشل في جلب المستخدمين');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setErrorMessage('خطأ في جلب المستخدمين');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'super_admin') {
      setErrorMessage('فقط المدير الرئيسي يمكنه إرسال الإشعارات');
      return;
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      setErrorMessage('الرجاء إدخال العنوان والرسالة');
      return;
    }

    if (sendTo === 'specific' && !selectedUserId) {
      setErrorMessage('الرجاء اختيار مستخدم');
      return;
    }

    if (scheduleType === 'scheduled' && !scheduledDateTime) {
      setErrorMessage('الرجاء اختيار تاريخ ووقت الإرسال');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const notificationData: CreateNotificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        user_id: sendTo === 'specific' ? selectedUserId : undefined,
        scheduled_for: scheduleType === 'scheduled' ? new Date(scheduledDateTime).toISOString() : null
      };

      const result = await notificationsService.createNotification(notificationData, user.id);

      if (result.success) {
        setSuccessMessage(
          scheduleType === 'scheduled'
            ? 'تم جدولة الإشعار بنجاح'
            : sendTo === 'all'
            ? 'تم إرسال الإشعار لجميع المستخدمين بنجاح'
            : 'تم إرسال الإشعار بنجاح'
        );
        
        // إعادة تعيين النموذج
        setFormData({
          title: '',
          message: '',
          type: 'info',
          scheduled_for: null
        });
        setSelectedUserId('');
        setScheduleType('now');
        setScheduledDateTime('');

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrorMessage(result.error || 'فشل في إرسال الإشعار');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      setErrorMessage(error.message || 'حدث خطأ أثناء إرسال الإشعار');
    } finally {
      setLoading(false);
    }
  };

  // إذا لم يكن المستخدم super_admin، لا نعرض المكون
  if (!user || user.role !== 'super_admin') {
    return null;
  }

  // حساب الحد الأدنى للتاريخ والوقت (الآن)
  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        إرسال إشعار للمستخدمين
      </h2>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 rounded">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* نوع الإرسال */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الإرسال إلى:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="all"
                checked={sendTo === 'all'}
                onChange={(e) => setSendTo(e.target.value as 'all' | 'specific')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">جميع المستخدمين</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="specific"
                checked={sendTo === 'specific'}
                onChange={(e) => setSendTo(e.target.value as 'all' | 'specific')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">مستخدم محدد</span>
            </label>
          </div>
        </div>

        {/* اختيار المستخدم */}
        {sendTo === 'specific' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اختر المستخدم:
            </label>
            {loadingUsers ? (
              <div className="text-gray-500 dark:text-gray-400">جاري تحميل المستخدمين...</div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required={sendTo === 'specific'}
              >
                <option value="">-- اختر مستخدم --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email}) {user.department ? `- ${user.department}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* نوع الإشعار */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نوع الإشعار:
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="info">معلومات</option>
            <option value="success">نجاح</option>
            <option value="warning">تحذير</option>
            <option value="error">خطأ</option>
            <option value="update">تحديث</option>
            <option value="announcement">إعلان</option>
          </select>
        </div>

        {/* العنوان */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            العنوان: *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="عنوان الإشعار"
            required
          />
        </div>

        {/* الرسالة */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الرسالة: *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={5}
            placeholder="محتوى الإشعار"
            required
          />
        </div>

        {/* جدولة الإرسال */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            وقت الإرسال:
          </label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center">
              <input
                type="radio"
                value="now"
                checked={scheduleType === 'now'}
                onChange={(e) => setScheduleType(e.target.value as 'now' | 'scheduled')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">إرسال الآن</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="scheduled"
                checked={scheduleType === 'scheduled'}
                onChange={(e) => setScheduleType(e.target.value as 'now' | 'scheduled')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">جدولة لوقت محدد</span>
            </label>
          </div>

          {scheduleType === 'scheduled' && (
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
              min={minDateTime}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required={scheduleType === 'scheduled'}
            />
          )}
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'جاري الإرسال...' : scheduleType === 'scheduled' ? 'جدولة الإشعار' : 'إرسال الإشعار'}
        </button>
      </form>
    </div>
  );
}
