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
    <>
      {/* Dialog */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-auto px-4">
        <div className="bg-card border rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <CakeIcon className="h-6 w-6 text-primary shrink-0" />
            <h2 className="font-semibold text-base">{t("cookieBanner.title")}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            {t("cookieBanner.message")}{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              {t("cookieBanner.learnMore")}
            </Link>
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={decline}>
              {t("cookieBanner.decline")}
            </Button>
            <Button className="flex-1" onClick={accept}>
              {t("cookieBanner.accept")}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
