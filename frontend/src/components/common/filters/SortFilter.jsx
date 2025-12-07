import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function SortFilter({ onSortChange, currentSort = 'newest' }) {
  const [selectedSort, setSelectedSort] = useState(currentSort);
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'newest', label: t('filters.newest', 'Newest') },
    { value: 'oldest', label: t('filters.oldest', 'Oldest') },
    { value: 'price-asc', label: t('filters.priceLowToHigh', 'Price: Low to High') },
    { value: 'price-desc', label: t('filters.priceHighToLow', 'Price: High to Low') },
    { value: 'rating', label: t('filters.topRated', 'Top Rated') },
  ];

  const handleSortChange = (value) => {
    setSelectedSort(value);
    onSortChange(value);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <label className="block text-sm font-bold text-gray-800 mb-3">
        {t('filters.sortBy', 'Sort By')}
      </label>
      <select
        value={selectedSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white cursor-pointer"
      >
        {sortOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
