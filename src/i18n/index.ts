import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enMain from './locales/en/main.json';
import elMain from './locales/el/main.json';

// Language from URL path (/en or /el) so links like /en force English
function getLngFromPath(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const path = window.location.pathname;
  if (path.startsWith('/en') && (path.length === 3 || path[3] === '/')) return 'en';
  if (path.startsWith('/el') && (path.length === 3 || path[3] === '/')) return 'el';
  return undefined;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      el: {
        translation: elMain
      },
      en: {
        translation: enMain
      }
    },
    fallbackLng: 'el',
    supportedLngs: ['el', 'en'],
    lng: getLngFromPath(), // URL path overrides detector on initial load
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

// Set HTML lang attribute
const updateHtmlLang = (lng: string) => {
  document.documentElement.setAttribute('lang', lng);
};

i18n.on('languageChanged', updateHtmlLang);
updateHtmlLang(i18n.language);

export default i18n;
