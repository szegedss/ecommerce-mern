import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCartStore } from '../store';
import { useTranslation } from 'react-i18next';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { i18n, t } = useTranslation();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchProductDetails();
    
    // Check authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products/${productId}`
      );
      console.log('Product response:', response.data);
      setProduct(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product) => {
    return i18n.language === 'th' ? product.name_th : product.name_en;
  };

  const getProductDescription = (product) => {
    return i18n.language === 'th' ? product.description_th : product.description_en;
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`${getProductName(product)} x${quantity} ${t('cart.addedSuccess', 'added to cart!')}`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || 'Product not found'}</p>
          <p className="text-gray-600 mb-4">Product ID: {productId}</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            {t('common.backToProducts', 'Back to Products')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="mb-6 text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
        >
          ← {t('common.backToProducts', 'Back to Products')}
        </button>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8">
              {product.image ? (
                <img
                  src={product.image}
                  alt={getProductName(product)}
                  className="max-h-500px max-w-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-6xl">🛍️</div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category */}
                {product.category && (
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {product.category}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {getProductName(product)}
                </h1>

                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.round(product.rating)
                              ? 'text-yellow-400 text-xl'
                              : 'text-gray-300 text-xl'
                          }
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviews || 0} {t('common.reviews', 'reviews')})
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {getProductDescription(product)}
                </p>

                {/* Price */}
                <div className="mb-6">
                  {(() => {
                    const hasActiveDiscount = product && product.discount && 
                      product.discount.type && product.discount.type !== 'none' && 
                      product.discount.startDate && 
                      product.discount.endDate &&
                      new Date(product.discount.startDate) <= new Date() &&
                      new Date(product.discount.endDate) >= new Date();

                    const discountedPrice = hasActiveDiscount ? 
                      (product.price - (product.discount.type === 'percentage' 
                        ? (product.price * product.discount.value / 100) 
                        : product.discount.value)) : 
                      product.price;

                    return (
                      <>
                        {hasActiveDiscount ? (
                          <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-red-600">
                              ฿{discountedPrice.toFixed(0)}
                            </span>
                            <span className="text-2xl text-gray-400 line-through">
                              ฿{product.price.toFixed(0)}
                            </span>
                            <span className="text-lg bg-red-100 text-red-700 px-3 py-1 rounded font-semibold">
                              {product.discount.type === 'percentage' 
                                ? `-${product.discount.value}%` 
                                : `-฿${product.discount.value}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-4xl font-bold text-orange-600">
                            ฿{product.price.toFixed(0)}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-semibold text-lg">
                      ✓ {t('common.inStock', 'In Stock')} ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold text-lg">
                      ✗ {t('common.outOfStock', 'Out of Stock')}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4 mb-6">
                    <label className="text-gray-700 font-semibold">
                      {t('common.quantity', 'Quantity')}:
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-0 focus:outline-none"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`px-6 py-3 rounded-lg font-bold text-white text-lg transition ${
                      product.stock > 0
                        ? 'bg-orange-500 hover:bg-orange-600 active:scale-95'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    🛒 {t('cart.addToCart', 'Add to Cart')}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`px-6 py-3 rounded-lg font-bold text-white text-lg transition ${
                      product.stock > 0
                        ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    💳 {t('common.buyNow', 'Buy Now')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-gray-50 p-8 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-600 text-sm">{t('common.category', 'Category')}</p>
                <p className="text-lg font-semibold text-gray-800">{product.category}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">{t('common.stock', 'Stock')}</p>
                <p className="text-lg font-semibold text-gray-800">{product.stock}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">{t('common.rating', 'Rating')}</p>
                <p className="text-lg font-semibold text-gray-800">{product.rating?.toFixed(1)}/5</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">{t('common.reviews', 'Reviews')}</p>
                <p className="text-lg font-semibold text-gray-800">{product.reviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto mt-12">
          <ReviewForm 
            productId={productId} 
            onReviewSubmit={() => setRefreshReviews(prev => prev + 1)}
            isAuthenticated={isAuthenticated}
            userName={currentUser?.name}
          />
          <ReviewsList 
            productId={productId} 
            refreshTrigger={refreshReviews}
          />
        </div>
      </div>
    </div>
  );
}
