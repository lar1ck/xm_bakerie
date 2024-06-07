import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:3000/register', { email, password, role })
      .then(response => {
        alert('User registered successfully');
        router.push('/login'); 
      })
      .catch(error => alert('Error registering user'));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded">
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Register</button>
      </form>
      <p className="text-center">
        Already have an account? <a href="/login" className="text-blue-500">Login</a>
      </p>
    </div>
  );
};

export default RegisterForm;
