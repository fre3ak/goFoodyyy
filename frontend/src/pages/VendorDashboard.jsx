// src/pages/VendorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import OrderTable from '../components/OrderTable';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function VendorDashboardPage() {
  const { user } = useAuth(); // Get logged-in vendor info
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  // user.tier expected to be 'free' or 'pro'. Fallback to 'free' if missing.
  const tier = user?.tier || 'free';

  useEffect(() => {
    if (user?.vendorSlug) {
      const fetchOrders = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${API_BASE}/api/orders/vendor/${user.vendorSlug}`);
          if (!res.ok) throw new Error('Failed to fetch orders');
          const data = await res.json();
          setOrders(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  const totalEarnings = orders
    .filter(o => o.status === 'delivered')
    .reduce((s, o) => s + parseFloat(o.total || 0), 0);

  const totalOrders = orders.length;
  const pending = orders.filter(o => ['pending', 'paid', 'preparing'].includes(o.status)).length;

  // Helper: sample top items (placeholder - replace with real API)
  const topItems = [
    { name: 'Jollof & Chicken', sold: 120 },
    { name: 'Small Chops', sold: 84 },
    { name: 'Suya', sold: 60 },
  ];

  return (
    <DashboardLayout active='dashboard'>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold'>Welcome back, {user?.vendorName || 'Vendor'} 👋</h1>
            <p className='text-sm text-gray-500'>Here's a quick view of your operations</p>
          </div>
          
          <div className='flex items-center gap-3'>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                checked={isOpen}
                onChange={() => {
                  // TODO: PATCH to API to set vendor open/close state
                  setIsOpen(v => !v);
                }}
                className='h-4 w-4'
              />
              <span>{isOpen ? 'Open for orders' : 'Closed'}</span>
            </label>

            <Link to='/vendor/upgrade' className="px-3 py-2 border rounded text-sm bg-indigo-600 text-white">Upgrade</Link>
          </div>
        </div>

        {/* Top stats */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <StatCard title="Total Earnings" value={`₦${totalEarnings.toLocaleString()}`} delta="Since beginning" />
          <StatCard title="Total Orders" value={totalOrders} delta={`${pending} active`} />
          <StatCard title="Pending Orders" value={pending} delta="Orders requiring attention" />
        </div>

        {/* Mini analytics & teaser */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-semibold'>Recent Orders</h2>
              <div className='text-sm text-gray-500'>{tier === 'free' ? 'Mini view (upgrade for exports & deep analytics)' : 'Premium analytics enabled'}</div>
            </div>
            {loading ? <div className='p-6 text-center'>Loading orders...</div> : <OrderTable orders={orders.slice(0, 20)} />}
            <div className='mt-3 text-xs text-gray-500'>Showing latest 20 orders. <Link to='/vendor/orders' className='text-indigo-600 hover:underline'>See all</Link></div>
          </div>

          <aside className='space-y-4'>
            <div className='bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border dark:border-gray-700'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-sm font-medium'>Top Items (30d)</h3>
                <span className='text-xs text-gray-400'>insight</span>
              </div>
              <ul className='mt-3 space-y-2'>
                {topItems.map((it) => (
                  <li className='flex items-center justify-between text-sm' key={it.name}>
                    <div>{it.name}</div>
                    <div className='text-xs text-gray-500'>{it.sold} sold</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upsell / Promo */}
            {tier === 'free' && (
              <div className='bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900 p-4 rounded-lg border dark:border-gray-700'>
                <h4 className='font-medium'>Try Premium - 1 month free</h4>
                <p className='text-sm text-gray-600 dark:text-gray-300 mt-2'>Get advanced stats, exports, SMS notifications, ad placement, and more. Trial ends in 30 days from activation.</p>
                <Link to="/vendor/upgrade" className='mt-3 inline-block px-3 py-1 bg-indigo-600 text-white rounded text-sm'>Start free trial</Link>
              </div>
              )}
          </aside>
        </div>

        {/* Quick actions */}
        <div className='bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700'>
          <h3 className='text-sm font-semibold mb-3'>Quick Actions</h3>
          <div className='flex flex-wrap gap-3'>
            <Link to="/vendor/menu" className="px-3 py-2 border rounded text-sm hover:bg-gray-50">Edit menu</Link>
            <Link to="/vendor/menu/new" className="px-3 py-2 border rounded text-sm hover:bg-gray-50">Add item</Link>
            <Link to="/vendor/orders" className="px-3 py-2 border rounded text-sm hover:bg-gray-50">Manage orders</Link>
            <Link to="/vendor/settings" className="px-3 py-2 border rounded text-sm hover:bg-gray-50">Store settings</Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  
  );
}
