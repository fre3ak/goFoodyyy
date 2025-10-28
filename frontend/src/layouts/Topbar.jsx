// src/layouts/Topbar.jsx
import React from 'react';
import { Bell, User } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export default function Topbar({ collapsed, setCollapsed }) {
  const { user } = useAuth();

  return (
    <header className='flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700'>
      <div className='flex items-center gap-3'>
        <button onClick={() => setCollapsed(!collapsed)} className='md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700'>
          ☰
        </button>
        <div className='text-sm text-gray-600 dark:text-gray-300'>Vendor Dashboard</div>
      </div>

      <div className='flex items-center gap-4'>
        <ThemeToggle />
        <button title="Notifications" className='p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 relative'>
          <Bell size={18} />
          {/* an unread dot */}
          <span className='absolute top-1 right-1 inline-block h-2 w-2 rounded-full bg-red-500' />
        </button>

        <div className='flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'>
          <User size={18} />
          <div className='text-sm'>
            <div className='font-medium'>{user?.vendorName || user?.name || 'Vendor'}</div>
            <div className='text-xs text-gray-500 dark:text-gray-400'>{user?.vendorSlug || user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
