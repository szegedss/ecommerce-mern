import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store';

export default function MyCoupons() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [coupons, setCoupons] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyCoupons();
      fetchAvailableCoupons();
    }
  }, [user]);

  const fetchMyCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/user/saved`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCoupons(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your coupons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons`
      );
      setAvailableCoupons(response.data.data);
    } catch (err) {
      console.error('Failed to fetch available coupons:', err);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/coupons/user/save`,
        { code: couponCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Coupon added to your collection!');
      setCouponCode('');
      fetchMyCoupons();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add coupon');
      setMessage(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCouponName = (coupon) => {
    return i18n.language === 'th' ? coupon.code_th : coupon.code_en;
  };

  const getCouponDescription = (coupon) => {
    return i18n.language === 'th' ? coupon.description_th : coupon.description_en;
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setMessage(`Coupon code copied: ${code}`);
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('coupons.myCoupons', 'My Coupons')}
        </h1>
        <p className="text-gray-600">
          {t('coupons.manageAndUse', 'Manage and use your discount coupons')}
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'saved'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('coupons.savedCoupons', 'Saved Coupons')} ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-3 font-semibold transition ${
            activeTab === 'add'
              ? 'border-b-2 border-orange-500 text-orange-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('coupons.addCoupon', 'Add Coupon')}
        </button>
      </div>

      {/* Saved Coupons Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-2">
                {t('coupons.noCouponsSaved', "You haven't saved any coupons yet")}
              </p>
              <button
                onClick={() => setActiveTab('add')}
                className="text-orange-600 font-semibold hover:underline"
              >
                {t('coupons.browseCoupons', 'Browse available coupons')}
              </button>
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-orange-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {getCouponName(coupon)}
                    </h3>
                    {getCouponDescription(coupon) && (
                      <p className="text-gray-600 text-sm mb-3">{getCouponDescription(coupon)}</p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                      {/* Discount */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-semibold uppercase mb-1">
                          {t('coupons.discount', 'Discount')}
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `฿${coupon.discountValue}`}
                        </p>
                      </div>

                      {/* Min Purchase */}
                      {coupon.minPurchaseAmount > 0 && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-600 font-semibold uppercase mb-1">
                            {t('coupons.minPurchase', 'Min Purchase')}
                          </p>
                          <p className="text-lg font-semibold text-blue-700">
                            ${coupon.minPurchaseAmount}
                          </p>
                        </div>
                      )}

                      {/* Expiry */}
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-600 font-semibold uppercase mb-1">
                          {t('coupons.expiresOn', 'Expires')}
                        </p>
                        <p className="text-sm font-semibold text-red-700">
                          {formatDate(coupon.expiryDate)}
                        </p>
                      </div>

                      {/* Code */}
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-semibold uppercase mb-1">
                          {t('coupons.code', 'Code')}
                        </p>
                        <p className="font-mono font-bold text-purple-700 text-sm break-all">
                          {coupon.uniqueCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyCouponCode(coupon.uniqueCode)}
                    className="ml-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition"
                  >
                    {t('coupons.copy', 'Copy Code')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Coupon Tab */}
      {activeTab === 'add' && (
        <div className="space-y-6">
          {/* Add Coupon Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t('coupons.addCouponCode', 'Add a Coupon Code')}
            </h2>
            <form onSubmit={handleAddCoupon} className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={t('coupons.enterCode', 'Enter coupon code...')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {t('coupons.add', 'Add')}
              </button>
            </form>
          </div>

          {/* Available Coupons */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {t('coupons.availableCoupons', 'Available Coupons')}
            </h2>
            {availableCoupons.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('coupons.noCouponsAvailable', 'No available coupons at the moment')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCoupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-orange-200 hover:border-orange-400 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 font-semibold">
                          {t('coupons.code', 'Code')}
                        </p>
                        <p className="font-mono font-bold text-lg text-orange-600 break-all">
                          {coupon.uniqueCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 font-semibold uppercase">
                          {t('coupons.discount', 'Discount')}
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `฿${coupon.discountValue}`}
                        </p>
                      </div>
                    </div>

                    {getCouponDescription(coupon) && (
                      <p className="text-sm text-gray-700 mb-3">{getCouponDescription(coupon)}</p>
                    )}

                    <div className="text-xs text-gray-600 space-y-1 mb-3">
                      {coupon.minPurchaseAmount > 0 && (
                        <p>
                          💰 {t('coupons.minPurchase', 'Min Purchase')}: ฿{coupon.minPurchaseAmount}
                        </p>
                      )}
                      <p>
                        📅 {t('coupons.expiresOn', 'Expires')}: {formatDate(coupon.expiryDate)}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCouponCode(coupon.uniqueCode);
                        setActiveTab('saved');
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded font-semibold text-sm transition"
                    >
                      {t('coupons.addThisCoupon', 'Add This Coupon')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
