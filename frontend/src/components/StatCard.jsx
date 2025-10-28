// src/components/StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, delta, children }) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>{title}</div>
          <div className='text-2xl font-semibold'>{value}</div>
        </div>
         {children}
      </div>
       {delta && <div className='text-xs text-gray-500 mt-2'>{delta}</div>}
    </div>
  );
}