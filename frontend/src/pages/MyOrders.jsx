import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [reviewedOrders, setReviewedOrders] = useState({});
  const [waitingConfirmation, setWaitingConfirmation] = useState({});
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrders();
  }, [page]);

  // Check which products have been reviewed
  useEffect(() => {
    if (orders.length > 0) {
      checkReviewedProducts();
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/orders?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        console.warn('API returned success: false', response.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed - invalid token');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check which products have been reviewed
  const checkReviewedProducts = async () => {
    try {
      const reviewed = {};
      const waiting = {};
      
      for (const order of orders) {
        if (order.status === 'delivered') {
          for (const item of order.items) {
            // Handle both object and string productId
            const productId = typeof item.productId === 'object' 
              ? item.productId?._id 
              : item.productId;
            
            if (productId) {
              try {
                const response = await axios.get(
                  `${API_URL}/reviews/check-review-eligibility/${productId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                
                console.log('Review eligibility check:', {
                  productId,
                  orderId: order._id,
                  canReview: response.data.canReview,
                  reason: response.data.reason
                });
                
                const key = `${order._id}-${productId}`;
                
                // Check if already reviewed
                if (response.data.reason === 'already_reviewed_all_orders') {
                  reviewed[key] = true;
                }
                
                // Check if waiting for confirmation
                if (response.data.reason === 'waiting_for_delivery_confirmation') {
                  waiting[key] = true;
                }
              } catch (error) {
                console.error('Error checking review eligibility:', error);
                // Don't throw, just continue with next product
              }
            }
          }
        }
      }
      
      console.log('Final reviewed state:', reviewed);
      console.log('Final waiting state:', waiting);
      setReviewedOrders(reviewed);
      setWaitingConfirmation(waiting);
    } catch (error) {
      console.error('Error checking reviewed products:', error);
    }
  };

  // Confirm delivery and then navigate to review
  const handleConfirmDeliveryAndReview = async (orderId, productId) => {
    try {
      // First, confirm delivery
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/confirm-delivery`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state to remove from waiting
        const key = `${orderId}-${productId}`;
        setWaitingConfirmation(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });

        // Navigate to product page for review
        navigate(`/product/${productId}`);
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '📦',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
    };
    return icons[status] || '❓';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle navigate to product review
  const handleReviewClick = (productId) => {
    navigate(`/product/${productId}`, { state: { scrollToReview: true } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">You haven't placed any orders yet.</p>
            <a href="/" className="text-orange-600 hover:text-orange-700 font-semibold mt-2 inline-block">
              Continue Shopping →
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Order Number</p>
                      <p className="text-lg font-bold text-gray-800 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Order Date</p>
                      <p className="text-lg font-semibold text-gray-800">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Total Amount</p>
                      <p className="text-lg font-bold text-orange-600">฿{order.total?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-4">Items</h3>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => {
                      // Handle both object and string productId
                      const productId = typeof item.productId === 'object' 
                        ? item.productId?._id 
                        : item.productId;
                      
                      return (
                        <div key={idx} className="flex justify-between items-start py-2 border-b last:border-b-0">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">฿{(item.price * item.quantity).toLocaleString()}</p>
                            
                            {/* Review Button for Delivered Orders - only if not reviewed and not waiting confirmation */}
                            {order.status === 'delivered' && 
                              !reviewedOrders[`${order._id}-${productId}`] && 
                              !waitingConfirmation[`${order._id}-${productId}`] && (
                              <button
                                onClick={() => handleReviewClick(productId)}
                                className="mt-2 px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition inline-block"
                              >
                                ⭐ Review
                              </button>
                            )}

                            {/* Confirm & Review Button for orders waiting confirmation */}
                            {order.status === 'delivered' && waitingConfirmation[`${order._id}-${productId}`] && (
                              <button
                                onClick={() => handleConfirmDeliveryAndReview(order._id, productId)}
                                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition inline-block"
                              >
                                📦 Confirm & Review
                              </button>
                            )}
                            
                            {/* Reviewed Badge */}
                            {order.status === 'delivered' && reviewedOrders[`${order._id}-${productId}`] && (
                              <div className="mt-2 text-xs text-green-600 font-semibold">
                                ✓ Already Reviewed
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-4">Tracking History</h3>
                  <div className="space-y-4">
                    {order.timeline && order.timeline.length > 0 ? (
                      order.timeline.map((event, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-600">
                              {getStatusIcon(event.status)}
                            </div>
                            {idx < order.timeline.length - 1 && (
                              <div className="w-0.5 h-12 bg-gray-300 absolute ml-4"></div>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="font-semibold text-gray-800 capitalize">{event.status}</p>
                            <p className="text-sm text-gray-600">{formatDate(event.timestamp)}</p>
                            {event.note && <p className="text-sm text-gray-700 mt-1">{event.note}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-sm">Order created on {formatDate(order.createdAt)}</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-gray-800 mb-3">Shipping Address</h3>
                  <div className="text-sm text-gray-700">
                    <p>
                      {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                    </p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                    </p>
                    <p>{order.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Payment Method</p>
                      <p className="font-semibold text-gray-800 capitalize">{order.paymentMethod?.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Payment Status</p>
                      <p className={`font-semibold ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.paymentStatus?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 uppercase">Tracking Number</p>
                      <p className="font-mono font-bold text-blue-900">{order.trackingNumber}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-800">฿{order.subtotal?.toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="text-green-600">-฿{order.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax:</span>
                        <span className="text-gray-800">฿{order.tax?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span className="text-gray-800">Total:</span>
                      <span className="text-orange-600">฿{order.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
