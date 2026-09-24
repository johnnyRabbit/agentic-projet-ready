import { useI18n } from '../i18n/useI18n';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { changeLanguage, currentLanguage, availableLanguages } = useI18n();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
        <Globe className="w-4 h-4" />
        <span className="hidden md:inline">
          {availableLanguages.find((lang) => lang.code === currentLanguage)?.flag}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 transition-colors flex items-center gap-3 ${
                currentLanguage === lang.code ? 'text-blue-400' : 'text-slate-300'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {currentLanguage === lang.code && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
