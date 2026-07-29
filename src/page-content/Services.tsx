import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SparklesIcon,
  DevicePhoneMobileIcon,
  PuzzlePieceIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline"
import { trackEvent } from "@/lib/events"

const items = [
  { key: "automation", icon: SparklesIcon },
  { key: "apps", icon: DevicePhoneMobileIcon },
  { key: "optimization", icon: PuzzlePieceIcon },
  { key: "aiData", icon: CircleStackIcon },
] as const

interface ServicesProps {
  lang: "en" | "el"
}

export default function Services({ lang }: ServicesProps) {
  const { t } = useTranslation()
  const prefix = lang === "el" ? "/el" : ""

  useEffect(() => {
    trackEvent("pageView", { page: "services" })
  }, [])

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center mb-14">
        <h1 className="text-4xl font-bold mb-4">{t("servicesPage.title")}</h1>
        <Separator className="w-24 mx-auto mb-4" />
        <p className="text-xl text-muted-foreground mb-4">{t("servicesPage.subtitle")}</p>
        <p className="text-muted-foreground">{t("servicesPage.intro")}</p>
      </div>

      <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-2 mb-16">
        {items.map(({ key, icon: Icon }) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t(`servicesPage.items.${key}.title`)}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t(`servicesPage.items.${key}.description`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-3">{t("servicesPage.cta.title")}</h2>
        <p className="text-muted-foreground mb-8">{t("servicesPage.cta.description")}</p>
        <Button variant="green" size="lg" asChild className="mb-10">
          <a href={`${prefix}/contact`}>{t("servicesPage.cta.button")}</a>
        </Button>

        <div className="flex justify-center gap-6 text-sm">
          <a href={`${prefix}/about`} className="text-muted-foreground hover:text-primary transition-colors">
            {t("servicesPage.links.about")}
          </a>
          <a href={`${prefix}/contact`} className="text-muted-foreground hover:text-primary transition-colors">
            {t("servicesPage.links.contact")}
          </a>
        </div>
      </div>
    </main>
  )
}
