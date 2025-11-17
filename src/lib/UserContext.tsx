'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserSession, LoginCredentials, RegisterData } from './types';
import { UserService } from './userService';
import { supabase } from './supabase';
import { getOAuthConfig } from './oauthConfig';

interface UserContextType {
  user: UserProfile | null;
  session: UserSession | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  loginWithGoogle: (academicData?: { department: string; year: string; term: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  setUser: (user: UserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل المستخدم من الجلسة المحفوظة (مرة واحدة فقط عند التحميل)
  useEffect(() => {
    let isMounted = true; // للتحقق من أن المكون لا يزال محملاً
    
    const loadUserFromSession = async () => {
      try {
        console.log('🔄 UserContext: Loading user from session...');
        console.log('📍 Current path:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
        const sessionToken = localStorage.getItem('session_token');
        console.log('🔑 Session token found:', sessionToken ? 'Yes' : 'No');
        console.log('📏 Session token length:', sessionToken?.length || 0);
        
        if (sessionToken) {
          console.log('🔍 Validating session token...');
          const userProfile = await UserService.validateSession(sessionToken);
          console.log('👤 User profile from session:', userProfile);
          console.log('👤 User profile details:', {
            id: userProfile?.id,
            email: userProfile?.email,
            isActive: userProfile?.isActive,
            department: userProfile?.department,
            year: userProfile?.year,
            term: userProfile?.term
          });
          
          if (userProfile) {
            // التحقق من أن الحساب نشط
            if (!userProfile.isActive) {
              console.log('⚠️ User account is not active, checking current page...');
              // التحقق من الصفحة الحالية لتجنب التوجيه المستمر
              const currentPath = window.location.pathname;
              if (currentPath !== '/auth/register') {
                console.log('Redirecting to complete registration...');
                window.location.href = '/auth/register';
                return;
              } else {
                console.log('Already on register page, setting user as inactive...');
                // تعيين المستخدم كغير نشط ولكن لا نعيد التوجيه
                setUser({ ...userProfile, isActive: false });
                return;
              }
            } else {
              // الحساب نشط - التحقق من وجود بيانات أكاديمية
              console.log('✅ User is active, checking academic data...');
              console.log('Academic data:', {
                department: userProfile.department,
                year: userProfile.year,
                term: userProfile.term
              });
              
              if (!userProfile.department || !userProfile.year || !userProfile.term) {
                console.log('⚠️ Active user missing academic data, checking current page...');
                const currentPath = window.location.pathname;
                // فقط إذا لم نكن بالفعل في صفحة التسجيل أو Welcome (لتجنب الحلقة)
                if (currentPath !== '/auth/register' && currentPath !== '/welcome') {
                  console.log('Redirecting to register...');
                  window.location.href = '/auth/register';
                  return;
                } else {
                  console.log('Already on register/welcome page, staying here...');
                  // نضع المستخدم في حالة بدون بيانات أكاديمية لكن لا نعيد التوجيه
                  setUser(userProfile);
                  return;
                }
              }
            }
            
            console.log('✅ User loaded successfully with all data:', userProfile);
            setUser(userProfile);
            
            // إضافة تأخير قصير للتأكد من تحديث UserContext
            setTimeout(() => {
              console.log('🔄 UserContext updated, user should be available now');
            }, 100);
            
            // تحديث الجلسة
            console.log('🔄 Loading session data...');
            const { data: sessionData, error: sessionError } = await supabase
              .from('user_sessions')
              .select('*')
              .eq('session_token', sessionToken)
              .single();
            
            if (sessionError) {
              console.error('❌ Error loading session data:', sessionError);
            } else {
              console.log('✅ Session data loaded:', sessionData);
              setSession({
                id: sessionData.id,
                userId: sessionData.user_id,
                sessionToken: sessionData.session_token,
                expiresAt: sessionData.expires_at,
                createdAt: sessionData.created_at,
                lastActivity: sessionData.last_activity
              });
            }
          } else {
            console.log('❌ Invalid session, removing token');
            // الجلسة غير صالحة، احذفها
            localStorage.removeItem('session_token');
          }
        } else {
          console.log('❌ No session token found');
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
        if (isMounted) {
          localStorage.removeItem('session_token');
        }
      } finally {
        if (isMounted) {
          console.log('🔄 UserContext loading complete');
          setLoading(false);
        }
      }
    };

    loadUserFromSession();
    
    return () => {
      isMounted = false; // تنظيف عند إلغاء تحميل المكون
    };
  }, []); // [] يعني مرة واحدة فقط عند التحميل

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await UserService.login(credentials);
      
      if (result) {
        setUser(result.user);
        setSession(result.session);
        localStorage.setItem('session_token', result.session.sessionToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await UserService.register(userData);
      
      if (result) {
        setUser(result.user);
        setSession(result.session);
        localStorage.setItem('session_token', result.session.sessionToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      console.error('تفاصيل الخطأ:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth disabled - using regular login only
  const loginWithGoogle = async (academicData?: { department: string; year: string; term: string }): Promise<boolean> => {
    console.warn('Google OAuth is currently disabled. Please use regular login.');
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      if (session) {
        await UserService.logout(session.sessionToken);
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    } finally {
      setUser(null);
      setSession(null);
      localStorage.removeItem('session_token');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await UserService.updateUserProfile(user.id, updates);
      if (success) {
        setUser({ ...user, ...updates });
        await UserService.logActivity(user.id, 'profile_update', 'تحديث الملف الشخصي');
      }
      return success;
    } catch (error) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await UserService.changePassword(user.id, currentPassword, newPassword);
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      return false;
    }
  };

  const value: UserContextType = {
    user,
    session,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
