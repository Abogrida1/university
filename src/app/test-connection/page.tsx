'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnectionPage() {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check environment variables
        const envVars = {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
          NODE_ENV: process.env.NODE_ENV,
        };

        setDetails(prev => ({ ...prev, envVars }));

        // Test 2: Test Supabase connection
        const { data, error } = await supabase
          .from('materials')
          .select('count')
          .limit(1);

        if (error) {
          setStatus(`❌ Supabase Error: ${error.message}`);
          setDetails(prev => ({ ...prev, supabaseError: error }));
        } else {
          setStatus('✅ Supabase Connection Successful!');
          setDetails(prev => ({ ...prev, supabaseData: data }));
        }

        // Test 3: Test materials table
        const { data: materials, error: materialsError } = await supabase
          .from('materials')
          .select('*')
          .limit(5);

        if (materialsError) {
          setDetails(prev => ({ ...prev, materialsError }));
        } else {
          setDetails(prev => ({ ...prev, materialsCount: materials?.length || 0 }));
        }

      } catch (error) {
        setStatus(`❌ Connection Failed: ${error}`);
        setDetails(prev => ({ ...prev, generalError: error }));
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Supabase Connection Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Connection Status:</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Details:</h2>
          <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
