import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authAPI } from '../api';
import { useAuthStore } from '../store';
import { profileSchema, changePasswordSchema } from '../utils/validationSchemas';
import { showSuccess, showError, confirmDelete } from '../utils/alerts';
import AddressManager from '../components/AddressManager';

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn, setUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userData, setUserData] = useState(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isLoggedIn, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.data.success) {
        const data = response.data.data.user;
        setUserData(data);
        resetProfile({
          name: data.name,
          phone: data.phone || '',
        });
        setAvatarPreview(data.avatar);
      }
    } catch (err) {
      showError('Failed to load profile data');
    }
  };

  const onProfileSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(data);
      if (response.data.success) {
        setUser(response.data.data.user);
        setUserData(response.data.data.user);
        showSuccess('Profile updated successfully!');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      showSuccess('Password changed successfully!');
      resetPassword();
    } catch (err) {
      const errorCode = err.response?.data?.code;
      if (errorCode === 'INVALID_PASSWORD') {
        showError('Current password is incorrect');
      } else {
        showError(err.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const response = await authAPI.updateAvatar(formData);
      if (response.data.success) {
        const newAvatar = response.data.data.avatar;
        setUser({ ...user, avatar: newAvatar });
        showSuccess('Avatar updated!');
      }
    } catch (err) {
      showError('Failed to upload avatar');
      setAvatarPreview(userData?.avatar);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await confirmDelete('your session');
    if (result.isConfirmed) {
      logout();
      navigate('/');
      showSuccess('Logged out successfully');
    }
  };

  if (!isLoggedIn) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'password', label: 'Password', icon: '🔒' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

            {/* Avatar */}
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                      {userData?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="ml-6">
                <h3 className="font-semibold">{userData?.name}</h3>
                <p className="text-gray-500 text-sm">{userData?.email}</p>
                {userData?.isEmailVerified ? (
                  <span className="text-xs text-green-600 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600">Email not verified</span>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    {...registerProfile('name')}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                      profileErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {profileErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    {...registerProfile('phone')}
                    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                      profileErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 234 567 8900"
                  />
                  {profileErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-6 py-2 text-red-500 border border-red-500 rounded hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="max-w-md">
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
                <input
                  type="password"
                  {...registerPassword('currentPassword')}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                    passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">New Password</label>
                <input
                  type="password"
                  {...registerPassword('newPassword')}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword')}
                  className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <AddressManager addresses={userData?.addresses || []} onUpdate={fetchUserData} />
        )}
      </div>
    </div>
  );
}
