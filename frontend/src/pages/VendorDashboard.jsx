function VendorDashboard() {
  const vendorName = "Meals by Zubs";
  const earnings = "₦124,300";
  const totalOrders = 18;
  const pendingOrders = 3;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Welcome, {vendorName}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card text-center">
          <h2>Earnings</h2>
          <p className="text-2xl font-bold">{earnings}</p>
        </div>
        <div className="card text-center">
          <h2>Total Orders</h2>
          <p className="text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="card text-center">
          <h2>Pending</h2>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Your Products</h2>
        <p>Your menu is live. Customers can order anytime.</p>
      </div>
    </div>
  );
}

export default VendorDashboard;