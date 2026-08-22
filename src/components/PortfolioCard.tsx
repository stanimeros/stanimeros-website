import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { StoreLinks } from "@/lib/portfolio-data"

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  )
}

function isIosInstagramInAppBrowser() {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  return /Instagram/i.test(ua) && /iPhone|iPad|iPod/i.test(ua)
}

export interface PortfolioCardProps {
  /** Technology badges to display */
  technologies: string[]
  /** Background color class (e.g. 'bg-red-900/30') - used as fallback or overlay */
  bgColor: string
  /** Optional background image URL - when set, used as card header background */
  bgImage?: string
  /** Text color class for the logo area (e.g. 'text-red-200') */
  textColor: string
  /** Optional logo/image URL - if not provided, shows initials */
  logo?: string
  /** Optional alt text for logo */
  logoAlt?: string
  /** Optional background for logo circle (e.g. 'bg-white') - when logo has transparency */
  logoBg?: string
  /** Optional link URL - when set, card becomes clickable */
  url?: string
  /** Optional internal case-study page link (e.g. /work/slug), shown as a text link */
  caseStudyHref?: string
  /** Optional App Store / Play Store links shown as chips */
  storeLinks?: StoreLinks
  /** Translated title (passed from parent for display) */
  title: string
  /** Translated description (passed from parent for display) */
  description: string
  className?: string
}

export function PortfolioCard({
  technologies,
  bgColor,
  bgImage,
  textColor,
  logo,
  logoAlt,
  logoBg,
  url,
  caseStudyHref,
  storeLinks,
  title,
  description,
  className,
}: PortfolioCardProps) {
  const { t } = useTranslation()

  const [showAppleHint, setShowAppleHint] = useState(false)

  useEffect(() => {
    if (!showAppleHint) return
    const timer = setTimeout(() => setShowAppleHint(false), 6000)
    return () => clearTimeout(timer)
  }, [showAppleHint])

  const handleAppleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isIosInstagramInAppBrowser()) {
      e.preventDefault()
      setShowAppleHint(true)
    }
  }

  const handleGooglePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isAndroid = /android/i.test(navigator.userAgent)
    const href = isAndroid ? storeLinks?.android : storeLinks?.androidWeb ?? storeLinks?.android
    if (href) window.open(href, "_blank", "noopener,noreferrer")
  }

  const isAppleBeta = storeLinks?.apple?.includes("testflight.apple.com") ?? false
  const isAndroidBeta = storeLinks?.android?.includes("/apps/testing/") ?? false
  const appleLabel = t(isAppleBeta ? "portfolioCard.betaApple" : "portfolioCard.appStore")
  const androidLabel = t(isAndroidBeta ? "portfolioCard.betaGoogle" : "portfolioCard.playStore")

  const fromWords = title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
  const initials =
    fromWords.length >= 2
      ? fromWords.slice(0, 2)
      : (title.replace(/\s/g, "").slice(0, 2).toUpperCase() || "??").padEnd(2, "?")

  const card = (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 h-full flex flex-col w-full bg-card/70 hover:bg-card/70 pt-0",
        className
      )}
    >
      {/* Background with circle logo at bottom left */}
      <div
        className={cn(
          "h-40 flex items-end justify-start flex-none relative overflow-hidden p-4 bg-cover bg-center",
          !bgImage && bgColor
        )}
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
      >
        {bgImage && (
          <div className="absolute inset-0 bg-black/40" aria-hidden />
        )}
        {url && (
          <Badge
            variant="outline"
            className="absolute top-3 right-3 z-10 gap-1.5 bg-black/40 backdrop-blur-sm border-white/30 text-white"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t("portfolioCard.live")}
          </Badge>
        )}
        <div
          className={cn(
            "relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0",
            "border-2 border-white/30 shadow-lg",
            logoBg ? logoBg : "bg-white/95 dark:bg-white/10 backdrop-blur-sm",
            !logo && !logoBg && textColor
          )}
        >
          {logo ? (
            <img
              src={logo}
              alt={logoAlt ?? title}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      <CardHeader className="pt-3 flex-none">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {technologies.map((tech, techIndex) => (
            <Badge key={techIndex} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        <CardDescription className="mt-3">{description}</CardDescription>
        {caseStudyHref && (
          <a
            href={caseStudyHref}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center text-xs font-medium text-primary hover:underline mt-3"
          >
            {t("portfolioCard.viewCaseStudy")}
          </a>
        )}
        {storeLinks && (storeLinks.apple || storeLinks.android) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {storeLinks.apple && (
              <div className="relative">
                <a
                  href={storeLinks.apple}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleAppleClick}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-background hover:bg-accent transition-colors"
                >
                  <AppleIcon className="h-3.5 w-3.5" />
                  {appleLabel}
                </a>
                {showAppleHint && (
                  <div
                    role="tooltip"
                    className="absolute z-20 top-full mt-1.5 left-0 w-56 rounded-md border bg-popover p-2.5 text-sm leading-snug text-popover-foreground shadow-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("portfolioCard.inAppBrowserHint")}
                  </div>
                )}
              </div>
            )}
            {storeLinks.android && (
              <a
                href={storeLinks.android}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGooglePlayClick}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-background hover:bg-accent transition-colors"
              >
                <GooglePlayIcon className="h-3.5 w-3.5" />
                {androidLabel}
              </a>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-grow" />
    </Card>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {card}
      </a>
    )
  }

  return card
}
