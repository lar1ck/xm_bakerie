import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  product_name: string;
  quantity: number;
  delivery_location: string;
  order_date: string;
  customer_email: string;
}

const OrderForm: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No token found, please log in.');
          return;
        }

        const response = await axios.get('http://localhost:3000/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data);
      } catch (error) {
        alert('Error fetching orders');
      }
    };

    fetchOrders();
  }, []);

  const deleteOrder = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found, please log in.');
        return;
      }

      await axios.delete(`http://localhost:3000/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(orders.filter(order => order.id !== orderId));
      alert('Order deleted ');
    } catch (error) {
      alert('Error deleting order');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery Location</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Date</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Email</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">No orders found.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border-b border-gray-200">{order.id}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.product_name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.quantity}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.delivery_location}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{new Date(order.order_date).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{order.customer_email}</td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <button onClick={() => deleteOrder(order.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg">Dismiss</button>
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

export default OrderForm;
