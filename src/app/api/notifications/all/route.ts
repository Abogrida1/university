import { NextRequest, NextResponse } from 'next/server';
import { notificationsService } from '@/lib/notificationsService';

// PUT - تحديد جميع الإشعارات كمقروءة
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير معروف' },
        { status: 401 }
      );
    }

    await notificationsService.markAllAsRead(userId);

    return NextResponse.json({
      success: true,
      message: 'تم تحديد جميع الإشعارات كمقروءة'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في تحديث الإشعارات' },
      { status: 500 }
    );
  }
}

