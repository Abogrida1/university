'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestOAuthPage() {
  const [authUrl, setAuthUrl] = useState('');

  useEffect(() => {
    const testOAuth = async () => {
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
        console.error('OAuth Error:', error);
        setAuthUrl(`Error: ${error.message}`);
      } else {
        console.log('OAuth Data:', data);
        setAuthUrl(`Success: ${JSON.stringify(data)}`);
      }
    };

    testOAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Test</h1>
      <div className="bg-gray-800 p-4 rounded">
        <pre>{authUrl}</pre>
      </div>
    </div>
  );
}
