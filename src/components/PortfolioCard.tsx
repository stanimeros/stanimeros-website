import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PortfolioCardProps {
  /** Technology badges to display */
  technologies: string[]
  /** Background color class (e.g. 'bg-red-900/30') */
  bgColor: string
  /** Text color class for the logo area (e.g. 'text-red-200') */
  textColor: string
  /** Optional logo/image URL - if not provided, shows initials */
  logo?: string
  /** Optional alt text for logo */
  logoAlt?: string
  /** Translated title (passed from parent for display) */
  title: string
  /** Translated description (passed from parent for display) */
  description: string
  className?: string
}

export function PortfolioCard({
  technologies,
  bgColor,
  textColor,
  logo,
  logoAlt,
  title,
  description,
  className,
}: PortfolioCardProps) {
  const initials = title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card
      className={cn(
        "overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 h-full flex flex-col w-full bg-card/70 hover:bg-card/70 pt-0",
        className
      )}
    >
      {/* Background with circle logo at bottom left */}
      <div
        className={cn(
          "h-40 flex items-end justify-start flex-none relative overflow-hidden p-4",
          bgColor
        )}
      >
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shrink-0",
            "bg-white/95 dark:bg-white/10 backdrop-blur-sm border-2 border-white/30 shadow-lg",
            !logo && textColor
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

      <CardHeader className="pt-6 flex-none">
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
}
