import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCartStore } from '../store';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`
      );
      setCategories([{ _id: 'all', name: 'All Products', slug: 'all' }, ...response.data.data]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === 'all'
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`
          : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products?category=${selectedCategory}`;

      const response = await axios.get(url);
      setProducts(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    // Show toast notification
    alert(`${product.name} added to cart!`);
  };

  if (error && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat.slug
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found in this category</p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <p className="text-gray-600 mb-4">Showing {products.length} products</p>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden group">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      🛍️
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {product.stock > 0 ? '✓ In Stock' : '✗ Out'}
                  </div>

                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {product.category}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col h-full">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 flex-grow">
                    {product.name}
                  </h3>

                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < Math.round(product.rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">
                        ({product.reviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price and Button */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div>
                      <span className="text-2xl font-bold text-orange-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`px-3 py-2 rounded font-semibold text-white transition ${
                        product.stock > 0
                          ? 'bg-orange-500 hover:bg-orange-600 active:scale-95'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {product.stock > 0 ? '🛒 Add' : 'Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
