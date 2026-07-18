import { useState } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import "../i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaperAirplaneIcon, CheckCircleIcon } from "@heroicons/react/24/outline"
import { sendEmail } from "@/lib/firebase"
import { trackEvent } from "@/lib/events"
import Layout from "@/components/Layout"

export default function Contact() {
  const { t, i18n } = useTranslation()
  const isGreek = i18n.language === 'el'
  const [searchParams] = useSearchParams()
  const packageContext = searchParams.get("package") ?? undefined
  const source = searchParams.get("source") ?? "contact-page"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const packageLabel = packageContext ?? undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setStatus("idle")

    const lines = [
      `Source: ${source}`,
      ...(packageLabel ? [`Package: ${packageLabel}`] : []),
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      ...(phone ? [`Phone: ${phone}`] : []),
    ]

    try {
      await sendEmail({
        subject: packageLabel ? `Service Inquiry - ${packageLabel}` : "Free Strategy Call Request",
        name,
        email,
        message: lines.join("\n"),
      })

      trackEvent('beginCheckout', {
        package: packageContext ?? source,
        value: 0,
        currency: 'EUR',
      })

      setStatus("success")
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <Helmet>
        <html lang={isGreek ? 'el' : 'en'} />
        <title>{isGreek
          ? 'Επικοινωνία | Δωρεάν Συνάντηση | Pantelis Stanimeros'
          : 'Contact | Free Strategy Call | Pantelis Stanimeros'}
        </title>
        <meta name="description" content={isGreek
          ? 'Κλείστε μια δωρεάν αρχική συνάντηση για να συζητήσουμε την εφαρμογή ή τον αυτοματισμό που χρειάζεστε. Απαντώ εντός 24 ωρών.'
          : 'Book a free strategy call to discuss your app, AI automation, or business problem. Based in Thessaloniki, Greece. Response within 24 hours.'}
        />
        <link rel="canonical" href={isGreek ? 'https://stanimeros.com/el/contact' : 'https://stanimeros.com/en/contact'} />
        <link rel="alternate" hrefLang="en" href="https://stanimeros.com/en/contact" />
        <link rel="alternate" hrefLang="el" href="https://stanimeros.com/el/contact" />
        <meta property="og:title" content={isGreek
          ? 'Επικοινωνία | Δωρεάν Συνάντηση | Pantelis Stanimeros'
          : 'Contact | Free Strategy Call | Pantelis Stanimeros'}
        />
        <meta property="og:description" content={isGreek
          ? 'Κλείστε μια δωρεάν αρχική συνάντηση. Απαντώ εντός 24 ωρών.'
          : 'Book a free strategy call. Response within 24 hours.'}
        />
        <meta property="og:url" content={isGreek ? 'https://stanimeros.com/el/contact' : 'https://stanimeros.com/en/contact'} />
        <meta property="og:locale" content={isGreek ? 'el_GR' : 'en_US'} />
      </Helmet>

      <main className="container mx-auto px-4 py-20 max-w-lg">
        {status === "success" ? (
          <div className="text-center space-y-4">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto" />
            <h1 className="text-3xl font-bold">{t('contact.title')}</h1>
            <p className="text-muted-foreground">{t('contact.form.success')}</p>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-bold mb-3">
                {packageLabel ?? t('contact.title')}
              </h1>
              <p className="text-muted-foreground">{t('contact.form.description')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">{t('contact.form.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('contact.form.namePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('contact.form.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('contact.form.emailPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('getStarted.contactDetails.phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+30 69X XXX XXXX"
                />
              </div>

              {status === "error" && (
                <div className="p-3 bg-red-950/30 border border-red-800/50 text-red-300 rounded text-sm">
                  {t('contact.form.error')}
                </div>
              )}

              <Button
                type="submit"
                variant="green"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                    {t('contact.form.sending')}
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    {t('contact.form.send')}
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </main>
    </Layout>
  )
}
