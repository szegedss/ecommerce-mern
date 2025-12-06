import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function Cart() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, applyCoupon, removeCoupon, coupon, discountAmount } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/validate`,
        { code: couponCode, cartTotal: getTotalPrice() }
      );

      if (response.data.data) {
        const discountData = response.data.data;
        applyCoupon(discountData.coupon, discountData.discountAmount);
        setCouponCode('');
        setCouponError(null);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const subtotal = getTotalPrice();
  const finalTotal = subtotal - (discountAmount || 0);
  const tax = finalTotal * 0.1;

  const handleCheckout = () => {
    if (items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-20 text-center px-4">
          <div className="bg-white rounded-lg shadow-md p-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-6 flex gap-4">
                {/* Product Image */}
                {(item.images?.length > 0 || item.image) && (
                  <img
                    src={item.images?.find(img => img.isPrimary)?.url || item.images?.[0]?.url || item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}

                {/* Product Details */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-xl font-semibold text-orange-600">
                    ฿{(item.price || 0).toFixed(0)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-center justify-between">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, Math.max(1, item.quantity - 1))
                      }
                      className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 rounded"
                    >
                      −
                    </button>
                    <span className="px-4 font-semibold text-gray-800 w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 rounded"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right mt-2">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-lg font-bold text-gray-800">
                      ฿{((item.price || 0) * item.quantity).toFixed(0)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="mt-2 px-4 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-3 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              ← Continue Shopping
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>

              {/* Coupon Section */}
              <div className="mb-6 pb-6 border-b">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apply Coupon Code
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={couponLoading || !!coupon}
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !!coupon}
                    className={`px-4 py-2 rounded-lg font-semibold text-white transition ${
                      couponLoading || coupon
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>

                {couponError && (
                  <p className="text-sm text-red-600 mt-2">{couponError}</p>
                )}

                {coupon && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-green-700">
                          ✓ Coupon Applied: {coupon.uniqueCode}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Discount: ฿{discountAmount?.toFixed(0)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          removeCoupon();
                          setCouponCode('');
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Details */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    ฿{subtotal.toFixed(0)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span className="font-semibold">
                      -฿{discountAmount.toFixed(0)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Shipping:</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%):</span>
                  <span className="font-semibold">
                    ฿{tax.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-gray-800">Total:</span>
                <span className="text-3xl font-bold text-orange-600">
                  ฿{(finalTotal + tax).toFixed(0)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-bold text-lg mb-3"
              >
                Proceed to Checkout
              </button>

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Clear Cart
              </button>

              {/* Cart Info */}
              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-sm text-gray-600">
                  Items in cart: <span className="font-bold">{items.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
