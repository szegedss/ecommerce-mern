import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';
import { useTranslation } from 'react-i18next';
import SearchBar from './filters/SearchBar';
import PriceRangeFilter from './filters/PriceRangeFilter';
import RatingFilter from './filters/RatingFilter';
import SortFilter from './filters/SortFilter';
import WishlistButton from './WishlistButton';

export default function ProductGrid() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const { i18n, t } = useTranslation();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset page when filters change (but not on page change)
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, minPrice, maxPrice, minRating, sortBy]);

  // Fetch products when filters or page changes
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, minPrice, maxPrice, minRating, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`
      );
      const allProductsCategory = {
        _id: 'all',
        name_th: 'สินค้าทั้งหมด',
        name_en: 'All Products',
        slug: 'all'
      };
      setCategories([allProductsCategory, ...response.data.data]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (minPrice > 0) {
        params.append('minPrice', minPrice);
      }
      if (maxPrice < 10000) {
        params.append('maxPrice', maxPrice);
      }
      if (minRating > 0) {
        params.append('minRating', minRating);
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }
      params.append('page', currentPage);
      params.append('limit', 20);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products?${params}`
      );
      const productsData = response.data.data || [];
      console.log('Fetched products:', productsData);
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
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

  const getCategoryName = (category) => {
    return i18n.language === 'th' ? category.name_th : category.name_en;
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    alert(`${getProductName(product)} ${t('cart.addedSuccess', 'added to cart!')}`);
  };

  const handleBuyNow = (product) => {
    addToCart(product, 1);
    window.location.href = '/cart';
  };

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleRatingChange = (rating) => {
    setMinRating(rating);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
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
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          {/* Category Filter */}
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {t('products.filterByCategory', 'Filter by Category')}
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === cat.slug
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryName(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <PriceRangeFilter onPriceChange={handlePriceChange} minPrice={minPrice} maxPrice={maxPrice} />

          {/* Rating Filter */}
          <RatingFilter onRatingChange={handleRatingChange} selectedRating={minRating} />

          {/* Sort Filter */}
          <SortFilter onSortChange={handleSortChange} currentSort={sortBy} />
        </div>

        {/* Products Section */}
        <div className="lg:col-span-3">
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {t('products.noProductsFound', 'No products found. Try adjusting your filters.')}
              </p>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <p className="text-gray-600 mb-4">
                {t('products.showing', 'Showing')} {products.length} {t('products.products', 'products')}
              </p>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map((product) => {
                  const hasActiveDiscount = product.discount && 
                    product.discount.type !== 'none' && 
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
                  <div
                    key={product._id}
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col min-h-[600px] cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden group flex-shrink-0">
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

                      {/* Wishlist Button */}
                      <div className="absolute top-2 left-2 z-10">
                        <WishlistButton productId={product._id} size="sm" />
                      </div>

                      {/* Stock Badge */}
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {product.stock > 0 ? '✓ In Stock' : '✗ Out'}
                      </div>

                      {/* Category Badge */}
                      {product.category && (
                        <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {product.category}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                          {getProductName(product)}
                        </h3>

                        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                          {getProductDescription(product)}
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
                      </div>

                      {/* Price and Button */}
                      <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                          {hasActiveDiscount ? (
                            <>
                              <span className="text-lg font-bold text-red-600">
                                ฿{discountedPrice.toFixed(0)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ฿{product.price.toFixed(0)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                                {product.discount.type === 'percentage' 
                                  ? `-${product.discount.value}%` 
                                  : `-฿${product.discount.value}`}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-orange-600">
                              ฿{(product.price || 0).toFixed(0)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={product.stock === 0}
                            className={`flex-1 px-3 py-2 rounded font-semibold text-white transition ${
                              product.stock > 0
                                ? 'bg-orange-500 hover:bg-orange-600 active:scale-95'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            title={t('cart.addToCart', 'Add to Cart')}
                          >
                            🛒
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(product);
                            }}
                            disabled={product.stock === 0}
                            className={`flex-1 px-3 py-2 rounded font-semibold text-white transition ${
                              product.stock > 0
                                ? 'bg-green-500 hover:bg-green-600 active:scale-95'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            title={t('cart.buyNow', 'Buy Now')}
                          >
                            💳
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
