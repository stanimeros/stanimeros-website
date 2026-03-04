import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
  title,
  description,
  className,
}: PortfolioCardProps) {
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
