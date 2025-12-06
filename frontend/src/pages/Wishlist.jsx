import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistStore, useCartStore, useAuthStore } from '../store';

export default function Wishlist() {
  const { items, loading, error, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [isLoggedIn, navigate, fetchWishlist]);

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    setActionMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleMoveToCart = async (item) => {
    const product = item.product;
    if (product.stock < 1) {
      setActionMessage({ type: 'error', text: 'Product is out of stock' });
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images,
      stock: product.stock,
    }, 1);

    await removeFromWishlist(product._id);
    setActionMessage({ type: 'success', text: 'Moved to cart!' });
    setTimeout(() => setActionMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            ❤️ My Wishlist
            {items.length > 0 && (
              <span className="text-lg text-gray-500 ml-2">({items.length} items)</span>
            )}
          </h1>
          <Link
            to="/"
            className="text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              actionMessage.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 border border-red-300">
            {error}
          </div>
        )}

        {/* Empty Wishlist */}
        {items.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Save products you like by clicking the heart icon!
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Wishlist Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;

              const isOutOfStock = product.stock < 1;

              return (
                <div
                  key={item._id || product._id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition group"
                >
                  {/* Product Image */}
                  <Link to={`/product/${product._id}`} className="block relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url || product.image || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">Out of Stock</span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-orange-500 transition">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                      {product.category}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-orange-500">
                        ฿{product.price?.toLocaleString()}
                      </span>
                      <span className={`text-xs ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                        {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3">
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        disabled={isOutOfStock}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                          isOutOfStock
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        🛒 Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
                        title="Remove from wishlist"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Card */}
        {items.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-gray-600">
                  You have <span className="font-bold text-gray-800">{items.length} items</span> in your wishlist
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Total value: ฿{items.reduce((sum, item) => sum + (item.product?.price || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  to="/cart"
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  View Cart
                </Link>
                <Link
                  to="/"
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
