import { useMemo, type ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createI18nInstance, type SupportedLang } from '@/i18n'

interface Props {
  lang: SupportedLang
  children: ReactNode
}

export default function I18nProvider({ lang, children }: Props) {
  const instance = useMemo(() => createI18nInstance(lang), [lang])
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}
