'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SimpleTestPage() {
  const [result, setResult] = useState('Testing...');

  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log('🔍 Testing Supabase connection...');
        
        // Test 1: Simple connection test
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .limit(1);

        if (error) {
          console.error('❌ Supabase Error:', error);
          setResult(`❌ Error: ${error.message}`);
        } else {
          console.log('✅ Supabase Success:', data);
          setResult(`✅ Success! Found ${data?.length || 0} materials`);
        }

        // Test 2: Check if we can access the table
        const { data: countData, error: countError } = await supabase
          .from('materials')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('❌ Count Error:', countError);
        } else {
          console.log('📊 Total materials:', countData);
        }

      } catch (error) {
        console.error('❌ General Error:', error);
        setResult(`❌ General Error: ${error}`);
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Simple Supabase Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Result:</h2>
          <p className="text-lg">{result}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Supabase Configuration:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>URL:</strong> https://cuhztjuphamulkgfhchcp.supabase.co</p>
            <p><strong>Key:</strong> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
          </div>
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
