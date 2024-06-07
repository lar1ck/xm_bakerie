import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:3000/login', { email, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        alert('Login successful');
        router.push('/'); 
      })
      .catch(error => alert('Error logging in'));
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Login</button>
      </form>
      <p className="text-center">
        Do not have an account? <a href="/register" className="text-blue-500">Register</a>
      </p>
    </div>
  );
};

export default LoginForm;
