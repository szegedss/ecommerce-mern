import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function SearchBar({ onSearch, placeholder = 'Search products...' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('filters.searchPlaceholder', placeholder)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            title={t('filters.clearSearch', 'Clear search')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
