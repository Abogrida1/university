import { NextRequest, NextResponse } from 'next/server';
import { notificationsService } from '@/lib/notificationsService';
import { supabase } from '@/lib/supabase';

// GET - جلب إشعارات المستخدم أو جميع الإشعارات (للأدمن)
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const adminId = request.headers.get('x-admin-id');
    const isAdminRequest = request.nextUrl.searchParams.get('all') === 'true';

    // إذا كان طلب من الأدمن لجلب جميع الإشعارات
    if (isAdminRequest && adminId) {
      // التحقق من أن المستخدم هو super admin
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('role')
        .eq('id', adminId)
        .single();

      if (adminError || !adminData || adminData.role !== 'super_admin') {
        return NextResponse.json(
          { success: false, message: 'غير مصرح لك بجلب جميع الإشعارات' },
          { status: 403 }
        );
      }

      const allNotifications = await notificationsService.getAll();
      return NextResponse.json({
        success: true,
        data: allNotifications
      }, { status: 200 });
    }

    // طلب عادي من المستخدم
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير معروف' },
        { status: 401 }
      );
    }

    const notifications = await notificationsService.getUserNotifications(userId);
    const unreadCount = await notificationsService.getUnreadCount(userId);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في جلب الإشعارات' },
      { status: 500 }
    );
  }
}

// POST - إنشاء إشعار جديد (للمدير الرئيسي فقط)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, target_user_id, scheduled_at, expires_at } = body;
    const createdBy = request.headers.get('x-admin-id');

    if (!createdBy) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإنشاء إشعارات' },
        { status: 401 }
      );
    }

    // التحقق من أن المستخدم هو super admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', createdBy)
      .single();

    if (adminError || !adminData || adminData.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, message: 'غير مصرح لك بإنشاء إشعارات - يجب أن تكون مدير رئيسي' },
        { status: 403 }
      );
    }

    // التحقق من البيانات المطلوبة
    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'العنوان والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    const notification = await notificationsService.create({
      title,
      message,
      type: type || 'update',
      target_user_id: target_user_id || null,
      scheduled_at: scheduled_at || null,
      expires_at: expires_at || null,
    }, createdBy);

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الإشعار بنجاح',
      data: notification
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'حدث خطأ في إنشاء الإشعار' },
      { status: 500 }
    );
  }
}

