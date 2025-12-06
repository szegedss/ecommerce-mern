import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import { loginSchema } from '../utils/validationSchemas';
import { showSuccess, showError, showWarning } from '../utils/alerts';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setNeedsVerification(false);

    try {
      const response = await authAPI.login(data);
      
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token);
        showSuccess('Welcome back!', 'Login Successful');
        
        // Redirect based on role
        if (response.data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || 'Login failed';

      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        setUserEmail(data.email);
        showWarning('Please verify your email to continue', 'Verification Required');
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

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      
      {needsVerification && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded mb-4">
          <p className="font-semibold mb-2">Email Not Verified</p>
          <p className="text-sm mb-3">Please check your email and click the verification link.</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading}
            className="text-sm text-yellow-700 hover:text-yellow-900 underline"
          >
            Resend verification email
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
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
        </div>

        <div className="flex justify-end mb-6">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
