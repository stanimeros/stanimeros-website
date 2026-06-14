import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t p-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          {t("cookieBanner.message")}{" "}
          <Link to="/privacy-policy" className="text-primary hover:underline">
            {t("cookieBanner.learnMore")}
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            {t("cookieBanner.decline")}
          </Button>
          <Button size="sm" onClick={accept}>
            {t("cookieBanner.accept")}
          </Button>
        </div>
      </div>
    </div>
  )
}
