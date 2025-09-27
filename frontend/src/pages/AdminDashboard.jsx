import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE;

function AdminDashboard() {
  const [vendors, setVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [orders, setOrders] = useState([]);

  // Fetch vendors
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/vendors/all/vendors`);
      const data = await response.json();

      const approved = data.filter(v => v.status === 'approved');
      const pending = data.filter(v => v.status === 'pending');

      setVendors(approved);
      setPendingVendors(pending);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const approveVendor = async (vendorSlug) => {
    try {
      // ✅ Fixed template string - use backticks, not single quotes
      const response = await fetch(`${API_BASE}/api/vendors/${vendorSlug}/approve`, {
        method: 'PUT'
      });

      if (response.ok) {
        alert('Vendor approved!');
        fetchVendors();
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <h2 className="text-xl">Total Vendors</h2>
          <p className="text-3xl font-bold">{vendors.length}</p>
        </div>
        <div className="card text-center">
          <h2 className="text-xl">Pending Approval</h2>
          <p className="text-3xl font-bold">{pendingVendors.length}</p>
        </div>
        <div className="card text-center">
          <h2 className="text-xl">Revenue</h2>
          <p className="text-3xl font-bold">₦0</p>
        </div>
      </div>

      {/* Pending Vendors */}
      {pendingVendors.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold mb-4">Vendors Pending Approval</h2>
          <div className="space-y-4">
            {pendingVendors.map(vendor => (
              <div key={vendor.id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{vendor.vendorName}</h3>
                  <p>{vendor.email} | {vendor.phone}</p>
                  <p className="text-sm text-gray-600">Slug: {vendor.vendorSlug}</p>
                </div>
                <button
                  onClick={() => approveVendor(vendor.vendorSlug)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Vendors */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Approved Vendors ({vendors.length})</h2>
        <div className="space-y-2">
          {vendors.map(vendor => (
            <div key={vendor.id} className="border-b pb-2">
              <span className="font-bold">{vendor.vendorName}</span> 
              <span className="text-green-600 ml-2">✓ Approved</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left">Order ID</th>
              <th className="text-left">Vendor</th>
              <th className="text-left">Amount</th>
              <th className="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr className="border-b">
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="border-b">
                  <td>#ORD-{order.id}</td>
                  <td>{order.Vendor?.vendorName || 'N/A'}</td>
                  <td>₦{order.total?.toFixed(2) || '0.00'}</td>
                  <td className={
                    order.status === 'delivered' ? 'text-green-600' :
                    order.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {order.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;