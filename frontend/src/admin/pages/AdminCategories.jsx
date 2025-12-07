import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import CategoryManagement from '../components/CategoryManagement';

export default function AdminCategoriesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        window.location.href = '/';
      }
      setUser(parsedUser);
    } else {
      window.location.href = '/login';
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <CategoryManagement />
    </AdminLayout>
  );
}
