import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
  availableQuantity: number;
}

const Cart: React.FC = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const updateQuantity = (productId: number, quantity: string) => {
    const quantityNumber = parseInt(quantity, 10);
    if (isNaN(quantityNumber) || quantityNumber < 1) return;

    setCart(cart.map(product =>
      product.id === productId ? { ...product, quantity: quantityNumber } : product
    ));
  };

  const placeOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      if (!token || !email) {
        setError('You need to log in to place an order');
        setLoading(false);
        return;
      }

      const userResponse = await axios.get(`http://localhost:3000/users?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userId = userResponse.data.id;

      // Verify available quantities from the server
      for (const product of cart) {
        const productResponse = await axios.get(`http://localhost:3000/products/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const availableQuantity = productResponse.data.quantity;

        if (product.quantity > availableQuantity) {
          setError(`The quantity of ${product.name} exceeds the available stock.`);
          setLoading(false);
          return;
        }
      }

      // Place the order for each product in the cart
      for (const product of cart) {
        await axios.post('http://localhost:3000/orders', {
          customerId: userId,
          productId: product.id,
          quantity: product.quantity,
          deliveryLocation
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      alert('Order placed successfully');
      setCart([]);
      localStorage.removeItem('cart');
      router.push('/customerpage');
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const removeItemFromCart = (productId: number) => {
    setCart(cart.filter(product => product.id !== productId));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cart.map(product => (
          <div key={product.id} className="bg-white shadow-md rounded-lg p-4">
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-700">${product.price}</p>
            <p className="text-gray-700">Category: {product.category}</p>
            <div className="flex items-center mt-2">
              <label className="block text-gray-700 mr-2">Quantity:</label>
              <input
                type="number"
                
                onChange={e => updateQuantity(product.id, e.target.value)}
                className="w-16 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <button
              onClick={() => removeItemFromCart(product.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg mt-2"
            >
              Remove from Cart
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-gray-700 mb-2">Delivery Location</label>
        <input
          type="text"
          value={deliveryLocation}
          onChange={e => setDeliveryLocation(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your delivery address"
          required
        />
      </div>
      <button
        onClick={placeOrder}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 mt-4"
        disabled={loading}
      >
        {loading ? 'Placing order...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Cart;
