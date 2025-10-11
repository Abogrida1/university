// OAuth Configuration
export const getOAuthRedirectUrl = (): string => {
  console.log('🔍 OAuth Config Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('NEXT_PUBLIC_OAUTH_REDIRECT_URL:', process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL);
  console.log('window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'undefined');
  
  // أولوية: متغير البيئة المخصص
  if (process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL) {
    console.log('✅ Using NEXT_PUBLIC_OAUTH_REDIRECT_URL');
    return process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;
  }
  
  // ثانياً: بناءً على البيئة
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Using production URL');
    return 'https://university-3-cuxd.onrender.com/auth/callback';
  }
  
  // أخيراً: البيئة المحلية
  if (typeof window !== 'undefined') {
    console.log('✅ Using window.location.origin');
    return `${window.location.origin}/auth/callback`;
  }
  
  // افتراضي
  console.log('✅ Using default localhost URL');
  return 'http://localhost:3000/auth/callback';
};

export const getOAuthConfig = () => ({
  google: {
    redirectTo: getOAuthRedirectUrl(),
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
