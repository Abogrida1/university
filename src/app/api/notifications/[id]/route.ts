import { NextRequest, NextResponse } from 'next/server';
import { notificationsService } from '@/lib/notificationsService';

// PUT - تحديد إشعار كمقروء
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { action } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير معروف' },
        { status: 401 }
      );
    }

    if (action === 'mark-read') {
      const notification = await notificationsService.markAsRead(params.id, userId);
      return NextResponse.json({
        success: true,
        message: 'تم تحديد الإشعار كمقروء',
        data: notification
      }, { status: 200 });
    }

    if (action === 'mark-all-read') {
      await notificationsService.markAllAsRead(userId);
      return NextResponse.json({
        success: true,
        message: 'تم تحديد جميع الإشعارات كمقروءة'
      }, { status: 200 });
    }

    return NextResponse.json(
      { success: false, message: 'عملية غير معروفة' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في تحديث الإشعار' },
      { status: 500 }
    );
  }
}

// DELETE - حذف إشعار (للمدير الرئيسي فقط)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminId = request.headers.get('x-admin-id');

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بحذف الإشعارات' },
        { status: 401 }
      );
    }

    await notificationsService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإشعار بنجاح'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في حذف الإشعار' },
      { status: 500 }
    );
  }
}

