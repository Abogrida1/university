'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserSession, LoginCredentials, RegisterData } from './types';
import { UserService } from './userService';
import { supabase } from './supabase';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل المستخدم من الجلسة المحفوظة
  useEffect(() => {
    const loadUserFromSession = async () => {
      try {
        const sessionToken = localStorage.getItem('session_token');
        if (sessionToken) {
          const userProfile = await UserService.validateSession(sessionToken);
          if (userProfile) {
            setUser(userProfile);
            // تحديث الجلسة
            const { data: sessionData } = await supabase
              .from('user_sessions')
              .select('*')
              .eq('session_token', sessionToken)
              .single();
            
            if (sessionData) {
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
            // الجلسة غير صالحة، احذفها
            localStorage.removeItem('session_token');
          }
        }
      } catch (error) {
        console.error('خطأ في تحميل المستخدم:', error);
        localStorage.removeItem('session_token');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromSession();
  }, []);

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

  const loginWithGoogle = async (academicData?: { department: string; year: string; term: string }): Promise<boolean> => {
    try {
      setLoading(true);
      
      // تسجيل الدخول بجوجل عبر Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://university-3-cuxd.onrender.com/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('خطأ في تسجيل الدخول بجوجل:', error);
        return false;
      }

      // حفظ البيانات الأكاديمية إذا كانت متوفرة
      if (academicData) {
        localStorage.setItem('pendingGoogleAuth', JSON.stringify(academicData));
      }

      return true;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول بجوجل:', error);
      return false;
    } finally {
      setLoading(false);
    }
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
    changePassword
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
