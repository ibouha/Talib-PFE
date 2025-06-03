import i18n from '../i18n/i18n';

export const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇲🇦' }
];

export const changeLanguage = (languageCode: string) => {
  i18n.changeLanguage(languageCode);
  localStorage.setItem('language', languageCode);
  
  // Update HTML direction for RTL support
  document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = languageCode;
};

export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

export const getLanguageName = (code: string) => {
  const language = availableLanguages.find(lang => lang.code === code);
  return language ? language.name : 'English';
};

export const getLanguageFlag = (code: string) => {
  const language = availableLanguages.find(lang => lang.code === code);
  return language ? language.flag : '🇬🇧';
};