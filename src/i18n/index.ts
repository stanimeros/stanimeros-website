import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enMain from './locales/en/main.json';
import elMain from './locales/el/main.json';

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
