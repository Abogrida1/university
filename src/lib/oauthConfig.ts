// OAuth Configuration
export const getOAuthRedirectUrl = (): string => {
  // أولوية: متغير البيئة المخصص
  if (process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL) {
    return process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL;
  }
  
  // ثانياً: بناءً على البيئة
  if (process.env.NODE_ENV === 'production') {
    return 'https://university-3-cuxd.onrender.com/auth/callback';
  }
  
  // أخيراً: البيئة المحلية
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  
  // افتراضي
  return 'http://localhost:3000/auth/callback';
};

export const oauthConfig = {
  google: {
    redirectTo: getOAuthRedirectUrl(),
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
};
