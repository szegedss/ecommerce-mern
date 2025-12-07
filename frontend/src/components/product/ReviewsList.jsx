import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function ReviewsList({ productId, refreshTrigger }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', comment: '', rating: 5 });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, currentPage, refreshTrigger]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/product/${productId}`,
        {
          params: {
            page: currentPage,
            limit: 10,
            sort: sortBy,
          },
        }
      );

      const { reviews: reviewsData, ratingDistribution, averageRating, totalReviews, totalPages: pages } = response.data.data;

      setReviews(reviewsData);
      setTotalPages(pages);
      setRatingStats({
        averageRating,
        totalReviews,
        ratingDistribution,
      });
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(t('reviews.loadError', 'Error loading reviews'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm(t('reviews.confirmDelete', 'Are you sure you want to delete this review?'))) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(t('reviews.deleteError', 'Error deleting review'));
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditFormData({
      title: review.title,
      comment: review.comment,
      rating: review.rating,
    });
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      console.error('Error updating review:', err);
      setError(t('reviews.updateError', 'Error updating review'));
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews/${reviewId}/helpful`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchReviews();
    } catch (err) {
      console.error('Error marking as helpful:', err);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={i < rating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div key={rating} className="flex items-center gap-3 mb-2">
        <span className="text-sm font-semibold text-gray-700 w-12">
          {rating} ⭐
        </span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-12 text-right">
          {count}
        </span>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        {t('reviews.customerReviews', 'Customer Reviews')}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {ratingStats.averageRating.toFixed(1)}
            </div>
            <div className="mb-2">
              {renderStars(Math.round(ratingStats.averageRating))}
            </div>
            <p className="text-gray-600">
              {t('reviews.basedOn', 'Based on')} {ratingStats.totalReviews} {t('reviews.reviews', 'reviews')}
            </p>
          </div>

          {/* Rating Distribution */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              {t('reviews.ratingDistribution', 'Rating Distribution')}
            </h4>
            {[5, 4, 3, 2, 1].map((rating) =>
              renderRatingBar(
                rating,
                ratingStats.ratingDistribution[rating] || 0,
                ratingStats.totalReviews
              )
            )}
          </div>
        </div>
      </div>

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="mb-6 flex items-center gap-4">
          <label className="text-gray-700 font-semibold">
            {t('reviews.sortBy', 'Sort by')}:
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="newest">{t('reviews.newest', 'Newest')}</option>
            <option value="helpful">{t('reviews.mostHelpful', 'Most Helpful')}</option>
            <option value="rating-high">{t('reviews.highestRating', 'Highest Rating')}</option>
            <option value="rating-low">{t('reviews.lowestRating', 'Lowest Rating')}</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-6">
              {editingReviewId === review._id ? (
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('reviews.rating', 'Rating')}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, rating: value })}
                          className={`text-2xl transition cursor-pointer hover:scale-110 ${
                            value <= editFormData.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('reviews.title', 'Title')}
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('reviews.comment', 'Comment')}
                    </label>
                    <textarea
                      value={editFormData.comment}
                      onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(review._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      {t('reviews.save', 'Save')}
                    </button>
                    <button
                      onClick={() => setEditingReviewId(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      {t('reviews.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                // Display Review
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {review.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t('reviews.by', 'By')} {review.userName} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Edit/Delete buttons for own reviews */}
                    {currentUser && review.user?._id === currentUser._id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                        >
                          {t('reviews.edit', 'Edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          {t('reviews.delete', 'Delete')}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {review.comment}
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleHelpful(review._id)}
                      className="text-sm text-gray-600 hover:text-orange-500 transition"
                    >
                      👍 {t('reviews.helpful', 'Helpful')} ({review.helpful})
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                {t('common.previous', 'Previous')}
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg transition ${
                    currentPage === i + 1
                      ? 'bg-orange-500 text-white'
                      : 'border border-gray-300 hover:border-orange-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                {t('common.next', 'Next')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            {t('reviews.noReviews', 'No reviews yet. Be the first to review this product!')}
          </p>
        </div>
      )}
    </div>
  );
}
