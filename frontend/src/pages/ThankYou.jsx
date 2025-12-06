import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ThankYou() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrder(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-20 text-center px-4">
          <div className="bg-white rounded-lg shadow-md p-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Oops!</h2>
            <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-md p-12 text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">✅</div>
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            We've received your order and will process it shortly.
          </p>
          <p className="text-gray-500 mb-6">
            A confirmation email has been sent to <span className="font-semibold">{order.shippingAddress?.email}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h2>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-semibold text-gray-800">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold text-gray-800">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Method</p>
              <p className="font-semibold text-gray-800 capitalize">
                {order.paymentMethod?.replace('-', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="font-semibold">
                <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  {order.status}
                </span>
              </p>
            </div>
          </div>

          {/* Items */}
          <h3 className="text-lg font-bold text-gray-800 mb-4">Items Ordered</h3>
          <div className="space-y-3 mb-6 pb-6 border-b">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-800">
                  ฿{((item.price || 0) * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <h3 className="text-lg font-bold text-gray-800 mb-4">Price Summary</h3>
          <div className="space-y-3 pb-6 border-b">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold">฿{order.subtotal?.toFixed(0)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span className="font-semibold">-฿{order.discount.toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-700">Tax (10%):</span>
              <span className="font-semibold">฿{order.tax?.toFixed(0)}</span>
            </div>

            <div className="flex justify-between text-xl font-bold">
              <span className="text-gray-800">Total:</span>
              <span className="text-orange-600">฿{order.total?.toFixed(0)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <h3 className="text-lg font-bold text-gray-800 mb-4">Shipping Address</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800">
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
            </p>
            <p className="text-gray-600">{order.shippingAddress?.address}</p>
            <p className="text-gray-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            </p>
            <p className="text-gray-600">{order.shippingAddress?.country}</p>
            <p className="text-gray-600 mt-2">Phone: {order.shippingAddress?.phone}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">What's Next?</h2>
          <p className="text-gray-600 mb-6">
            We're preparing your order for shipment. You can track your order status in your account.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/account/orders')}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-bold"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Need Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Need help? Contact our customer support team</p>
          <p className="text-lg font-semibold text-orange-600">support@petparadise.com</p>
        </div>
      </div>
    </div>
  );
}
