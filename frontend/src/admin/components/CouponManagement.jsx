import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function CouponManagement() {
  const { t, i18n } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    code_th: '',
    code_en: '',
    uniqueCode: '',
    description_th: '',
    description_en: '',
    discountType: 'percentage',
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: null,
    startDate: '',
    expiryDate: '',
    maxUsagePerUser: 1,
    totalUsageLimit: null,
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCoupons(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch coupons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (editingId) {
        // Update existing coupon
        await axios.put(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/admin/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Coupon updated successfully');
      } else {
        // Create new coupon
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/admin`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSuccess('Coupon created successfully');
      }

      // Reset form and refresh list
      setFormData({
        code_th: '',
        code_en: '',
        uniqueCode: '',
        description_th: '',
        description_en: '',
        discountType: 'percentage',
        discountValue: 0,
        minPurchaseAmount: 0,
        maxDiscountAmount: null,
        startDate: '',
        expiryDate: '',
        maxUsagePerUser: 1,
        totalUsageLimit: null,
        isActive: true,
      });
      setShowForm(false);
      setEditingId(null);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code_th: coupon.code_th,
      code_en: coupon.code_en,
      uniqueCode: coupon.uniqueCode,
      description_th: coupon.description_th,
      description_en: coupon.description_en,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchaseAmount: coupon.minPurchaseAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
      expiryDate: new Date(coupon.expiryDate).toISOString().slice(0, 16),
      maxUsagePerUser: coupon.maxUsagePerUser,
      totalUsageLimit: coupon.totalUsageLimit,
      isActive: coupon.isActive,
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/admin/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess('Coupon deleted successfully');
      fetchCoupons();
    } catch (err) {
      setError('Failed to delete coupon');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Coupon Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (!showForm) {
              setFormData({
                code_th: '',
                code_en: '',
                uniqueCode: '',
                description_th: '',
                description_en: '',
                discountType: 'percentage',
                discountValue: 0,
                minPurchaseAmount: 0,
                maxDiscountAmount: null,
                startDate: '',
                expiryDate: '',
                maxUsagePerUser: 1,
                totalUsageLimit: null,
                isActive: true,
              });
            }
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          {showForm ? '✕ Cancel' : '+ New Coupon'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingId ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Code Thai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code (Thai)
                </label>
                <input
                  type="text"
                  name="code_th"
                  value={formData.code_th}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="เช่น ลดราคา 10%"
                />
              </div>

              {/* Code English */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code (English)
                </label>
                <input
                  type="text"
                  name="code_en"
                  value={formData.code_en}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. SAVE10"
                />
              </div>

              {/* Unique Code */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unique Code (for validation)
                </label>
                <input
                  type="text"
                  name="uniqueCode"
                  value={formData.uniqueCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uniqueCode: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                  placeholder="e.g. CHRISTMAS2024"
                />
              </div>

              {/* Description Thai */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Thai)
                </label>
                <textarea
                  name="description_th"
                  value={formData.description_th}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="คำอธิบายคูปองเป็นภาษาไทย"
                />
              </div>

              {/* Description English */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  name="description_en"
                  value={formData.description_en}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Coupon description in English"
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? 100 : 999999}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                />
              </div>

              {/* Min Purchase Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Purchase Amount (฿)
                </label>
                <input
                  type="number"
                  name="minPurchaseAmount"
                  value={formData.minPurchaseAmount}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                />
              </div>

              {/* Max Discount Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Discount Amount (฿) - Optional
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount || ''}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Leave empty for no limit"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Max Usage Per User */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Usage Per User
                </label>
                <input
                  type="number"
                  name="maxUsagePerUser"
                  value={formData.maxUsagePerUser}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Total Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Usage Limit - Optional
                </label>
                <input
                  type="number"
                  name="totalUsageLimit"
                  value={formData.totalUsageLimit || ''}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              {/* Active Status */}
              <div className="col-span-2 flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                {editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No coupons found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
            >
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* Code */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Code</p>
                  <p className="font-mono font-bold text-orange-600">{coupon.uniqueCode}</p>
                  <p className="text-xs text-gray-600">{coupon.code_th}</p>
                </div>

                {/* Discount */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Discount</p>
                    <p className="font-bold text-green-600">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}%`
                        : `฿${coupon.discountValue}`}
                    </p>
                  {coupon.maxDiscountAmount && (
                    <p className="text-xs text-gray-600">Max: ฿{coupon.maxDiscountAmount}</p>
                  )}
                </div>

                {/* Usage */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Usage</p>
                  <p className="font-semibold text-gray-800">{coupon.currentUsageCount}</p>
                  {coupon.totalUsageLimit && (
                    <p className="text-xs text-gray-600">/ {coupon.totalUsageLimit}</p>
                  )}
                </div>

                {/* Expiry & Status */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Expiry</p>
                  <p className="text-sm text-gray-800">{formatDate(coupon.expiryDate)}</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                      coupon.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {coupon.isActive ? '✓ Active' : '✗ Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ✕ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
