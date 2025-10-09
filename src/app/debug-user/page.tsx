'use client';

import React, { useEffect } from 'react';
import { useUser } from '@/lib/UserContext';

export default function DebugUser() {
  const { user } = useUser();

  useEffect(() => {
    console.log('🔍 Debug User Data:', {
      user: user,
      hasUser: !!user,
      userData: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        term: user.term,
        isActive: user.isActive
      } : null
    });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Debug User Data</h1>
          <p className="text-gray-300">No user logged in</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Debug User Data</h1>
        
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Name:</span>
            <span className="text-white ml-2">{user.name}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">{user.email}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Role:</span>
            <span className="text-white ml-2">{user.role}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Department:</span>
            <span className="text-white ml-2">{user.department || 'Not set'}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Year:</span>
            <span className="text-white ml-2">{user.year || 'Not set'}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Term:</span>
            <span className="text-white ml-2">{user.term || 'Not set'}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Is Active:</span>
            <span className="text-white ml-2">{user.isActive ? 'Yes' : 'No'}</span>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-700 rounded">
          <h3 className="text-white font-bold mb-2">Raw User Object:</h3>
          <pre className="text-xs text-gray-300 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
