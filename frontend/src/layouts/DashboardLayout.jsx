// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { Home, List, Zap, BarChart2, Gift, Settings } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const defaultSidebarItems = [
    { key: 'dashboard', label:'Dashboard', icon: <Home size={16} />, href: '/vendor/dashboard' },
    { key: 'orders', label: 'Orders', icon: <List size={16} />, href: '/vendor/orders' },
    { key: 'menu', label: 'Menu', icon: <Zap size={16} />, href: '/vendor/menu' },
    { key: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} />, href: '/vendor/analytics', premium: true },
    { key: 'ads', label: 'Ads', icon: <Gift size={16} />, href: '/vendor/ads', premium: true },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} />, href: '/vendor/settings' },
];

export default function DashboardLayout({ children, active = 'dashboard', sidebarItems = defaultSidebarItems }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100'>
            <div className='flex'>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} active={active} items={sidebarItems} />

                <div className='flex-1 min-h-screen flex flex-col'>
                    <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
                    <main className='p-6 md:p-8 flex-1'>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}