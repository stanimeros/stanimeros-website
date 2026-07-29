import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import enMain from './locales/en/main.json'
import elMain from './locales/el/main.json'

export type SupportedLang = 'en' | 'el'

const resources = {
  en: { translation: enMain },
  el: { translation: elMain },
}

// One instance per render (SSR page render, or client hydration of an island)
// so pages never race each other over a shared global language.
export function createI18nInstance(lang: SupportedLang) {
  const instance = i18next.createInstance()
  instance.use(initReactI18next).init({
    resources,
    lng: lang,
    fallbackLng: 'en',
    supportedLngs: ['en', 'el'],
    interpolation: { escapeValue: false },
  })
  return instance
}
