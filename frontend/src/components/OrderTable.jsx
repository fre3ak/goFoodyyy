// src/components/OrderTable.jsx
import React from "react";

function Row({ order }) {
  const statusColor = {
    delivered: 'bg-green-100 text-green-700',
    confirmed: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-orange-100 text-orange-800',
    cancelled: 'bg-red-100 text-red-700',
  }[order.status] || 'bg-gray-100 text-gray-700';

  return (
    <tr className="border-b dark:border-gray-700">
      <td className="py-3 px-2 text-sm">{order.id}</td>
      <td className="py-3 px-2 text-sm">{order.customerName}</td>
      <td className="py-3 px-2 text-sm">₦{parseFloat(order.total).toLocaleString()}</td>
      <td className="py3 px-2 text-sm">{new Date(order.createdAt).toLocaleString()}</td>
      <td className="py-3 px-2 text-sm">
        <span className={`px-2 py-1 text-xs rounded ${statusColor}`}>{order.status}</span>
      </td>
      <td className="py-3 px-2 text-sm">
        <a href={`/vendor/orders/${order.id}`} className="text-indigo-600 hover:underline">
          View Details
        </a>
      </td>
    </tr>
  );
}

export default function OrderTable({ orders = [] }) {
  if (!orders.length) {
    return <div className="p-4 text-sm text-gray-500">No orders to show.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      <table className="min-w-full divide-y">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="py-3 px-2 text-left">Order #</th>
            <th className="py-3 px-2 text-left">Customer</th>
            <th className="py-3 px-2 text-left">Total</th>
            <th className="py-3 px-2 text-left">Created At</th>
            <th className="py-3 px-2 text-left">Status</th>
            <th className="py-3 px-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => <Row key={order.id} order={order} />)}
        </tbody>
      </table>
    </div>
  );
}