import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './locales/en/en.json';
import elTranslations from './locales/el/el.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      el: {
        translation: elTranslations
      },
      en: {
        translation: enTranslations
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
