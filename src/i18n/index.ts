import { Language, Translation } from '../types';
import { ptBR } from './pt-BR';
import { en } from './en';
import { es } from './es';

// Available translations
export const translations: Record<Language, Translation> = {
  'pt-BR': ptBR,
  'en': en,
  'es': es
};

// Language detection function
export const detectBrowserLanguage = (): Language => {
  // Get browser languages in order of preference
  const browserLanguages = [
    navigator.language,
    ...(navigator.languages || [])
  ];

  for (const lang of browserLanguages) {
    // Direct match (e.g., "pt-BR")
    if (lang in translations) {
      return lang as Language;
    }
    
    // Language code match (e.g., "pt" matches "pt-BR")
    const langCode = lang.split('-')[0];
    
    if (langCode === 'pt') return 'pt-BR';
    if (langCode === 'en') return 'en';
    if (langCode === 'es') return 'es';
  }
  
  // Default to Portuguese Brazilian if no match
  return 'pt-BR';
};

// Translation hook utility
export const useTranslation = (language: Language) => {
  const currentTranslations = translations[language];
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = currentTranslations;
    
    for (const k of keys) {
      if (typeof result === 'object' && result !== null && k in result) {
        result = result[k];
      } else {
        // Return key if translation not found (for debugging)
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  };
  
  return { t };
};

// Language display names
export const languageNames: Record<Language, string> = {
  'pt-BR': 'Português (Brasil)',
  'en': 'English',
  'es': 'Español'
};

// Get language name for display
export const getLanguageName = (language: Language): string => {
  return languageNames[language] || language;
};