import { useEffect } from "react"
import { Outlet, useParams, Navigate } from "react-router-dom"
import i18n from "@/i18n"

const SUPPORTED_LANGS = ["en", "el"] as const

export default function LangRoute() {
  const { lang } = useParams<{ lang: string }>()

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang as "en" | "el")) {
      i18n.changeLanguage(lang)
      localStorage.setItem("preferredLanguage", lang)
    }
  }, [lang])

  if (!lang || !SUPPORTED_LANGS.includes(lang as "en" | "el")) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
