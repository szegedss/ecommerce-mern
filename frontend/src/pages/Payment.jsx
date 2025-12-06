import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, useCheckoutStore, useAuthStore } from '../store';
import axios from 'axios';

export default function Payment() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { shippingAddress, paymentMethod, setPaymentMethod, clearCheckout } = useCheckoutStore();
  const { user, token } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Redirect if no shipping address
  React.useEffect(() => {
    if (!shippingAddress) {
      navigate('/checkout');
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [shippingAddress, items, navigate]);

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  const handleCardInputChange = (e) => {
    let { name, value } = e.target;

    // Format card number
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').slice(0, 16);
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    }

    // Format expiry date
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2);
      }
    }

    // Format CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCardData = () => {
    if (!cardData.cardName.trim()) {
      setError('Card holder name is required');
      return false;
    }
    if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Card number must be 16 digits');
      return false;
    }
    if (cardData.expiryDate.length !== 5) {
      setError('Expiry date must be MM/YY');
      return false;
    }
    if (cardData.cvv.length !== 3) {
      setError('CVV must be 3 digits');
      return false;
    }
    return true;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateCardData()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone,
        },
        paymentMethod: paymentMethod,
        paymentStatus: 'completed',
        status: 'processing',
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear cart and checkout data
      clearCart();
      clearCheckout();

      // Redirect to order confirmation
      navigate('/order-confirmation', {
        state: { orderId: response.data.data._id },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Payment</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Review */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Shipping Address
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-800">{shippingAddress?.fullName}</p>
                <p className="text-gray-600">{shippingAddress?.street}</p>
                <p className="text-gray-600">
                  {shippingAddress?.city}, {shippingAddress?.state}{' '}
                  {shippingAddress?.zipCode}
                </p>
                <p className="text-gray-600">{shippingAddress?.country}</p>
                <p className="text-gray-600 mt-2">
                  Phone: {shippingAddress?.phone}
                </p>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="mt-3 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Edit Address
              </button>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-blue-500 rounded-lg cursor-pointer bg-blue-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit-card"
                    checked={paymentMethod === 'credit-card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-semibold text-gray-800">
                    💳 Credit/Debit Card
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-semibold text-gray-800">
                    🅿️ PayPal
                  </span>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank-transfer"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 font-semibold text-gray-800">
                    🏦 Bank Transfer
                  </span>
                </label>
              </div>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === 'credit-card' && (
              <form
                onSubmit={handleSubmitOrder}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Card Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Holder Name *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardData.cardName}
                      onChange={handleCardInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleCardInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardInputChange}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    💡 This is a demo. Use any test card details above.
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-bold text-lg"
                  >
                    {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}

            {paymentMethod !== 'credit-card' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 mb-6">
                  Payment method details coming soon. Please use credit card for now.
                </p>
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-bold text-lg"
                >
                  {loading ? 'Processing...' : `Complete Order - $${total.toFixed(2)}`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-2 mb-4 pb-4 border-b max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (10%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Back to Checkout
              </button>

              {/* Security Info */}
              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-gray-600 mb-2">🔒 Secure Payment</p>
                <p className="text-xs text-gray-500">
                  Your payment information is encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
