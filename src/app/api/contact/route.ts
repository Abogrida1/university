import { NextRequest, NextResponse } from 'next/server';
import { messagesService } from '@/lib/messagesService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // التحقق من صحة البيانات
    if (!type || !data) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'بيانات غير صحيحة' 
        },
        { status: 400 }
      );
    }

    // التحقق من نوع الرسالة
    if (type !== 'contact' && type !== 'join') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'نوع رسالة غير صحيح' 
        },
        { status: 400 }
      );
    }

    // حفظ الرسالة في قاعدة البيانات
    const message = await messagesService.add(type, data);

    console.log('Message saved successfully:', {
      id: message.id,
      type: message.type,
      email: message.email,
      timestamp: new Date().toISOString()
    });

    // إرجاع استجابة نجاح
    return NextResponse.json(
      { 
        success: true, 
        message: type === 'contact' ? 'تم إرسال الرسالة بنجاح' : 'تم إرسال طلب الانضمام بنجاح',
        data: {
          id: message.id,
          type: message.type,
          status: message.status
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'حدث خطأ في معالجة الطلب' 
      },
      { status: 500 }
    );
  }
}
