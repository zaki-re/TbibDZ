import { Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'fr', name: 'Français', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'en', name: 'English', dir: 'ltr' }
  ];

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Globe className="w-5 h-5 text-gray-600" />
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value as 'fr' | 'ar' | 'en')}
        className="bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md rtl:text-right"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code} dir={lang.dir}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}