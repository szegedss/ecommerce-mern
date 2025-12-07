import React, { useState } from 'react';
import axios from 'axios';
import StripePayment from './payments/StripePayment';
import PayPalPayment from './payments/PayPalPayment';
import PromptPayPayment from './payments/PromptPayPayment';

export default function PaymentGateway({ total, orderId, onSuccess, onError }) {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      setProcessing(true);
      setError(null);

      // Send payment confirmation to backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/confirm`,
        {
          orderId,
          paymentMethod: selectedMethod,
          paymentDetails,
          amount: total,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        setError(response.data.message || 'Payment confirmation failed');
        onError?.(response.data.message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Payment processing failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'stripe',
      name: '💳 Stripe Card',
      description: 'Credit/Debit Card (Visa, Mastercard)',
      icon: '🎫',
    },
    {
      id: 'paypal',
      name: '🅿️ PayPal',
      description: 'Fast and secure PayPal checkout',
      icon: '🏪',
    },
    {
      id: 'promptpay',
      name: '📱 PromptPay',
      description: 'Thailand mobile payment (QR Code)',
      icon: '📲',
    },
    {
      id: 'bank-transfer',
      name: '🏦 Bank Transfer',
      description: 'Direct bank transfer',
      icon: '🏛️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Payment Method</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedMethod === method.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 bg-white hover:border-orange-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{method.name}</div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-semibold">Error: {error}</p>
          </div>
        )}

        {/* Payment Form Based on Selected Method */}
        <div className="border-t pt-6">
          {selectedMethod === 'stripe' && (
            <StripePayment
              amount={total}
              onSuccess={handlePaymentSuccess}
              onError={setError}
              processing={processing}
            />
          )}

          {selectedMethod === 'paypal' && (
            <PayPalPayment
              amount={total}
              onSuccess={handlePaymentSuccess}
              onError={setError}
              processing={processing}
            />
          )}

          {selectedMethod === 'promptpay' && (
            <PromptPayPayment
              amount={total}
              onSuccess={handlePaymentSuccess}
              onError={setError}
              processing={processing}
            />
          )}

          {selectedMethod === 'bank-transfer' && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-4">Bank Transfer Details</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>Bank:</strong> Sample Bank Thailand</p>
                <p><strong>Account Name:</strong> Pet Paradise Co., Ltd.</p>
                <p><strong>Account Number:</strong> 1234567890</p>
                <p><strong>SWIFT Code:</strong> SAMBSTH</p>
                <p><strong>Amount to Transfer:</strong> ฿{total.toFixed(0)}</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Please transfer the exact amount and your order will be confirmed upon receipt.
              </p>
              <button
                onClick={() => handlePaymentSuccess({ method: 'bank-transfer', reference: Date.now() })}
                className="mt-4 w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'I have transferred the amount'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-800 mb-4">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Amount to Pay:</span>
            <span className="font-bold text-orange-600">฿{total.toFixed(0)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            🔒 Your payment information is encrypted and secure. We never store full card details.
          </p>
        </div>
      </div>
    </div>
  );
}
