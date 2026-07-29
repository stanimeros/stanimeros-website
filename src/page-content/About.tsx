import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  AcademicCapIcon,
  LightBulbIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline"
import { trackEvent } from "@/lib/events"

const sections = [
  { key: "background", icon: AcademicCapIcon },
  { key: "problems", icon: LightBulbIcon },
  { key: "whyWorkWithMe", icon: HandRaisedIcon },
] as const

interface AboutProps {
  lang: "en" | "el"
}

export default function About({ lang }: AboutProps) {
  const { t } = useTranslation()
  const prefix = lang === "el" ? "/el" : ""

  useEffect(() => {
    trackEvent("pageView", { page: "about" })
  }, [])

  return (
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
  )
}
