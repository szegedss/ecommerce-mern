import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authAPI } from '../api';
import { forgotPasswordSchema } from '../utils/validationSchemas';
import { showSuccess, showError } from '../utils/alerts';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await authAPI.forgotPassword(data.email);
      setUserEmail(data.email);
      setEmailSent(true);
      showSuccess('Password reset email sent!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(userEmail);
      showSuccess('Reset email sent again! Check your inbox.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We've sent password reset instructions to <strong>{userEmail}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The link will expire in 1 hour. If you don't see the email, check your spam folder.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </button>
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Forgot Password?</h2>
          <p className="text-gray-600 mt-2">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
