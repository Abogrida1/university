import { supabase } from './supabase';
import { User, UserProfile, LoginCredentials, RegisterData, UserSession, UserActivity } from './types';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export class UserService {
  // تسجيل دخول المستخدم
  static async login(credentials: LoginCredentials): Promise<{ user: UserProfile; session: UserSession } | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !user) {
        throw new Error('المستخدم غير موجود أو غير نشط');
      }

      // التحقق من كلمة المرور
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('كلمة المرور غير صحيحة');
      }

      // الحصول على صلاحيات المستخدم
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('permissions(name)')
        .eq('user_id', user.id);

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year,
        term: user.term,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        permissions: permissions?.map(p => p.permissions.name) || []
      };

      // إنشاء جلسة جديدة
      const session = await this.createSession(user.id);

      // تحديث آخر تسجيل دخول
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // تسجيل النشاط
      await this.logActivity(user.id, 'login', 'تسجيل دخول ناجح');

      return { user: userProfile, session };
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return null;
    }
  }

  // تسجيل مستخدم جديد
  static async register(userData: RegisterData): Promise<{ user: UserProfile; session: UserSession } | null> {
    try {
      // التحقق من وجود المستخدم
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('البريد الإلكتروني مستخدم بالفعل');
      }

      // تشفير كلمة المرور
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // إنشاء المستخدم
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          name: userData.name || userData.email?.split('@')[0] || 'User',
          role: 'student',
          department: userData.department,
          year: userData.year,
          term: userData.term,
          is_active: true
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('خطأ Supabase في إنشاء المستخدم:', error);
        throw new Error(`خطأ في إنشاء المستخدم: ${error.message}`);
      }

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year,
        term: user.term,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        permissions: []
      };

      // إنشاء جلسة جديدة
      const session = await this.createSession(user.id);

      // تسجيل النشاط
      await this.logActivity(user.id, 'register', 'تسجيل مستخدم جديد');

      return { user: userProfile, session };
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      return null;
    }
  }

  // إنشاء جلسة جديدة
  static async createSession(userId: string): Promise<UserSession> {
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 أيام

    const { data: session, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      throw new Error('خطأ في إنشاء الجلسة');
    }

    return {
      id: session.id,
      userId: session.user_id,
      sessionToken: session.session_token,
      expiresAt: session.expires_at,
      createdAt: session.created_at,
      lastActivity: session.last_activity
    };
  }

  // التحقق من صحة الجلسة
  static async validateSession(sessionToken: string): Promise<UserProfile | null> {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*, users(*)')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (sessionError || !session) {
        return null;
      }

      // تحديث آخر نشاط
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', session.id);

      // الحصول على صلاحيات المستخدم
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('permissions(name)')
        .eq('user_id', session.user_id);

      const user = session.users;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year,
        term: user.term,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        permissions: permissions?.map(p => p.permissions.name) || []
      };
    } catch (error) {
      console.error('خطأ في التحقق من الجلسة:', error);
      return null;
    }
  }

  // تسجيل خروج المستخدم
  static async logout(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return !error;
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      return false;
    }
  }

  // تسجيل نشاط المستخدم
  static async logActivity(
    userId: string,
    activityType: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          description,
          metadata,
          ip_address: ipAddress,
          user_agent: userAgent
        });
    } catch (error) {
      console.error('خطأ في تسجيل النشاط:', error);
    }
  }

  // الحصول على معلومات المستخدم
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      // الحصول على صلاحيات المستخدم
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('permissions(name)')
        .eq('user_id', userId);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        year: user.year,
        term: user.term,
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        permissions: permissions?.map(p => p.permissions.name) || []
      };
    } catch (error) {
      console.error('خطأ في الحصول على معلومات المستخدم:', error);
      return null;
    }
  }

  // تحديث معلومات المستخدم
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('خطأ في تحديث معلومات المستخدم:', error);
      return false;
    }
  }

  // تغيير كلمة المرور
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      // التحقق من كلمة المرور الحالية
      const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (!user) {
        return false;
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return false;
      }

      // تشفير كلمة المرور الجديدة
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // تحديث كلمة المرور
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId);

      if (!error) {
        await this.logActivity(userId, 'password_change', 'تغيير كلمة المرور');
      }

      return !error;
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      return false;
    }
  }

  // حذف المستخدم
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      return false;
    }
  }
}
