import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PortfolioCard } from "@/components/PortfolioCard"
import ProcessSection from "@/components/ProcessSection"
import {
  AcademicCapIcon,
  LightBulbIcon,
  HandRaisedIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline"
import { trackEvent } from "@/lib/events"
import GitHubCalendarComponent from "@/components/GitHubCalendar"
import { portfolioItems } from "@/lib/portfolio-data"

const sections = [
  { key: "background", icon: AcademicCapIcon },
  { key: "problems", icon: LightBulbIcon },
  { key: "whyWorkWithMe", icon: HandRaisedIcon },
] as const

const skillBadges = [
  "Web App", "Mobile App", "Website", "E-commerce", "AI",
  "Maps", "Cloud", "Cross-platform", "Payments", "Education",
]

const exampleKeys = ['fireMessage', 'hedeos', 'transHellas', 'atproPartner']
const examples = portfolioItems.filter((item) => exampleKeys.includes(item.key))

interface AboutProps {
  lang: "en" | "el"
}

export default function About({ lang }: AboutProps) {
  const { t } = useTranslation()
  const prefix = lang === "el" ? "/el" : ""
  // react-github-calendar breaks Node SSR during Astro's static build, so it's
  // only ever rendered client-side after mount.
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  useEffect(() => {
    trackEvent("pageView", { page: "about" })
  }, [])

  return (
    <>
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <h1 className="text-4xl font-bold mb-4">{t("aboutPage.title")}</h1>
        <Separator className="w-24 mx-auto mb-4" />
        <p className="text-xl text-muted-foreground">{t("aboutPage.intro")}</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-12 mb-16">
        {sections.map(({ key, icon: Icon }) => (
          <div key={key} className="flex gap-6">
            <div className="shrink-0">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">{t(`aboutPage.${key}.title`)}</h2>
              <p className="text-muted-foreground leading-relaxed">{t(`aboutPage.${key}.paragraph`)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-2 mb-16">
        {skillBadges.map((badge) => (
          <Badge key={badge} variant="secondary">{badge}</Badge>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mb-16">
        <div className="overflow-hidden w-full flex justify-center">
          {isMounted && <GitHubCalendarComponent username="stanimeros" />}
        </div>
        <div className="overflow-hidden w-full flex justify-center mt-4">
          <p className="text-muted-foreground text-sm">{t('about.githubDescription')}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
            <BriefcaseIcon className="h-6 w-6 text-primary" />
            {t('portfolio.title')}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examples.map((item) => (
            <PortfolioCard
              key={item.key}
              title={t(`portfolio.items.${item.key}.title`)}
              description={t(`portfolio.items.${item.key}.description`)}
              technologies={item.technologies}
              bgColor={item.bgColor}
              textColor={item.textColor}
              bgImage={item.bgImage}
              logo={item.logo}
              logoBg={item.logoBg}
              url={item.url}
            />
          ))}
        </div>
        <p className="text-center mt-8">
          <a href={`${prefix}/#portfolio`} className="text-primary hover:underline font-medium">
            {t('servicesPage.links.portfolio')}
          </a>
        </p>
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3">{t("aboutPage.cta.title")}</h2>
        <p className="text-muted-foreground mb-8">{t("aboutPage.cta.description")}</p>
        <Button variant="green" size="lg" asChild className="mb-10">
          <a href={`${prefix}/contact`}>{t("aboutPage.cta.button")}</a>
        </Button>

        <div className="flex justify-center gap-6 text-sm">
          <a href={`${prefix}/services`} className="text-muted-foreground hover:text-primary transition-colors">
            {t("aboutPage.links.services")}
          </a>
          <a href={`${prefix}/contact`} className="text-muted-foreground hover:text-primary transition-colors">
            {t("aboutPage.links.contact")}
          </a>
        </div>
      </div>
    </main>

    <ProcessSection />
    </>
  )
}
