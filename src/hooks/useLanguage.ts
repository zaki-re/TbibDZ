import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: 'fr' | 'ar' | 'en') => {
    i18n.changeLanguage(lang);
    Cookies.set('language', lang);
    
    // Update document direction for RTL support
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Update font family based on language
    document.documentElement.classList.remove('font-arabic', 'font-latin');
    document.documentElement.classList.add(lang === 'ar' ? 'font-arabic' : 'font-latin');
  };

  return {
    currentLanguage: i18n.language as 'fr' | 'ar' | 'en',
    changeLanguage,
    t: i18n.t
  };
}