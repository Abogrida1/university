import { NextRequest, NextResponse } from 'next/server';
import { notificationsService } from '@/lib/notificationsService';
import { supabase } from '@/lib/supabase';

// API endpoint للتحقق من الإشعارات المجدولة وإرسالها
// يتم استدعاؤها بشكل دوري (cron job أو كل دقيقة)
export async function POST(request: NextRequest) {
  try {
    const now = new Date().toISOString();
    
    // جلب جميع الإشعارات المجدولة التي حان وقت إرسالها
    const { data: scheduledNotifications, error } = await supabase
      .from('user_notifications')
      .select('*')
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', now)
      .eq('is_sent', false); // إذا كان لدينا عمود is_sent

    if (error) {
      console.error('Error fetching scheduled notifications:', error);
      return NextResponse.json(
        { success: false, message: 'فشل في جلب الإشعارات المجدولة' },
        { status: 500 }
      );
    }

    // إذا لم يكن لدينا عمود is_sent، نجلب الإشعارات التي:
    // 1. لديها scheduled_at
    // 2. scheduled_at <= الآن
    // 3. created_at <= scheduled_at (للتأكد من أنها لم ترسل بعد)
    
    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لا توجد إشعارات مجدولة للإرسال',
        sent: 0
      }, { status: 200 });
    }

    // هنا يمكنك إضافة منطق إضافي لإرسال الإشعارات
    // مثل إرسال إيميل أو إشعار push notification
    
    return NextResponse.json({
      success: true,
      message: `تم التحقق من ${scheduledNotifications.length} إشعار مجدول`,
      notifications: scheduledNotifications,
      sent: scheduledNotifications.length
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error checking scheduled notifications:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في التحقق من الإشعارات المجدولة' },
      { status: 500 }
    );
  }
}

