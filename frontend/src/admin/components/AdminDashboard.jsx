import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load statistics');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div
      className={`bg-white rounded-lg shadow p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`text-3xl ${color.replace('border', 'text')}`}>{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="border-blue-500"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon="📦"
          color="border-green-500"
        />
        <StatCard
          title="Total Categories"
          value={stats?.totalCategories || 0}
          icon="🏷️"
          color="border-purple-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon="🛒"
          color="border-orange-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon="💰"
          color="border-red-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/admin/categories')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:shadow-lg transition-shadow text-left"
        >
          <p className="text-2xl">🏷️</p>
          <p className="font-semibold mt-2">Manage Categories</p>
          <p className="text-sm text-purple-100 mt-1">CRUD operations</p>
        </button>

        <button
          onClick={() => navigate('/admin/products')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg hover:shadow-lg transition-shadow text-left"
        >
          <p className="text-2xl">📦</p>
          <p className="font-semibold mt-2">Manage Products</p>
          <p className="text-sm text-green-100 mt-1">Create, Edit, Delete</p>
        </button>

        <button
          onClick={() => navigate('/admin/users')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:shadow-lg transition-shadow text-left"
        >
          <p className="text-2xl">👥</p>
          <p className="font-semibold mt-2">Manage Users</p>
          <p className="text-sm text-blue-100 mt-1">Users & Roles</p>
        </button>

        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg hover:shadow-lg transition-shadow text-left"
        >
          <p className="text-2xl">🛒</p>
          <p className="font-semibold mt-2">Manage Orders</p>
          <p className="text-sm text-orange-100 mt-1">Order Status</p>
        </button>
      </div>
    </div>
  );
}
