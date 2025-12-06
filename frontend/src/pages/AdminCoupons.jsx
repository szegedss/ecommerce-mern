import React from 'react';
import AdminLayout from '../admin/components/AdminLayout';
import CouponManagement from '../admin/components/CouponManagement';

export default function AdminCouponsPage() {
  return (
    <AdminLayout>
      <CouponManagement />
    </AdminLayout>
  );
}
