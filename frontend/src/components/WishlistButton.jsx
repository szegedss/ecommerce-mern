import React, { useState, useEffect } from 'react';
import { useWishlistStore, useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function WishlistButton({ productId, size = 'md', className = '' }) {
  const { isInWishlist, addToWishlist, removeFromWishlist, fetchWishlist, items } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInWishlist(productId));
  }, [productId, items, isInWishlist]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
        setIsWishlisted(false);
      } else {
        await addToWishlist(productId);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-12 h-12 text-2xl',
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={loading}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          ${isWishlisted 
            ? 'bg-red-100 text-red-500 hover:bg-red-200' 
            : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          shadow-sm hover:shadow-md
          ${className}
        `}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {loading ? (
          <span className="animate-spin">⌛</span>
        ) : isWishlisted ? (
          '❤️'
        ) : (
          '🤍'
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
          {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
}
