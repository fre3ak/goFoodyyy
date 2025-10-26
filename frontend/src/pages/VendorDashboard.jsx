import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

function VendorDashboard() {
  const { user } = useAuth(); // Get logged-in vendor info
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.vendorSlug) {
      const fetchVendorData = async () => {
        try {
          const response = await fetch(`${API_BASE}/api/orders/vendor/${user.vendorSlug}`);
          if (!response.ok) {
            throw new Error('Failed to fetch vendor orders');
          }
          const data = await response.json();
          setOrders(data);
        } catch (error) {
          console.error("Error fetching vendor data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVendorData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Calculate stats from fetched data
  const totalEarnings = orders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + parseFloat(order.total), 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => ['pending', 'paid', 'preparing'].includes(order.status)).length;

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.vendorName || 'Vendor'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card text-center">
          <h2>Total Earnings</h2>
          <p className="text-2xl font-bold">₦{totalEarnings.toLocaleString()}</p>
        </div>
        <div className="card text-center">
          <h2>Total Orders</h2>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="card text-center">
          <h2>Active Orders</h2>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {orders.length > 0 ? (
          <ul className="space-y-2">
            {orders.slice(0, 5).map(order => (
              <li key={order.id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <p className="font-medium">Order #{order.id} - {order.customerName}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{parseFloat(order.total).toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{order.status}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no orders yet.</p>
        )}
      </div>
    </div>
  );
}

export default VendorDashboard;