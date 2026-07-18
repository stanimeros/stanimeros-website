import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { CakeIcon } from "@heroicons/react/24/outline"
import { initAnalytics } from "@/lib/firebase"

const CONSENT_KEY = "cookie_consent"

export default function CookieBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      setVisible(true)
    } else if (consent === "accepted") {
      initAnalytics()
    }
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted")
    initAnalytics()
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-10 sm:bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl pointer-events-none"
    >
      <div className="bg-card border border-border/80 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.45)] p-6 sm:p-8 pointer-events-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <CakeIcon className="h-8 w-8 text-primary shrink-0" />
          <h2 id="cookie-banner-title" className="font-semibold text-lg sm:text-xl">
            {t("cookieBanner.title")}
          </h2>
        </div>
        <p className="text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
          {t("cookieBanner.message")}{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline font-medium">
            {t("cookieBanner.learnMore")}
          </Link>
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
          <Button variant="outline" size="lg" className="flex-1 h-12 text-base" onClick={decline}>
            {t("cookieBanner.decline")}
          </Button>
          <Button size="lg" className="flex-1 h-12 text-base" onClick={accept}>
            {t("cookieBanner.accept")}
          </Button>
        </div>
      </div>
    </div>
  )
}
