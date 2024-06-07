import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

const CustomerPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    router.push('/customer-login');
  };

  const fetchProducts = async (query = '') => {
    try {
      const response = await axios.get(`http://localhost:3000/products${query}`);
      setProducts(response.data);
    } catch (error) {
      alert('Error fetching products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    const query = searchQuery ? `?search=${searchQuery}` : '';
    fetchProducts(query);
  }; 

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
    alert(`${product.name} added to cart`);
  };

  const viewCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    router.push('/cart');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 mr-2"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Search
        </button>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 ml-[500px] transition duration-300"
        >
          Sign Out
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-700">${product.price}</p>
            <p className="text-gray-700">{product.category}</p>
            <button onClick={() => addToCart(product)} className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2">Add to Cart</button>
          </div>
        ))}
      </div>
      <button onClick={viewCart} className="px-4 py-2 bg-green-500 text-white rounded-lg mt-4">View Cart</button>
    </div>
  );
};

export default CustomerPage;
