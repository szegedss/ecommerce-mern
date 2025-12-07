import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { authAPI } from '../api';
import { addressSchema } from '../utils/validationSchemas';
import { showSuccess, showError, confirmDelete } from '../utils/alerts';

export default function AddressManager({ addresses = [], onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      label: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  const openAddForm = () => {
    reset({
      label: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const openEditForm = (addr) => {
    setValue('label', addr.label || '');
    setValue('firstName', addr.firstName);
    setValue('lastName', addr.lastName);
    setValue('phone', addr.phone);
    setValue('address', addr.address);
    setValue('city', addr.city);
    setValue('state', addr.state || '');
    setValue('postalCode', addr.postalCode);
    setValue('country', addr.country);
    setEditingId(addr._id);
    setIsEditing(true);
  };

  const closeForm = () => {
    setIsEditing(false);
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingId) {
        await authAPI.updateAddress(editingId, data);
        showSuccess('Address updated successfully!');
      } else {
        await authAPI.addAddress(data);
        showSuccess('Address added successfully!');
      }
      closeForm();
      onUpdate();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    const result = await confirmDelete('this address');
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await authAPI.deleteAddress(addressId);
        showSuccess('Address deleted!');
        onUpdate();
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to delete address');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      await authAPI.setDefaultAddress(addressId);
      showSuccess('Default address updated!');
      onUpdate();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Delivery Addresses</h2>
        {!isEditing && (
          <button
            onClick={openAddForm}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Address
          </button>
        )}
      </div>

      {/* Address Form */}
      {isEditing && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-4">
            {editingId ? 'Edit Address' : 'New Address'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Label (optional)
                </label>
                <input
                  type="text"
                  {...register('label')}
                  placeholder="e.g., Home, Office"
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.label ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.label && (
                  <p className="text-red-500 text-xs mt-1">{errors.label.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="Street address, apartment, suite, etc."
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  City *
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  {...register('postalCode')}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.postalCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.postalCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  {...register('country')}
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 && !isEditing ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>No addresses saved yet</p>
          <button
            onClick={openAddForm}
            className="mt-4 text-primary hover:underline"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`p-4 border rounded-lg relative ${
                addr.isDefault ? 'border-primary bg-blue-50' : 'border-gray-200'
              }`}
            >
              {addr.isDefault && (
                <span className="absolute top-2 right-2 text-xs bg-primary text-white px-2 py-1 rounded">
                  Default
                </span>
              )}
              
              {addr.label && (
                <p className="font-semibold text-primary mb-1">{addr.label}</p>
              )}
              <p className="font-medium">
                {addr.firstName} {addr.lastName}
              </p>
              <p className="text-gray-600 text-sm">{addr.address}</p>
              <p className="text-gray-600 text-sm">
                {addr.city}, {addr.state} {addr.postalCode}
              </p>
              <p className="text-gray-600 text-sm">{addr.country}</p>
              <p className="text-gray-600 text-sm mt-1">📞 {addr.phone}</p>

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => openEditForm(addr)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
                {!addr.isDefault && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Set as Default
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
