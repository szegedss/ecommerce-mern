import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function PriceRangeFilter({ onPriceChange, minPrice = 0, maxPrice = 10000 }) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const { t } = useTranslation();

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleMinChange = (value) => {
    const newMin = parseFloat(value);
    if (newMin < localMax) {
      setLocalMin(newMin);
      onPriceChange(newMin, localMax);
    }
  };

  const handleMaxChange = (value) => {
    const newMax = parseFloat(value);
    if (newMax > localMin) {
      setLocalMax(newMax);
      onPriceChange(localMin, newMax);
    }
  };

  const handleReset = () => {
    setLocalMin(0);
    setLocalMax(10000);
    onPriceChange(0, 10000);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {t('filters.priceRange', 'Price Range')}
      </h3>

      <div className="space-y-4">
        {/* Price Display */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">
            ฿{localMin.toLocaleString()} - ฿{localMax.toLocaleString()}
          </span>
          <button
            onClick={handleReset}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
          >
            {t('filters.reset', 'Reset')}
          </button>
        </div>

        {/* Min Price Slider */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">
            {t('filters.minPrice', 'Minimum Price')}
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={localMin}
            onChange={(e) => handleMinChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="text-xs text-gray-600 mt-1">฿{localMin.toLocaleString()}</div>
        </div>

        {/* Max Price Slider */}
        <div>
          <label className="block text-xs text-gray-600 mb-2">
            {t('filters.maxPrice', 'Maximum Price')}
          </label>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={localMax}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="text-xs text-gray-600 mt-1">฿{localMax.toLocaleString()}</div>
        </div>

        {/* Direct Input */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              min="0"
              max={localMax}
              value={Math.round(localMin)}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <input
              type="number"
              min={localMin}
              max="10000"
              value={Math.round(localMax)}
              onChange={(e) => handleMaxChange(e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
