import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const CustomerLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/customer-login', { email, password });
      const { token, role } = response.data;
      
      if (role !== 'customer') {
        setError('Only customers can log in.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('email', email);
      alert('Login successful');

      setTimeout(() => {
        router.push('/customerpage');
      }, 100);
    } catch (error) {
      setError('Email or password are incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="mb-8 p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Customer Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-center">
        Do not have an account? <a href="/register" className="text-blue-500">Register</a>
      </p>
    </div>
  );
};

export default CustomerLoginForm;
;
// CustomerLoginForm