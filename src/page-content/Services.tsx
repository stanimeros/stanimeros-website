import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PortfolioCard } from "@/components/PortfolioCard"
import ProcessSection from "@/components/ProcessSection"
import {
  SparklesIcon,
  DevicePhoneMobileIcon,
  PuzzlePieceIcon,
  CircleStackIcon,
  CheckIcon,
  CubeTransparentIcon,
  BriefcaseIcon,
  BoltIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline"
import { trackEvent } from "@/lib/events"
import { portfolioItems } from "@/lib/portfolio-data"

const items = [
  { key: "automation", icon: SparklesIcon },
  { key: "apps", icon: DevicePhoneMobileIcon },
  { key: "optimization", icon: PuzzlePieceIcon },
  { key: "aiData", icon: CircleStackIcon },
] as const

const packages = [
  {
    title: 'packages.onlinePresence.title',
    description: 'packages.onlinePresence.description',
    badge: 'Automation',
    features: 'packages.onlinePresence.features',
    className: 'border-border/60',
    ctaIcon: <BoltIcon className="h-6 w-6 mr-2 stroke-[1.5]" />,
  },
  {
    title: 'packages.eShop.title',
    description: 'packages.eShop.description',
    badge: 'Development',
    features: 'packages.eShop.features',
    className: 'border-primary/30 ring-1 ring-primary/30 bg-primary/5',
    ctaIcon: <BuildingStorefrontIcon className="h-6 w-6 mr-2 stroke-[1.5]" />,
  },
  {
    title: 'packages.customApp.title',
    description: 'packages.customApp.description',
    badge: 'AI',
    features: 'packages.customApp.features',
    className: 'border-border/60',
    ctaIcon: <SparklesIcon className="h-6 w-6 mr-2 stroke-[1.5]" />,
  },
] as const

const exampleKeys = ['irisdrop', 'veridictum', 'skiGreece', 'ekarotsi']
const examples = portfolioItems.filter((item) => exampleKeys.includes(item.key))

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
    <>
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

        {/* Packages */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3 flex items-center justify-center gap-2">
              <CubeTransparentIcon className="h-6 w-6 text-primary" />
              {t('packages.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('packages.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.title} className={`relative flex flex-col h-full bg-card/70 ${pkg.className}`}>
                <CardHeader className="flex-none">
                  <div className="flex items-center justify-between">
                    <CardTitle>{t(pkg.title)}</CardTitle>
                    <Badge variant="secondary" className="rounded-full">{pkg.badge}</Badge>
                  </div>
                  <CardDescription>{t(pkg.description)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="text-lg font-semibold">{t('packages.getQuote')}</div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {(t(pkg.features, { returnObjects: true }) as string[]).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2">
                        <CheckIcon className="h-4 w-4 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="px-6 pb-6 mt-auto">
                  <Button variant="green" size="lg" className="w-full h-14 sm:h-12 px-8 text-base" asChild>
                    <a href={`${prefix}/contact?source=services-package`}>
                      {pkg.ctaIcon}
                      {t('packages.getStarted')}
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">{t('packages.footer')}</p>
        </div>

        {/* Example projects */}
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

      <ProcessSection />
    </>
  )
}
