import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import PaymentGateway from '../components/PaymentGateway';
import axios from 'axios';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotalPrice, coupon, discountAmount, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subtotal = getTotalPrice();
  const finalSubtotal = subtotal - (discountAmount || 0);
  const tax = finalSubtotal * 0.1;
  const total = finalSubtotal + tax;

  // Check if coming from checkout
  useEffect(() => {
    const createOrder = async () => {
      try {
        if (!user || items.length === 0) {
          navigate('/cart');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders`,
          {
            userId: user._id,
            items: items.map((item) => ({
              productId: item._id,
              name: item.name_th || item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            shippingAddress: location.state?.shippingAddress || {
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ')[1] || '',
              email: user.email,
              phone: user.phone || '',
              address: '',
              city: '',
              postalCode: '',
              country: 'Thailand',
            },
            subtotal,
            discount: discountAmount || 0,
            couponCode: coupon?.uniqueCode || null,
            tax,
            total,
            paymentMethod: 'pending',
            status: 'pending',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.data._id) {
          setOrderId(response.data.data._id);
          setLoading(false);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create order');
        setLoading(false);
      }
    };

    createOrder();
  }, []);

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Clear cart and redirect to thank you
      clearCart();
      navigate(`/thank-you/${orderId}`, {
        state: { paymentData },
      });
    } catch (err) {
      setError('Failed to process order confirmation');
    }
  };

  const handlePaymentError = (errorMsg) => {
    setError(errorMsg);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (error && !orderId) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Setup Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Secure Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Gateway */}
          <div className="lg:col-span-2">
            {orderId && (
              <PaymentGateway
                total={total}
                orderId={orderId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-semibold">Payment Error: {error}</p>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-6 pb-6 border-b max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name_th || item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      ฿{((item.price || 0) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">฿{subtotal.toFixed(0)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span className="font-semibold">-฿{discountAmount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-700">Tax (10%):</span>
                  <span className="font-semibold">฿{tax.toFixed(0)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-800">Total:</span>
                  <span className="text-3xl font-bold text-orange-600">฿{total.toFixed(0)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Back to Checkout
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-gray-600 mb-2">🔒 Secure Payment</p>
                <p className="text-xs text-gray-500">All transactions are encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
