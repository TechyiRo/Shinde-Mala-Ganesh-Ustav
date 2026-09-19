import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { numberToWords, formatCurrency } from '../i18n/numberToWords';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mandal_lang') || 'mr';
  });

  useEffect(() => {
    localStorage.setItem('mandal_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'mr' ? 'en' : 'mr'));
  };

  const t = (key) => {
    const langDict = translations[lang] || translations.mr;
    return langDict[key] || translations.en[key] || key;
  };

  const getAmountInWords = (amount) => {
    return numberToWords(amount, lang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, getAmountInWords, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
