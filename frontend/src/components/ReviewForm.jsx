import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function ReviewForm({ productId, onReviewSubmit, isAuthenticated, userName }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // NEW: Order-based review logic
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [checking, setChecking] = useState(true);
  const [reviewStatus, setReviewStatus] = useState(null); // 'can_review', 'no_orders', 'already_reviewed', 'not_delivered', 'error'

  // Check review eligibility based on orders
  useEffect(() => {
    if (!isAuthenticated || !productId) {
      setChecking(false);
      return;
    }

    const checkReviewEligibility = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Call new eligibility endpoint
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/check-review-eligibility/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { canReview, orderId, reason } = response.data;

        if (canReview) {
          setReviewStatus('can_review');
          setSelectedOrderId(orderId);
        } else {
          setReviewStatus(reason); // 'no_delivered_order', 'already_reviewed_all_orders'
        }
      } catch (err) {
        console.error('Error checking review eligibility:', err);
        setReviewStatus('error');
      } finally {
        setChecking(false);
      }
    };

    checkReviewEligibility();
  }, [productId, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError(t('reviews.loginRequired', 'Please login to submit a review'));
      return;
    }

    if (!selectedOrderId) {
      setError('Please select an order to review');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      setError(t('reviews.fillAllFields', 'Please fill in all fields'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      console.log('Submitting review:', { title, comment, rating: parseInt(rating), orderId: selectedOrderId, token });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${productId}`,
        {
          title,
          comment,
          rating: parseInt(rating),
          orderId: selectedOrderId, // IMPORTANT: Include orderId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setTitle('');
      setComment('');
      setRating(5);
      setReviewStatus('already_reviewed_all_orders'); // Hide form after successful review

      // Call parent callback to refresh reviews
      if (onReviewSubmit) {
        onReviewSubmit(response.data.data);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.log('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (checking) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <p className="text-blue-800">
          {t('reviews.loginPrompt', 'Please login to leave a review')}
        </p>
      </div>
    );
  }

  // No delivered orders
  if (reviewStatus === 'no_delivered_order') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <p className="text-amber-800 font-semibold">
          {t('reviews.productNotDelivered', 'Product not yet delivered')}
        </p>
        <p className="text-amber-700 text-sm mt-2">
          {t('reviews.deliveryRequiredToReview', 'You can review this product after it has been delivered and confirmed')}
        </p>
      </div>
    );
  }

  // Already reviewed all eligible orders
  if (reviewStatus === 'already_reviewed_all_orders') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <p className="text-amber-800 font-semibold">
          {t('reviews.alreadyReviewed', 'You have already reviewed this product')}
        </p>
        <p className="text-amber-700 text-sm mt-2">
          {t('reviews.canEditReview', 'You can edit or delete your review in the reviews section below')}
        </p>
      </div>
    );
  }

  // Error state
  if (reviewStatus === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <p className="text-red-800">
          {t('reviews.loadError', 'Error checking review eligibility')}
        </p>
      </div>
    );
  }

  // Can review - show form
  if (reviewStatus !== 'can_review') {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        {t('reviews.writeReview', 'Write a Review')}
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
          {t('reviews.submitSuccess', 'Review submitted successfully!')}
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          {t('reviews.rating', 'Rating')}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              className={`text-3xl transition cursor-pointer hover:scale-110 ${
                (hoverRating || rating) >= value ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ⭐
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">{hoverRating || rating} {t('reviews.outOf5', 'out of 5 stars')}</p>
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          {t('reviews.title', 'Review Title')}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('reviews.titlePlaceholder', 'e.g., Great product, highly recommended')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          maxLength={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          {title.length}/100 {t('reviews.characters', 'characters')}
        </p>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          {t('reviews.comment', 'Your Review')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('reviews.commentPlaceholder', 'Share your experience with this product...')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
          maxLength={1000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/1000 {t('reviews.characters', 'characters')}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('reviews.submitting', 'Submitting...') : t('reviews.submit', 'Submit Review')}
      </button>
    </form>
  );
}
