
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  delivery_location: string;
  order_date: string;
  customer_email: string;
  deleted_at: string | null;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No token found, please log in.');
          return;
        }

        const response = await axios.get('http://localhost:3000/order_history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched order history:', response.data); // Debug log
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching order history:', error); // Improved error logging
        alert('Error fetching order history');
      }
    };

    fetchOrderHistory();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Order History</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product ID</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery Location</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Date</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Email</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">No order history found.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border-b border-gray-200">{order.id}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.product_id}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.product_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.quantity}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.delivery_location}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{new Date(order.order_date).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.customer_email}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    {order.deleted_at ? (
                      <span className="text-red-500">Dismissed</span>
                    ) : (
                      <span className="text-green-500">Accepted</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;
