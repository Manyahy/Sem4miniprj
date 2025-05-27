
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ja' : 'en');
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 bg-white/90 backdrop-blur-sm border-2 hover:bg-white transition-all duration-200 ${
        language === 'ja' 
          ? 'font-medium text-base' 
          : 'font-semibold text-sm'
      }`}
      style={{ 
        fontFamily: language === 'ja' ? '"Noto Sans JP", sans-serif' : '"Inter", sans-serif',
        borderColor: '#FF9636'
      }}
    >
      <Globe size={16} />
      {t('switchToJapanese')}
    </Button>
  );
};

export default LanguageSwitcher;
