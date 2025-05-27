
import React from 'react';
import { Globe, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { language, t } = useLanguage();

  return (
    <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Globe className="text-blue-300" size={32} />
            </div>
            <div>
              <h1 
                className={`font-bold ${language === 'ja' ? 'text-xl' : 'text-2xl'}`}
                style={{ 
                  fontFamily: language === 'ja' ? '"Noto Sans JP", sans-serif' : '"Inter", sans-serif'
                }}
              >
                {language === 'ja' ? '日本地震監視システム' : 'Seismic Monitor Japan'}
              </h1>
              <p 
                className={`text-blue-200 ${language === 'ja' ? 'text-sm' : 'text-sm'}`}
                style={{ 
                  fontFamily: language === 'ja' ? '"Noto Sans JP", sans-serif' : '"Inter", sans-serif'
                }}
              >
                {language === 'ja' ? '高度地震リスク評価' : 'Advanced Earthquake Risk Assessment'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield size={16} className="text-green-400" />
                <span style={{ fontFamily: language === 'ja' ? '"Noto Sans JP", sans-serif' : '"Inter", sans-serif' }}>
                  {language === 'ja' ? 'ML駆動予測' : 'ML-Powered Predictions'}
                </span>
              </div>
              <div 
                className="text-xs text-blue-200"
                style={{ fontFamily: language === 'ja' ? '"Noto Sans JP", sans-serif' : '"Inter", sans-serif' }}
              >
                {language === 'ja' ? 'データソース: 気象庁' : 'Data Source: Japan Meteorological Agency'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
