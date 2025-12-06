import React, { useState } from 'react';
import axios from 'axios';

export default function PromptPayPayment({ amount, onSuccess, onError, processing: externalProcessing }) {
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  const processing = externalProcessing || localProcessing;

  // Sample PromptPay Phone: 0812345678 (for demo)
  // In production, you would use actual merchant PromptPay ID
  const PROMPTPAY_PHONE = '0812345678';

  const generateQRCode = async () => {
    try {
      setLocalProcessing(true);
      setError(null);

      // In production, you would use a real PromptPay QR generation service
      // This is a demo that generates a simple QR code with payment info
      const paymentString = `00020126560014th.co.bumrungrad01011300991234567852040000530337646406${amount.toFixed(2)}6304`;

      setQrCode(paymentString);
      setShowQR(true);
    } catch (err) {
      setError('Failed to generate QR code');
      onError?.('QR code generation failed');
    } finally {
      setLocalProcessing(false);
    }
  };

  const confirmPayment = async () => {
    try {
      setLocalProcessing(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/promptpay`,
        {
          amount: amount,
          phone: PROMPTPAY_PHONE,
          reference: Math.random().toString(36).substring(7).toUpperCase(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setVerified(true);
        onSuccess({
          method: 'promptpay',
          transactionId: response.data.data.transactionId,
          reference: response.data.data.reference,
          status: 'pending-verification',
        });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'PromptPay payment failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLocalProcessing(false);
    }
  };

  if (verified) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-bold text-green-600 mb-2">Payment Request Sent</h3>
        <p className="text-gray-700 mb-4">
          PromptPay payment request has been submitted. You can scan the QR code from your banking app
          to complete the payment.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Amount:</strong> ฿{amount.toFixed(0)}<br />
          <strong>Receiver:</strong> PromptPay ID: {PROMPTPAY_PHONE}
        </p>
        <p className="text-xs text-green-600">
          Your order status will update once payment is verified (usually within minutes).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-800 mb-4">PromptPay Payment (Thailand)</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {!showQR ? (
        <div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-gray-700 mb-4">
            <p className="font-semibold mb-2">💳 PromptPay Payment Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Generate QR Code" below</li>
              <li>Open your banking app (Krungsri, SCB, KBank, etc.)</li>
              <li>Select "Transfer by QR Code" or "PromptPay"</li>
              <li>Scan the generated QR code</li>
              <li>Confirm payment amount: <strong>฿{amount.toFixed(0)}</strong></li>
              <li>Complete the transaction</li>
            </ol>
          </div>

          <button
            onClick={generateQRCode}
            disabled={processing}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition font-bold"
          >
            {processing ? 'Generating QR Code...' : 'Generate PromptPay QR Code'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3 font-semibold">Scan this QR code with your banking app:</p>

            {/* Simple QR display - in production, use qrcode.react library */}
            <div className="flex justify-center my-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-2">📱</div>
                    <p className="text-xs text-gray-600 font-monospace">QR Code</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Amount: ฿{amount.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800 mb-4">
              <p className="font-semibold">⏱️ Valid for 10 minutes</p>
              <p>Please complete the payment within this time frame</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Or transfer manually to:</strong>
              </p>
              <p className="font-mono text-gray-800 bg-gray-100 p-2 rounded">
                PromptPay ID: {PROMPTPAY_PHONE}
              </p>
            </div>
          </div>

          <button
            onClick={confirmPayment}
            disabled={processing}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-bold"
          >
            {processing ? 'Processing...' : 'I have completed the payment'}
          </button>

          <button
            onClick={() => setShowQR(false)}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Back
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        🔒 PromptPay is Thailand's secure national payment system
      </p>
    </div>
  );
}
