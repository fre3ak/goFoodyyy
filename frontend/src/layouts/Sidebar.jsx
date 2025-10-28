// src/layouts/Topbar.jsx
import React from 'react';
import { Home, List, BarChart2, Settings, Zap, Gift, Users } from 'lucide-react';

const defaultItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <Home size={16} />, href: '/vendor/dashboard' },
    { key: 'orders', label: 'Orders', icon: <List size={16} />, href: '/vendor/orders' },
    { key: 'menu', label: 'Menu Management', icon: <Zap size={16} />, href: '/vendor/menu' },
    { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} />, href: '/vendor/analytics' },
    { key: 'ads', label: 'Ads Manager', icon: <Gift size={16} />, href: '/vendor/ads', premium: true },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} />, href: '/vendor/settings' },
    
];

export default function Sidebar({ collapsed, setCollapsed, active, items = defaultItems }) {
    return (
      <aside className={`bg-white dark:bg-gray-800 border-r dark:border-gray-700 transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-screen">
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
              {!collapsed ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded flex items-center justify-center text-white font-bold">G4</div>
                  <div className="text-lg font-semibold">GoFoodyyy</div>
                </div>
              ) : (
                <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded fleex items-center justify-center text-white font-bold">G4</div>
              )}

              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-600 dark:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
            </div>

            <nav className="flex-1 overflow-auto py-4">
              <ul className="space-y-1 px-2">
                {items.map((item) => {
                  const isActive = item.key === active;
                  return (
                    <li key={item.key}>
                      <a 
                        href={item.href}
                        className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                          isActive ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="inline-flex items-center">{item.icon}</span>
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.premium && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">PRO</span>} 
                          </>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t dark:border-gray-700">
              {!collapsed ? (
                <div className="text-sm">
                  <p className="font-medium">Need help?</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contact support or upgrade for more features.</p>
                  <a href="/vendor/upgrade" className="inline-block mt-3 px-1 bg-indigo-600 text-white rounded text-sm">Upgrade</a>
                </div>
              ) : (
                <a href="/vendor/upgrade" className="block text-xs text-center px-2 py-1 bg-indigo-600 text-white rounded">UP</a>
              )}
            </div>
          </div>
        </aside>
    );

}