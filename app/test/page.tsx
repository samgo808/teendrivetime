'use client';

import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  const handleClick = () => {
    setCount(c => c + 1);
    setMessage('Button clicked!');
    console.log('Button clicked, count:', count + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Button Test Page</h1>

        <div className="space-y-4">
          <button
            onClick={handleClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
          >
            Click Me
          </button>

          <div className="p-4 bg-gray-100 rounded">
            <p className="font-semibold">Count: {count}</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>

          <div className="text-sm text-gray-500">
            <p>Open browser console (F12) to see logs</p>
            <p>If this button works, the issue is elsewhere</p>
          </div>
        </div>
      </div>
    </div>
  );
}
