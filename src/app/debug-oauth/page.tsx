'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugOAuthPage() {
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testOAuth = async () => {
    setIsLoading(true);
    setDebugInfo('🔄 Testing OAuth...\n\n');
    
    try {
      console.log('🚀 Starting OAuth test...');
      
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
        setDebugInfo(prev => prev + `❌ Error: ${error.message}\n\nDetails: ${JSON.stringify(error, null, 2)}`);
      } else {
        setDebugInfo(prev => prev + `✅ OAuth initiated successfully!\n\nData: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err) {
      setDebugInfo(prev => prev + `💥 Exception: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setDebugInfo(prev => prev + `\n\n👤 Current User Error: ${error.message}`);
      } else if (user) {
        setDebugInfo(prev => prev + `\n\n👤 Current User: ${user.email} (${user.id})`);
      } else {
        setDebugInfo(prev => prev + `\n\n👤 No current user`);
      }
    } catch (err) {
      setDebugInfo(prev => prev + `\n\n👤 User check error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 OAuth Debug Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={testOAuth}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Google OAuth'}
        </button>
        
        <button
          onClick={checkCurrentUser}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
        >
          Check Current User
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Debug Information:</h2>
        <pre className="whitespace-pre-wrap text-sm bg-gray-900 p-4 rounded">{debugInfo || 'Click a button to start debugging...'}</pre>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">📋 Required Settings:</h3>
        <ul className="space-y-2 text-sm">
          <li>✅ Google Cloud Console: Redirect URI = https://university-3-cuxd.onrender.com/auth/callback</li>
          <li>❓ Supabase Site URL = https://university-3-cuxd.onrender.com</li>
          <li>❓ Supabase Redirect URLs = https://university-3-cuxd.onrender.com/auth/callback</li>
          <li>❓ Browser cache cleared</li>
        </ul>
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
          <p className="text-yellow-300 text-sm">
            <strong>Note:</strong> If OAuth redirects to localhost, check your Supabase and Google Cloud Console settings.
          </p>
        </div>
      </div>
    </div>
  );
}
