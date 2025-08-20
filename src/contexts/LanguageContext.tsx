import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
];

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (languageCode: string) => void;
  getSupportedLanguages: () => Language[];
  getLanguageInfo: (code: string) => Language | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Try to get saved language from localStorage, fallback to browser language or English
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
      return savedLanguage;
    }
    
    // Try to match browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === browserLanguage)) {
      return browserLanguage;
    }
    
    return 'en'; // Default to English
  });

  const setLanguage = (languageCode: string) => {
    if (SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('app-language', languageCode);
      
      // Set the HTML lang attribute for accessibility and SEO
      document.documentElement.lang = languageCode;
    }
  };

  const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

  const getLanguageInfo = (code: string) => 
    SUPPORTED_LANGUAGES.find(lang => lang.code === code);

  useEffect(() => {
    // Set initial HTML lang attribute
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    getSupportedLanguages,
    getLanguageInfo,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}