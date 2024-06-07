import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products: initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sortKey, setSortKey] = useState<keyof Product | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch products from the server every 10 seconds for real-time updates
  useEffect(() => {
    const fetchProducts = () => {
      axios.get('http://localhost:3000/products')
        .then(response => {
          let updatedProducts = response.data;
          if (sortKey) {
            updatedProducts = sortProducts(updatedProducts, sortKey, sortOrder);
          }
          setProducts(updatedProducts);
        })
        .catch(error => alert('Error fetching products'));
    };

    fetchProducts(); // Initial fetch
    const interval = setInterval(fetchProducts, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [sortKey, sortOrder]);

  const sortProducts = (products: Product[], key: keyof Product, order: 'asc' | 'desc') => {
    return products.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  };

  const handleSort = (key: keyof Product) => {
    let newSortOrder: 'asc' | 'desc' = 'asc';
    if (sortKey === key && sortOrder === 'asc') {
      newSortOrder = 'desc';
    }
    setSortKey(key);
    setSortOrder(newSortOrder);
    setProducts(sortProducts(products, key, newSortOrder));
  };

  const deleteProduct = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token found, please log in.');
        return;
      }

      await axios.delete(`http://localhost:3000/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(product => product.id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      alert('Error deleting product');
    }
  };

  return (
    <div className="container mx-auto p-4">
  <h2 className="text-2xl font-bold mb-4">Product List</h2>
  <div className="mb-4 flex flex-wrap gap-2">
    <button 
      onClick={() => handleSort('name')} 
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Sort by Name
    </button>
    <button 
      onClick={() => handleSort('price')} 
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Sort by Price
    </button>
    <button 
      onClick={() => handleSort('category')} 
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Sort by Category
    </button>
    <button 
      onClick={() => handleSort('quantity')} 
      className="px-4 py-2 bg-blue-500 text-white rounded-lg"
    >
      Sort by Quantity
    </button>
  </div>
  <ul className="space-y-2">
    {products.map((product) => (
      <li key={product.id} className="border p-4 rounded-lg bg-white">
        <div className="flex justify-between">
          <span className="font-semibold">{product.name}</span>
          <span className="text-gray-600">${product.price}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{product.category}</span>
          <span className="text-gray-600">{product.quantity} pcs</span>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={() => deleteProduct(product.id)} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg mt-2"
          >
            Delete
          </button>
        </div>
      </li>
    ))}
  </ul>
</div>

  );
};

export default ProductList;
