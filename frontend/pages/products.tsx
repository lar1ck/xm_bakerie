import React, { useState } from "react";
import AddProduct from "../components/AddProduct";
import ProductFilter from "../components/ProductFilter";
import ProductList from "../components/ProductList";
import { Product } from "../types/types";
import ProtectedRoute from "../components/ProtectedRoute";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold m-8">Products</h1>
        <AddProduct />
        <ProductFilter setProducts={setProducts} />
        <ProductList products={products} />
      </div>
    </ProtectedRoute>
  );
};

export default Products;
