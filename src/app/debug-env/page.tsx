'use client';

import { useEffect, useState } from 'react';

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Environment Variables Debug</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment Variables Status:</h2>
          <div className="space-y-3">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <span className="font-mono text-sm">{key}:</span>
                <span className={`font-mono text-sm ${
                  value && value !== 'Missing' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {value || 'undefined'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔧 Instructions:</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold text-yellow-400">1. Check Vercel Dashboard:</h3>
              <p>Go to Vercel → Your Project → Settings → Environment Variables</p>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400">2. Add these variables:</h3>
              <div className="bg-gray-700 p-3 rounded font-mono text-xs">
                <div>NEXT_PUBLIC_SUPABASE_URL = https://cuhztjuphamulkgfhchcp.supabase.co</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400">3. Select environments:</h3>
              <p>✅ Production ✅ Preview ✅ Development</p>
            </div>
            <div>
              <h3 className="font-bold text-yellow-400">4. Save and Redeploy:</h3>
              <p>Click Save, then go to Deployments and click "Redeploy"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
