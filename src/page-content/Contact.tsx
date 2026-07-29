import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  SparklesIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline"
import { sendEmail } from "@/lib/firebase"
import { trackEvent } from "@/lib/events"

const trustFeatures = [
  { key: "consultation", icon: ClockIcon },
  { key: "solutions", icon: CursorArrowRaysIcon },
  { key: "noObligations", icon: SparklesIcon },
] as const

const faqItems = ["hiddenFees", "timeToLaunch", "hosting"] as const

export default function Contact() {
  const { t } = useTranslation()
  const [searchParams] = useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
  )
  const source = searchParams.get("source") ?? "contact-page"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    trackEvent('pageView', {
      page: 'contact',
      source,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setStatus("idle")

    const lines = [
      `Source: ${source}`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      ...(phone ? [`Phone: ${phone}`] : []),
    ]

    try {
      await sendEmail({
        subject: "Free Strategy Call Request",
        name,
        email,
        message: lines.join("\n"),
      })

      trackEvent('beginCheckout', {
        package: source,
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
    <>
      <main className="container mx-auto px-4 py-20 max-w-2xl">
        <div className="grid gap-3 mb-14 sm:grid-cols-3">
          {trustFeatures.map(({ key, icon: Icon }) => (
            <div key={key} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-card/70 border border-border/60">
              <Icon className="h-5 w-5 text-primary" />
              <div className="font-medium text-sm">{t(`contact.features.${key}.title`)}</div>
              <p className="text-xs text-muted-foreground">{t(`contact.features.${key}.description`)}</p>
            </div>
          ))}
        </div>

        {status === "success" ? (
          <div className="text-center space-y-4">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto" />
            <h1 className="text-3xl font-bold">{t('contact.title')}</h1>
            <p className="text-muted-foreground">{t('contact.form.success')}</p>
          </div>
        ) : (
          <>
            <div className="max-w-lg mx-auto">
              <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold mb-3">
                  {t('contact.title')}
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
                  className="w-full h-14 sm:h-12 text-base"
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
            </div>

            <div className="mt-20">
              <Separator className="w-24 mx-auto mb-8" />
              <h2 className="text-xl font-semibold text-center mb-6 flex items-center justify-center gap-2">
                <QuestionMarkCircleIcon className="h-5 w-5 text-primary shrink-0" />
                {t('packages.faq.title')}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((key) => (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger>{t(`packages.faq.items.${key}.question`)}</AccordionTrigger>
                    <AccordionContent>{t(`packages.faq.items.${key}.answer`)}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </>
        )}
      </main>
    </>
  )
}
