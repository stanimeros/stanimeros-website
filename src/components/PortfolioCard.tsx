import { useTranslation } from "react-i18next"
import { Apple } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BetaLinks } from "@/lib/portfolio-data"

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#00D8FF" d="M3.6 2.2c-.4.3-.6.8-.6 1.4v17c0 .6.2 1 .6 1.4l.1.1 9.4-9.4v-.2L3.7 2.1z" />
      <path fill="#00F076" d="M16.3 12.9l-3.2-3.2 3.2-3.2 3.8 2.1c.9.5.9 1.6 0 2.1z" />
      <path fill="#FFCF00" d="M13.1 9.7 3.6 19.2c.3.3.8.4 1.3.1l8.9-5z" />
      <path fill="#FF3A44" d="M13.1 6.3 5 1.2c-.5-.3-1-.2-1.3.1z" />
    </svg>
  )
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
  /** Optional beta program links (TestFlight / Google Play) shown as chips */
  betaLinks?: BetaLinks
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
  betaLinks,
  title,
  description,
  className,
}: PortfolioCardProps) {
  const { t } = useTranslation()

  const handleGooglePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isAndroid = /android/i.test(navigator.userAgent)
    const href = isAndroid ? betaLinks?.android : betaLinks?.androidWeb ?? betaLinks?.android
    if (href) window.open(href, "_blank", "noopener,noreferrer")
  }

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
        {betaLinks && (betaLinks.apple || betaLinks.android) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {betaLinks.apple && (
              <a
                href={betaLinks.apple}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-background hover:bg-accent transition-colors"
              >
                <Apple className="h-3.5 w-3.5" />
                {t("portfolioCard.betaApple")}
              </a>
            )}
            {betaLinks.android && (
              <a
                href={betaLinks.android}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGooglePlayClick}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium bg-background hover:bg-accent transition-colors"
              >
                <GooglePlayIcon className="h-3.5 w-3.5" />
                {t("portfolioCard.betaGoogle")}
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
