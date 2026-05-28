import { Link } from "react-router-dom"
import { useParams } from "react-router-dom"
import { useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ShieldCheckIcon as Shield,
  EyeIcon,
  LockClosedIcon as Lock,
  CircleStackIcon as Database,
  UsersIcon,
  DocumentTextIcon as FileText,
  KeyIcon,
  EnvelopeIcon as Mail
} from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"
import "../i18n"
import Layout from "@/components/Layout"
import { trackEvent } from "@/lib/events"

const PRIVACY_POLICY_PRESETS: Record<string, { appName: string; developer: string; company: string; contactEmail: string }> = {
  "atpro-partner": {
    appName: "ATPro Partner",
    developer: "MP CARRIERS O.E.",
    company: "MP CARRIERS O.E.",
    contactEmail: "mp.transfer.app@gmail.com",
  },
  "e-karotsi": {
    appName: "e-karotsi.gr",
    developer: "STANIMEROS PANTELEIMON",
    company: "STANIMEROS PANTELEIMON",
    contactEmail: "hello@stanimeros.com",
  },
  "ski-greece": {
    appName: "Ski Greece",
    developer: "STANIMEROS PANTELEIMON",
    company: "STANIMEROS PANTELEIMON",
    contactEmail: "hello@stanimeros.com",
  },
  "fire-message": {
    appName: "Fire Message",
    developer: "STANIMEROS PANTELEIMON",
    company: "STANIMEROS PANTELEIMON",
    contactEmail: "hello@stanimeros.com",
  },
}

const PrivacyPolicy = () => {
  const { t } = useTranslation()
  const { appSlug } = useParams<{ appSlug?: string }>()
  const preset = useMemo(
    () => (appSlug && PRIVACY_POLICY_PRESETS[appSlug]) ? PRIVACY_POLICY_PRESETS[appSlug] : null,
    [appSlug]
  )

  useEffect(() => {
    scrollTo(0, 0)
    trackEvent('pageView', {
      page: 'privacy-policy',
      appSlug: appSlug ?? undefined,
    });
  }, [appSlug])

  useEffect(() => {
    if (preset) {
      document.title = `Privacy Policy – ${preset.appName}`
    }
  }, [preset])

  return (
    <Layout>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t('privacyPolicy.title')}</h1>
            <p className="text-muted-foreground">
              {t('privacyPolicy.lastUpdated')}
            </p>
            {preset && (
              <Card className="mt-6 text-left border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('privacyPolicy.entity.appName')}
                      </dt>
                      <dd className="mt-0.5 font-semibold text-lg">{preset.appName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('privacyPolicy.entity.developer')}
                      </dt>
                      <dd className="mt-0.5">{preset.developer}</dd>
                    </div>
                    {preset.company !== preset.developer && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">
                          {t('privacyPolicy.entity.company')}
                        </dt>
                        <dd className="mt-0.5">{preset.company}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t('privacyPolicy.entity.contact')}
                      </dt>
                      <dd className="mt-0.5">
                        <a href={`mailto:${preset.contactEmail}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                          <Mail className="h-4 w-4 shrink-0" />
                          {preset.contactEmail}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {t('privacyPolicy.introduction.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {preset
                  ? t('privacyPolicy.introduction.paragraph1App', { appName: preset.appName, developer: preset.developer })
                  : t('privacyPolicy.introduction.paragraph1')}
              </p>
              <p className="text-muted-foreground">
                {t('privacyPolicy.introduction.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                {t('privacyPolicy.informationWeCollect.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t('privacyPolicy.informationWeCollect.personalInformation.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacyPolicy.informationWeCollect.personalInformation.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('privacyPolicy.informationWeCollect.locationData.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacyPolicy.informationWeCollect.locationData.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('privacyPolicy.informationWeCollect.usageData.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacyPolicy.informationWeCollect.usageData.description')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t('privacyPolicy.informationWeCollect.deviceInformation.title')}</h3>
                <p className="text-muted-foreground">
                  {t('privacyPolicy.informationWeCollect.deviceInformation.description')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <EyeIcon className="h-5 w-5 mr-2" />
                {t('privacyPolicy.howWeUseInformation.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                {(t('privacyPolicy.howWeUseInformation.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                {t('privacyPolicy.informationSharing.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('privacyPolicy.informationSharing.description')}
              </p>
            </CardContent>
          </Card>

          {/* API Keys and Service Account Keys */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <KeyIcon className="h-5 w-5 mr-2" />
                {t('privacyPolicy.apiKeys.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('privacyPolicy.apiKeys.paragraph1')}
              </p>
              <p className="text-muted-foreground mb-4">
                {t('privacyPolicy.apiKeys.paragraph2')}
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                {t('privacyPolicy.dataSecurity.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('privacyPolicy.dataSecurity.description')}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                {(t('privacyPolicy.dataSecurity.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('privacyPolicy.yourRights.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('privacyPolicy.yourRights.description')}
              </p>
              <ul className="space-y-2 text-muted-foreground">
                {(t('privacyPolicy.yourRights.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('privacyPolicy.dataRetention.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('privacyPolicy.dataRetention.description')}
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('privacyPolicy.childrensPrivacy.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('privacyPolicy.childrensPrivacy.description')}
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('privacyPolicy.changesToPolicy.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('privacyPolicy.changesToPolicy.description')}
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('privacyPolicy.contactUs.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('privacyPolicy.contactUs.description')}
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>{t('privacyPolicy.contactUs.email')} <a href="mailto:hello@stanimeros.com" className="text-primary hover:underline">hello@stanimeros.com</a></p>
                <p>{t('privacyPolicy.contactUs.address')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Deletion Link */}
          <div className="text-center">
            <Separator className="my-8" />
            <p className="text-muted-foreground mb-4">
              {t('privacyPolicy.dataDeletionLink.description')}
            </p>
            <Link to="/data-deletion">
              <Button>
                {t('privacyPolicy.dataDeletionLink.button')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default PrivacyPolicy 