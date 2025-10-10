'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugOAuthPage() {
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const debugOAuth = async () => {
      try {
        // جرب OAuth مع معلومات مفصلة
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: 'https://university-3-cuxd.onrender.com/auth/callback',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            skipBrowserRedirect: false
          }
        });

        if (error) {
          setDebugInfo(`❌ Error: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
        } else {
          setDebugInfo(`✅ Success!\n\nData: ${JSON.stringify(data, null, 2)}`);
        }
      } catch (err) {
        setDebugInfo(`💥 Exception: ${err}`);
      }
    };

    debugOAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 OAuth Debug</h1>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Debug Information:</h2>
        <pre className="whitespace-pre-wrap text-sm">{debugInfo}</pre>
      </div>
      
      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">📋 Checklist:</h3>
        <ul className="space-y-2 text-sm">
          <li>✅ Google Cloud Console: Redirect URI = https://university-3-cuxd.onrender.com/auth/callback</li>
          <li>❓ Supabase Site URL = https://university-3-cuxd.onrender.com</li>
          <li>❓ Supabase Redirect URLs = https://university-3-cuxd.onrender.com/auth/callback</li>
          <li>❓ Browser cache cleared</li>
        </ul>
      </div>
    </div>
  );
}
