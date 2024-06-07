import React, { useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface FilterProps {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductFilter: React.FC<FilterProps> = ({ setProducts }) => {
  const [filter, setFilter] = useState({
    priceMin: '',
    priceMax: '',
    category: '',
    quantity: ''
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleFilter = () => {
    const query = Object.entries(filter)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    axios.get(`http://localhost:3000/productfilter?${query}`)
      .then(response => {
        setFilteredProducts(response.data);
        setProducts(response.data);
      })
      .catch(error => alert('Error fetching filtered products'));
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-8">
  <h2 className="text-2xl font-bold mb-4">Filter Products</h2>
  <div className="mb-4">
    <label className="block text-gray-700 font-medium">Min Price</label>
    <input
      type="number"
      name="priceMin"
      value={filter.priceMin}
      onChange={handleChange}
      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div className="mb-4">
    <label className="block text-gray-700 font-medium">Max Price</label>
    <input
      type="number"
      name="priceMax"
      value={filter.priceMax}
      onChange={handleChange}
      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div className="mb-4">
    <label className="block text-gray-700 font-medium">Category</label>
    <input
      type="text"
      name="category"
      value={filter.category}
      onChange={handleChange}
      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <div className="mb-4">
    <label className="block text-gray-700 font-medium">Min Quantity</label>
    <input
      type="number"
      name="quantity"
      value={filter.quantity}
      onChange={handleChange}
      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
  <button
    onClick={handleFilter}
    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
  >
    Filter
  </button>

  {filteredProducts.length > 0 && (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Filtered Products</h3>
      <ul className="space-y-2">
        {filteredProducts.map((product) => (
          <li
            key={product.id}
            className="border p-4 rounded-lg shadow-lg bg-white"
          >
            <div className="flex justify-between">
              <span className="font-semibold">{product.name}</span>
              <span className="text-gray-600">${product.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{product.category}</span>
              <span className="text-gray-600">{product.quantity} pcs</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

  );
};

export default ProductFilter;
