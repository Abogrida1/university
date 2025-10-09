'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('جاري الاختبار...');
    
    try {
      // اختبار الاتصال الأساسي
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        setResult(`خطأ في الاتصال: ${error.message}`);
      } else {
        setResult('✅ الاتصال بـ Supabase يعمل بنجاح!');
      }
    } catch (err) {
      setResult(`خطأ عام: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testInsert = async () => {
    setLoading(true);
    setResult('جاري اختبار الإدراج...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: 'test@test.com',
          password_hash: 'test_hash',
          name: 'Test User',
          role: 'student'
        })
        .select();

      if (error) {
        setResult(`خطأ في الإدراج: ${error.message}`);
      } else {
        setResult('✅ الإدراج يعمل بنجاح!');
      }
    } catch (err) {
      setResult(`خطأ عام: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">اختبار Supabase</h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            اختبار الاتصال
          </button>
          
          <button
            onClick={testInsert}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            اختبار الإدراج
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-700 rounded">
          <h3 className="text-white font-bold mb-2">النتيجة:</h3>
          <p className="text-gray-300 text-sm">{result}</p>
        </div>
      </div>
    </div>
  );
}
