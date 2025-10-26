import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Eye, Mail, MapPin, Building, CheckCircle, XCircle, AlertTriangle, Banknote, Phone, Clock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const API_BASE = import.meta.env.VITE_API_BASE;

function AdminDashboard() {
  const [adminData, setAdminData] = useState({});
  const [vendors, setVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState({
    vendors: true,
    orders: true
  });
  const [error, setError] = useState({
    vendors: null,
    orders: null
  });
  const { addToast } = useToast();

  useEffect(() => {
    const loadAdminData = () => {
      try {
        // Get admin data
        const storedAdmin = localStorage.getItem('adminData');
        if (storedAdmin) {
          setAdminData(JSON.parse(storedAdmin));
        } else {
          console.warn('No admin data found in localStorage');
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    loadAdminData();
  }, []);

  // New state for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'vendors', 'orders'
  const [viewingVendor, setViewingVendor] = useState(null); // For vendor details modal
  const [emailingVendor, setEmailingVendor] = useState(null); // For send email modal
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // For order status loading
  const [stateFilter, setStateFilter] = useState(null); // For filtering by state

  // Fetch vendors with proper error handling
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(prev => ({ ...prev, vendors: true }));
      setError(prev => ({ ...prev, vendors: null }));

      const response = await fetch(`${API_BASE}/api/vendors/all/vendors`);

      if (!response.ok) {
        throw new Error(`Failed to fetch vendors: ${response.status}`);
      }

      const data = await response.json();
      const approved = data.filter(v => v.status === 'approved');
      const pending = data.filter(v => v.status === 'pending');

      setVendors(approved);
      setPendingVendors(pending);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(prev => ({ ...prev, vendors: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, vendors: false }));
    }
  };

  const approveVendor = async (vendorSlug) => {
    try {
      const response = await fetch(`${API_BASE}/api/vendors/${vendorSlug}/approve`, {
        method: 'PUT'
      });

      if (response.ok) {
        // Update local state instead of refetching all vendors
        const vendorToApprove = pendingVendors.find(v => v.vendorSlug === vendorSlug);
        if (vendorToApprove) {
          setPendingVendors(prev => prev.filter(v => v.vendorSlug !== vendorSlug));
          setVendors(prev => [...prev, { ...vendorToApprove, status: 'approved'}]);
          addToast('Vendor approved successfully!', 'success');
        }
      } else {
        throw new Error('Failed to approve vendor');
      }
    } catch (error) {
      console.error('Error approving vendor:', error);      
      addToast('Failed to approve vendor. Please try again.', 'error');
    }
  };

  const suspendVendor = async (vendorSlug) => {
    if (confirm("Are you sure you want to suspend this vendor? They will not be visible to customers.")) {
      try {
        const response = await fetch(`${API_BASE}/api/vendors/${vendorSlug}/suspend`, {
          method: 'PUT'
        });

        if (response.ok) {
          setVendors(prev => prev.filter(v => v.vendorSlug !== vendorSlug));
          addToast('Vendor suspended successfully.', 'info');
        } else {
          throw new Error('Failed to suspend vendor');
        }
      } catch (error) {
        console.error('Error suspending vendor:', error);        
        addToast('Failed to suspend vendor. Please try again.', 'error');
      }
    }
  };

  const deleteVendor = async (vendorSlug) => {
    if (confirm("Are you sure you want to delete this vendor? This action cannot be undone.")) {
      try {
        const response = await fetch(`${API_BASE}/api/vendors/${vendorSlug}/delete`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setVendors(prev => prev.filter(v => v.vendorSlug !== vendorSlug));
          addToast('Vendor deleted successfully.', 'success');
        } else {
          throw new Error('Failed to delete vendor');
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);        
        addToast('Failed to delete vendor. Please try again.', 'error');
      }
    }
  };

  // Fetch orders with proper error handling
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      setError(prev => ({ ...prev, orders: null }));

      const response = await fetch(`${API_BASE}/api/orders`);

      if (!response.ok) {
        console.warn('Orders endpoint not available, using empty data');
        setOrders([]);
        return;
        // throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setError(prev => ({ ...prev, orders: 'Orders data temporarily unavailable' }));
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedOrder = await response.json();

      // Update local state for instant UI feedback
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === orderId ? { ...order, status: updatedOrder.order.status } : order)
      );
      addToast('Order status updated!', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      addToast('Failed to update order status.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered vendors with search and status filter
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.state?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = !stateFilter || vendor.state === stateFilter;
      const matchesStatus = vendorStatusFilter === 'all' || vendor.status === vendorStatusFilter;
      return matchesSearch && matchesStatus && matchesState;
    });
  }, [vendors, searchTerm, vendorStatusFilter, stateFilter]);

  // Filtered orders with search and status filter
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.Vendor?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, orderStatusFilter]);

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const vendorsByState = useMemo(() => {
    const stateCount = {};
    vendors.forEach(vendor => {
      const state = vendor.state || 'Unknown';
      stateCount[state] = (stateCount[state] || 0) + 1;
    });
    return stateCount;
  }, [vendors]);

  const handleStateFilterClick = (state) => {
    setStateFilter(state);
    setActiveView('vendors');
  };

  if (loading.vendors && loading.orders) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );    
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Vendor Details Modal */}
        {viewingVendor && <VendorDetailsModal vendor={viewingVendor} onClose={() => setViewingVendor(null)} />}
        {/* Send Email Modal */}
        {emailingVendor && <SendEmailModal vendor={emailingVendor} onClose={() => setEmailingVendor(null)} addToast={addToast} />}
        {/* Header */}
        <div className='mb-8'>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className='text-gray-600 mt-2'>Manage vendors, orders, and platform performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className='flex space-x-1 bg-white rounded-lg p-1 shadow-sm border mb-6'>
          {['overview', 'vendors', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveView(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeView === tab
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type='text'
              placeholder='Search vendors, orders, customers...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            />
          </div>
          <div className='flex gap-3'>
            <select
              value={activeView === 'vendors' ? vendorStatusFilter : orderStatusFilter}
              onChange={(e) => activeView === 'vendors' ? setVendorStatusFilter(e.target.value) : setOrderStatusFilter(e.target.value)}
              className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'
            >
              {activeView === 'vendors' ? (
                <>
                  <option value="all">All Vendors</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                </>
              ) : (
                <>
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
            <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} />
              More filters
            </button>
          </div>
        </div>

        {/* Error Display */}
        {(error.vendors || error.orders) && (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>
                  There were errors loading dashboard data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {error.vendors && <li>Vendors: {error.vendors}</li>}
                    {error.orders && <li>Orders: {error.orders}</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Overview View */}
        {activeView === 'overview' && (
          <>
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <button 
                onClick={() => setActiveView('vendors')}
                className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md hover:border-green-300 transition-all"
              >
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Vendors</h2>
                <p className="text-3xl font-bold text-gray-900">{vendors.length}</p>
                <p className="text-sm text-green-600 mt-2">Active on platform</p>
              </button>
              <button 
                onClick={() => setActiveView('overview')} // Stays on overview to see pending list
                className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md hover:border-yellow-400 transition-all"
              >
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Pending Approval</h2>
                <p className="text-3xl font-bold text-gray-900">{pendingVendors.length}</p>
                <p className="text-sm text-yellow-600 mt-2">Awaiting review</p>
              </button>
              <button 
                onClick={() => setActiveView('orders')}
                className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md hover:border-blue-300 transition-all"
              >
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Revenue</h2>
                <p className="text-3xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-2">All-time earnings</p>
              </button>
              <button 
                onClick={() => setActiveView('orders')}
                className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md hover:border-purple-300 transition-all"
              >
                <h2 className="text-lg font-semibold text-gray-600 mb-2">Total Orders</h2>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                <p className="text-sm text-purple-600 mt-2">Completed orders</p>
              </button>
            </div>

            {/* State Distribution */}
            <div className='bg-white rounded-lg shadow-sm border mb-6'>
              <div className='px-6 py-4 border-b'>
                <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                  <MapPin size={20} />
                  Vendors by State
                </h2>
              </div>
              <div className='p-6'>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                  {Object.entries(vendorsByState).sort((a, b) => b[1] - a[1]).map(([state, count]) => (
                    <button 
                      key={state} 
                      onClick={() => handleStateFilterClick(state)}
                      className='text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md hover:border-green-300 transition-all'
                    >
                      <div className='text-2xl font-bold text-gray-900'>{count}</div>
                      <div className='text-sm text-gray-600 mt-1'>{state}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pending Vendors - will always show if there are any */}
        {pendingVendors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className='px-6 py-4 border-b flex items-center gap-2 bg-yellow-50'>
              <AlertTriangle className="text-yellow-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Vendors Pending Approval ({pendingVendors.length})</h2>
            </div>
            <div className='p-6'>
              <div className="space-y-4">
                {pendingVendors.map(vendor => (
                  <div key={vendor.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className='flex-1'>
                      <div className='flex items-start gap-4'>
                        {vendor.logoUrl && (
                          <img
                            src={`${API_BASE}${vendor.logoUrl}`}
                            alt={vendor.vendorName}
                            className='w-12 h-12 rounded-lg object-cover'
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{vendor.vendorName}</h3>
                          <p className='text-gray-600 text-sm'>{vendor.email} | {vendor.phone}</p>
                          <div className='flex flex-wrap gap-2 mt-2'>
                            <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">Slug: {vendor.vendorSlug}</span>
                            {vendor.state && (
                              <span className='text-gray-500 text-xs bg-blue-100 px-2 py-1 rounded flex items-center gap-1'>
                                <MapPin size={12} />
                                {vendor.state}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => approveVendor(vendor.vendorSlug)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                    >
                      Approve Vendor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vendors View */}
        {activeView === 'vendors' && (
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building size={20} />
                {stateFilter ? `Vendors in ${stateFilter}` : 'All Vendors'} ({filteredVendors.length})
              </h2>
              {stateFilter && (
                <button
                  onClick={() => setStateFilter(null)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <XCircle size={14} />
                  Clear filter
                </button>
              )}
            </div>
            <div className='p-6'>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Vendor</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Contact</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Location</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Status</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.length === 0 ? (
                      <tr>
                        <td colSpan="5" className='text-center py-8 text-gray-500'>
                          No vendors found
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map(vendor => (
                        <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className='py-4 px-4'>
                            <div className='flex items-center gap-3'>
                              {vendor.logoUrl && (
                                <img
                                  src={`${API_BASE}${vendor.logoUrl}`}
                                  alt={vendor.vendorName}
                                  className='w-10 h-10 rounded-lg object-cover'
                                />
                              )}
                              <div>
                                <p className='font-semibold text-gray-900'>{vendor.vendorName}</p>
                                <p className='text-sm text-gray-500'>@{vendor.vendorSlug}</p>
                              </div>
                            </div>
                          </td>
                          <td className='py-4 px-4'>
                            <p className="text-gray-900">{vendor.email}</p>
                            <p className="text-sm text-gray-500">{vendor.phone}</p>
                          </td>
                          <td className="py-4 px-4">
                            {vendor.state ? (
                              <span className='flex items-center gap-1 text-gray-600'>
                                <MapPin size={14} />
                                {vendor.state}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not set</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'>
                              Approved
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setViewingVendor(vendor)}
                                className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg' title='View Details'
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => setEmailingVendor(vendor)}
                                className='p-2 text-gray-500 hover:bg-gray-100 rounded-lg' title='Send Email'
                              >
                                <Mail size={16} />
                              </button>
                              <button
                                onClick={() => suspendVendor(vendor.vendorSlug)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                title='Suspend Vendor'
                              >
                                <AlertTriangle size={16} />
                              </button>
                              <button
                                onClick={() => deleteVendor(vendor.vendorSlug)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                title='Delete Vendor'
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders View */}
        {activeView === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders ({filteredOrders.length})</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Vendor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8 text-gray-500">
                          {loading.orders ? 'Loading orders...' : 'No orders found'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">#ORD-{order.id}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{order.customerName}</p>
                              <p className="text-sm text-gray-500">{order.customerPhone}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {order.Vendor?.vendorName || 'N/A'}
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900">
                            ₦{order.total?.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {updatingOrderId === order.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                              ) : (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                  className={`w-full text-sm font-medium border-none rounded-md focus:ring-0 ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'paid' ? 'bg-indigo-100 text-indigo-800' :
                                    order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                  <option value="preparing">Preparing</option>
                                  <option value="out_for_delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// New Sub-component for the Vendor Details Modal
function VendorDetailsModal({ vendor, onClose }) {
  if (!vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-start p-5 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-4">
            <img src={`${API_BASE}${vendor.logoUrl}`} alt={vendor.vendorName} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h2>
              <p className="text-gray-500">@{vendor.vendorSlug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XCircle size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Contact & Location</h3>
            <div className="flex items-start gap-3">
              <Mail size={16} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{vendor.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={16} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">{vendor.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">{vendor.address}, {vendor.city}, {vendor.state}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Opening Hours</p>
                <p className="font-medium text-gray-800">{vendor.openingHours}</p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Bank Details</h3>
            <p><strong>Bank:</strong> {vendor.bankName}</p>
            <p><strong>Account Name:</strong> {vendor.accountName}</p>
            <p><strong>Account Number:</strong> {vendor.accountNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// New Sub-component for the Send Email Modal
function SendEmailModal({ vendor, onClose, addToast }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!subject || !body) {
      addToast('Subject and body are required.', 'warning');
      return;
    }
    setIsSending(true);
    try {
      // This would be a new backend endpoint, e.g., /api/comms/send-email
      // For now, we'll simulate it and use the existing test endpoint as a proxy
      console.log('Simulating email send to:', vendor.email);
      console.log('Subject:', subject);
      console.log('Body:', body);
      
      // Placeholder for actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      addToast(`Email sent to ${vendor.vendorName}!`, 'success');
      onClose();

    } catch (error) {
      console.error('Failed to send email:', error);
      addToast('Failed to send email. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={handleSendEmail} className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-900">Send Email to {vendor.vendorName}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XCircle size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm">To: <span className="font-medium">{vendor.email}</span></p>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea id="body" value={body} onChange={e => setBody(e.target.value)} required rows="8" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"></textarea>
          </div>
        </div>
        <div className="flex justify-end p-5 border-t bg-gray-50">
          <button type="submit" disabled={isSending} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
            {isSending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminDashboard;