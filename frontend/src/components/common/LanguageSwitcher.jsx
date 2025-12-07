import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'en', name: 'English', flag: 'en' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Language:</span>
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => {
              i18n.changeLanguage(lang.code);
              localStorage.setItem('i18nextLng', lang.code);
            }}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              i18n.language === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={lang.name}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
