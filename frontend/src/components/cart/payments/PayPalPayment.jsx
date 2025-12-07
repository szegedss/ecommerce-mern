import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PayPalPayment({ amount, onSuccess, onError, processing: externalProcessing }) {
  const [paypalScript, setPaypalScript] = useState(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processing = externalProcessing || localProcessing;
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb-test-client-id';

  useEffect(() => {
    // Load PayPal script
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=THB`;
    script.async = true;
    script.onload = () => {
      setPaypalScript(true);
      initializePayPalButtons();
    };
    script.onerror = () => {
      setError('Failed to load PayPal. Please try another payment method.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [PAYPAL_CLIENT_ID]);

  const initializePayPalButtons = () => {
    if (!window.paypal) return;

    window.paypal
      .Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: 'THB',
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          try {
            setLocalProcessing(true);
            const orderData = await actions.order.capture();
            const token = localStorage.getItem('token');

            // Send PayPal payment confirmation to backend
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/paypal`,
              {
                paypalOrderId: orderData.id,
                paypalPayerId: data.payerID,
                amount: amount,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (response.data.success) {
              onSuccess({
                method: 'paypal',
                transactionId: response.data.data.transactionId,
                paypalOrderId: orderData.id,
                status: 'completed',
              });
            }
          } catch (err) {
            const errorMsg = err.response?.data?.message || 'PayPal payment failed';
            setError(errorMsg);
            onError?.(errorMsg);
          } finally {
            setLocalProcessing(false);
          }
        },
        onError: (err) => {
          setError('PayPal payment was cancelled or failed');
          onError?.('PayPal payment error');
          console.error('PayPal error:', err);
        },
      })
      .render('#paypal-button-container');
  };

  if (!paypalScript) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-800 mb-4">PayPal Checkout</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-gray-700 mb-4">
        <p>Click the button below to proceed with PayPal payment.</p>
        <p className="font-semibold mt-2">Amount: ฿{amount.toFixed(0)}</p>
      </div>

      <div id="paypal-button-container" className="mt-4"></div>

      <p className="text-xs text-gray-500 text-center">
        🔒 PayPal is a secure payment gateway
      </p>
    </div>
  );
}
