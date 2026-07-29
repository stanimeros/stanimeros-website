import type { ComponentType } from 'react'
import I18nProvider from '@/components/I18nProvider'
import type { SupportedLang } from '@/i18n'

export function withI18n<P extends object>(Component: ComponentType<P>) {
  return function Localized(props: P & { lang: SupportedLang }) {
    const { lang, ...rest } = props
    return (
      <I18nProvider lang={lang}>
        <Component {...(rest as P)} />
      </I18nProvider>
    )
  }
}
