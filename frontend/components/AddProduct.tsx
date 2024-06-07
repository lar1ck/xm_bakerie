import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Product } from "../types/types";

const AddProduct: React.FC = () => {
  const [product, setProduct] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    category: "",
    quantity: 0,
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not authenticated. Please log in first.");
      router.push("/login");
      return;
    }
    axios
      .post("http://localhost:3000/products", product, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => alert("Product added successfully"))
      .catch((error) => {
        if (error.response.status === 401) {
          alert("You are not authorized to add products.");
        } else {
          alert("Error adding product: " + error.message);
        }
      });
  };

  return (
    <form onSubmit={handleSubmit} className="m-8">
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">
          Product Name
        </label>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Price</label>
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Category</label>
        <input
          type="text"
          name="category"
          value={product.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={product.quantity}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Product
      </button>
    </form>
  );
};

export default AddProduct;
