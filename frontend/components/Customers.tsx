import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Router, useRouter } from 'next/router';

interface Customer {
  id: number;
  email: string;
  role: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('No token found, please log in.');
          return;
        }
        const response = await axios.get('http://localhost:3000/customers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.status === 401) {
            alert('Unauthorized: Please log in again.');
            
          } else {
            alert('Error fetching customers');
          }
        } else {
          alert('An unknown error occurred');
        }
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Customers</h2>
      <div className="bg-white shadow-md rounded-lg p-6">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.id}>
                <td className="py-2 px-4 border-b border-gray-200">{customer.email}</td>
                <td className="py-2 px-4 border-b border-gray-200">{customer.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
