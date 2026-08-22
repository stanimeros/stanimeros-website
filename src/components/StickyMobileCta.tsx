import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { PhoneIcon } from "@heroicons/react/24/outline"
import { trackEvent } from "@/lib/events"
import type { SupportedLang } from "@/i18n"

interface StickyMobileCtaProps {
  lang: SupportedLang
}

export default function StickyMobileCta({ lang }: StickyMobileCtaProps) {
  const { t } = useTranslation()
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    setHidden(window.location.pathname.replace(/^\/el/, '') === '/contact')
  }, [])

  if (hidden) return null

  const prefix = lang === "el" ? "/el" : ""

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-sm px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <Button variant="green" size="lg" className="w-full" asChild>
        <a
          href={`${prefix}/contact?source=sticky-mobile-cta`}
          onClick={() => trackEvent("ctaClick", { source: "sticky-mobile-cta" })}
        >
          <PhoneIcon className="size-5 mr-2 stroke-[1.5]" />
          {t("stickyCta.button")}
        </a>
      </Button>
    </div>
  )
}
