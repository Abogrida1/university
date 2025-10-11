'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserService } from '@/lib/userService';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // انتظار قصير للتأكد من تحميل الجلسة
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // الحصول على الجلسة
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('خطأ في الجلسة:', sessionError);
          setError('خطأ في تسجيل الدخول');
          return;
        }

        if (!session?.user) {
          console.error('لم يتم العثور على بيانات المستخدم');
          setError('لم يتم العثور على بيانات المستخدم');
          return;
        }

        const googleUser = session.user;
        console.log('🔍 Google user data:', googleUser);
        console.log('📧 User email:', googleUser.email);
        console.log('👤 User metadata:', googleUser.user_metadata);
        
        // الحصول على البيانات الأكاديمية المحفوظة
        const pendingAuthData = localStorage.getItem('pendingGoogleAuth');
        let academicData = null;
        
        if (pendingAuthData) {
          try {
            academicData = JSON.parse(pendingAuthData);
            localStorage.removeItem('pendingGoogleAuth');
          } catch (e) {
            console.error('خطأ في تحليل البيانات المحفوظة:', e);
          }
        }

        // التحقق من وجود المستخدم في قاعدة البيانات
        console.log('🔍 Searching for existing user with email:', googleUser.email);
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', googleUser.email)
          .maybeSingle();

        if (userError) {
          console.error('❌ خطأ في البحث عن المستخدم:', userError);
          setError('خطأ في قاعدة البيانات');
          return;
        }

        console.log('👤 Existing user found:', existingUser);

        let userProfile;
        let isNewUser = false;
        
        if (existingUser) {
          // المستخدم موجود، تحديث البيانات
          console.log('👤 Existing user - updating data');
          const updateData: any = {
            name: googleUser.user_metadata?.full_name || googleUser.email?.split('@')[0],
            last_login: new Date().toISOString(),
            is_active: true
          };

          // إضافة البيانات الأكاديمية إذا كانت متوفرة
          if (academicData) {
            updateData.department = academicData.department;
            updateData.year = parseInt(academicData.year);
            updateData.term = academicData.term;
          }

          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', existingUser.id)
            .select()
            .single();

          if (updateError) {
            console.error('خطأ في تحديث المستخدم:', updateError);
            setError('خطأ في تحديث البيانات');
            return;
          }

          userProfile = updatedUser;
          isNewUser = false;
        } else {
          // مستخدم جديد، إنشاء حساب
          console.log('🆕 New user - creating account');
          isNewUser = true;
          const newUserData = {
            email: googleUser.email!,
            name: googleUser.user_metadata?.full_name || googleUser.email?.split('@')[0],
            password_hash: 'google_oauth_user', // قيمة افتراضية لحسابات Google
            department: academicData?.department || 'General Program',
            year: academicData ? parseInt(academicData.year) : 1,
            term: academicData?.term || 'FIRST',
            role: 'student',
            is_active: true,
            last_login: new Date().toISOString()
          };

          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([newUserData])
            .select()
            .maybeSingle();

          if (createError) {
            console.error('خطأ في إنشاء المستخدم:', createError);
            setError('خطأ في إنشاء الحساب');
            return;
          }

          userProfile = newUser;
        }

        // إنشاء جلسة جديدة
        console.log('🔑 Creating session for user:', userProfile.id);
        try {
          const sessionResult = await UserService.createSession(userProfile.id);
          console.log('✅ Session created successfully:', sessionResult);
          
          if (sessionResult) {
            // حفظ الجلسة في localStorage
            localStorage.setItem('session_token', sessionResult.sessionToken);
            console.log('💾 Session token saved to localStorage');
          
          // إعادة توجيه إلى الصفحة الرئيسية أو صفحة الترحيب
          console.log('تم تسجيل الدخول بنجاح، إعادة التوجيه...');
          setSuccess(true);
          
          console.log('=== USER FLOW DEBUG ===');
          console.log('Is new user:', isNewUser);
          console.log('User profile:', userProfile);
          console.log('Department:', userProfile.department);
          console.log('Year:', userProfile.year);
          console.log('Term:', userProfile.term);
          console.log('========================');
          
           // توجيه فوري بدون انتظار
           if (isNewUser) {
             // مستخدم جديد - توجيه لاختيار البيانات الأكاديمية
             console.log('🆕 New user - redirecting to academic selection...');
             // حفظ بيانات المستخدم مؤقتاً
             localStorage.setItem('temp_user_data', JSON.stringify({
               id: userProfile.id,
               email: userProfile.email,
               name: userProfile.name
             }));
             window.location.href = '/auth/register?step=1&google=true';
           } else {
             // مستخدم موجود - توجيه مباشر للصفحة الرئيسية
             console.log('👤 Existing user - redirecting to home page...');
             window.location.href = '/';
           }
          } else {
            console.error('فشل في إنشاء الجلسة');
            setError('خطأ في إنشاء الجلسة');
          }
        } catch (sessionError) {
          console.error('خطأ في إنشاء الجلسة:', sessionError);
          setError('خطأ في إنشاء الجلسة');
        }

      } catch (error) {
        console.error('خطأ في معالجة تسجيل الدخول:', error);
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            جاري تسجيل الدخول...
          </h2>
          <p className="text-gray-400" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            يرجى الانتظار بينما نكمل عملية تسجيل الدخول
          </p>
        </div>
      </div>
    );
  }

  // رسالة نجاح قبل التوجيه
  if (success && !loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            تم تسجيل الدخول بنجاح! 🎉
          </h2>
          <p className="text-gray-400 mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            جاري توجيهك إلى الصفحة الرئيسية...
          </p>
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            خطأ في تسجيل الدخول
          </h2>
          <p className="text-gray-300 mb-6" style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}>
            {error}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
            style={{fontFamily: 'Cairo, -apple-system, BlinkMacSystemFont, sans-serif'}}
          >
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return null;
}
