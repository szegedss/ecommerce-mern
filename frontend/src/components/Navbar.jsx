import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useWishlistStore } from '../store';
import LanguageSwitcher from './LanguageSwitcher';

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
                <span className="text-gray-700">
                  {t('messages.welcome')}, {user?.name}
                </span>
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
