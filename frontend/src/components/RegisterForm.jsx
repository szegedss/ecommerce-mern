import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import { registerSchema } from '../utils/validationSchemas';
import { showSuccess, showError, showInfo } from '../utils/alerts';

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        setUserEmail(data.email);
        setRegistrationComplete(true);
        
        // Store token but show verification message
        if (response.data.data.token) {
          login(response.data.data.user, response.data.data.token);
        }
        
        showSuccess('Please check your email to verify your account.', 'Registration Successful!');
      }
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || 'Registration failed';

      if (errorCode === 'USER_EXISTS') {
        showError('An account with this email already exists');
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await authAPI.resendVerification(userEmail);
      showSuccess('Verification email sent! Check your inbox.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-4">
            We've sent a verification email to <strong>{userEmail}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in the email to verify your account and access all features.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Resend Verification Email'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Already verified?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
          <input
            type="text"
            {...register('name')}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Password</label>
          <input
            type="password"
            {...register('password')}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            At least 6 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
