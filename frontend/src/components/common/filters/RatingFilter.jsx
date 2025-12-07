import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function RatingFilter({ onRatingChange }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const { t } = useTranslation();

  const handleRatingSelect = (rating) => {
    setSelectedRating(rating);
    onRatingChange(rating);
  };

  const ratings = [
    { stars: 5, label: t('filters.fiveStars', '5 Stars') },
    { stars: 4, label: t('filters.fourPlus', '4 Stars & Up') },
    { stars: 3, label: t('filters.threePlus', '3 Stars & Up') },
    { stars: 2, label: t('filters.twoPlus', '2 Stars & Up') },
    { stars: 1, label: t('filters.onePlus', '1 Star & Up') },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {t('filters.rating', 'Rating')}
        </h3>
        {selectedRating > 0 && (
          <button
            onClick={() => handleRatingSelect(0)}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
          >
            {t('filters.clear', 'Clear')}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {ratings.map(({ stars, label }) => (
          <label
            key={stars}
            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition"
          >
            <input
              type="radio"
              name="rating"
              value={stars}
              checked={selectedRating === stars}
              onChange={() => handleRatingSelect(stars)}
              className="w-4 h-4 text-orange-500 cursor-pointer"
            />
            <span className="ml-3 flex items-center">
              <span className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={i < stars ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ⭐
                  </span>
                ))}
              </span>
              <span className="text-sm text-gray-700">{label}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
