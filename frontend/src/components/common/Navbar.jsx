import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useWishlistStore } from '../../store';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from '../user/NotificationBell';

export default function Navbar() {
  const { t } = useTranslation();
  const { isLoggedIn, user, logout } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, fetchWishlist]);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="text-2xl font-bold text-primary">
            🐾 {t('common.home')}
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="flex gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Link to="/" className="text-gray-700 hover:text-primary">
              {t('navigation.home')}
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary">
              {t('common.products')}
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-primary">
              {t('common.cart')}
            </Link>
            {isLoggedIn && (
              <>
                <Link to="/wishlist" className="text-gray-700 hover:text-primary relative">
                  ❤️ Wishlist
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link to="/my-orders" className="text-gray-700 hover:text-primary">
                  📦 My Orders
                </Link>
                <Link to="/my-coupons" className="text-gray-700 hover:text-primary">
                  🎟️ {t('coupons.coupons')}
                </Link>
              </>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {isLoggedIn ? (
              <>
                <NotificationBell />
                <Link to="/profile" className="text-gray-700 hover:text-primary flex items-center gap-1">
                  <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </span>
                  <span className="hidden md:inline">{user?.name?.split(' ')[0]}</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-purple-600 hover:text-purple-700 font-bold">
                    {t('common.admin')}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary">
                  {t('common.login')}
                </Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600">
                  {t('common.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
