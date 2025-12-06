import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuthStore } from '../store';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          
          // Update user in store if logged in
          if (user) {
            setUser({ ...user, isEmailVerified: true });
          }
        }
      } catch (err) {
        setStatus('error');
        const errorCode = err.response?.data?.code;
        
        if (errorCode === 'ALREADY_VERIFIED') {
          setStatus('success');
          setMessage('Your email is already verified.');
        } else if (errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_EXPIRED') {
          setMessage('This verification link has expired or is invalid.');
        } else {
          setMessage(err.response?.data?.message || 'Failed to verify email');
        }
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('No verification token provided');
    }
  }, [token, user, setUser]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="space-y-3">
            {user ? (
              <button
                onClick={() => navigate('/')}
                className="w-full py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
              >
                Continue Shopping
              </button>
            ) : (
              <Link
                to="/login"
                className="block w-full py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors text-center"
              >
                Go to Login
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="space-y-3">
          <Link
            to="/register"
            className="block w-full py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors text-center"
          >
            Register Again
          </Link>
          <Link
            to="/login"
            className="block w-full py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
