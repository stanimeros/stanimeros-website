import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { sendEmail } from "@/lib/firebase"
import { trackMetaEvent } from "@/lib/meta-events"

type PackageKey = "online-presence" | "web-app" | "mobile-app"

const PACKAGE_META: Record<PackageKey, { label: string; price: string; tagline: string; highlight?: boolean }> = {
  "online-presence": {
    label: "Online Presence",
    price: "€1,200 (incl. VAT)",
    tagline: "Everything you need to look professional online",
  },
  "web-app": {
    label: "Custom Web App",
    price: "Starting from €3,000 (incl. VAT)",
    tagline: "A web application built around your workflow",
    highlight: true,
  },
  "mobile-app": {
    label: "Custom Mobile App",
    price: "Starting from €10,000 (incl. VAT)",
    tagline: "iOS and Android application, launched properly",
  },
}

const WEB_FEATURES = [
  "Database",
  "Email sign-in",
  "Google sign-in",
  "Apple sign-in",
  "Stripe payments",
  "Subscriptions",
  "Maps & location",
  "Multi-language",
  "Camera & Photos",
  "Documents & Files",
  "Analytics",
]

const MOBILE_FEATURES = [
  ...WEB_FEATURES,
  "Reminders",
  "Push notifications",
  "In-app ads",
  "In-app subscriptions",
]

function GetStarted() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const initialPackage = (searchParams.get("package") as PackageKey) || undefined

  const [selectedPackage, setSelectedPackage] = useState<PackageKey | undefined>(initialPackage)
  
  // Common contact details
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [phone, setPhone] = useState("")

  // Online presence fields
  const [brandName, setBrandName] = useState("")
  const [domainPreference, setDomainPreference] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  // Web/Mobile
  const [projectDetails, setProjectDetails] = useState("")
  const featureList = useMemo(() => (selectedPackage === "mobile-app" ? MOBILE_FEATURES : WEB_FEATURES), [selectedPackage])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    if (initialPackage && ["online-presence", "web-app", "mobile-app"].includes(initialPackage)) {
      setSelectedPackage(initialPackage as PackageKey)
    }
  }, [initialPackage])

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature])
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setCompany("")
    setPhone("")
    setBrandName("")
    setDomainPreference("")
    setAdditionalNotes("")
    setProjectDetails("")
    setSelectedFeatures([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage) return

    setIsSubmitting(true)
    setStatus("idle")

    const pkg = PACKAGE_META[selectedPackage]

    const lines: string[] = []
    lines.push(`Package: ${pkg.label}`)
    lines.push(`Price: ${pkg.price}`)
    lines.push("")
    lines.push("Contact")
    lines.push(`- Name: ${name}`)
    lines.push(`- Email: ${email}`)
    if (company) lines.push(`- Company: ${company}`)
    if (phone) lines.push(`- Phone: ${phone}`)
    lines.push("")

    if (selectedPackage === "online-presence") {
      lines.push("Online Presence Requirements")
      lines.push(`- Brand name: ${brandName}`)
      if (domainPreference) lines.push(`- Domain preference: ${domainPreference}`)
      if (additionalNotes) lines.push(`- Notes: ${additionalNotes}`)
    } else {
      lines.push("Project Details")
      if (projectDetails) lines.push(projectDetails)
      if (selectedFeatures.length) {
        lines.push("")
        lines.push("Requested Features")
        for (const f of selectedFeatures) lines.push(`- ${f}`)
      }
    }

    const message = lines.join("\n")

    try {
      await sendEmail({
        subject: `Package Inquiry - ${pkg.label}`,
        name,
        email,
        message,
      })
      
      // Track form submission event
      trackMetaEvent('FormSubmission', {
        form_type: 'package_inquiry',
        package_type: selectedPackage,
        has_company: !!company,
        selected_features: selectedFeatures.length
      });

      if (selectedPackage === "online-presence") {
        // Track payment initiation
        trackMetaEvent('InitiateCheckout', {
          value: 1200,
          currency: 'EUR',
          package_type: 'online_presence'
        });
        // Redirect to Stripe payment link
        window.location.href = "https://buy.stripe.com/eVq8wP3OV1wPgKOena2Nq00"
      } else {
        setStatus("success")
        resetForm()
        setTimeout(() => setStatus("idle"), 5000)
      }
    } catch (err) {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-28 pb-16 max-w-3xl mx-auto px-4">
        <div className="container">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">{t('getStarted.title')}</h1>
            <p className="text-muted-foreground">{t('getStarted.subtitle')}</p>
          </div>

          {/* Contact Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('getStarted.contactDetails.title')}</CardTitle>
              <CardDescription>{t('getStarted.contactDetails.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('getStarted.contactDetails.name')}</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('getStarted.contactDetails.email')}</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">{t('getStarted.contactDetails.company')}</Label>
                  <Input id="company" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('getStarted.contactDetails.phone')}</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('getStarted.serviceSelection.title')}</CardTitle>
              <CardDescription>{t('getStarted.serviceSelection.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPackage} onValueChange={(value) => setSelectedPackage(value as PackageKey)}>
                <div className="flex flex-col space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="online-presence" id="online-presence" />
                      <Label htmlFor="online-presence" className="cursor-pointer font-medium py-0 my-0">
                        {t('getStarted.serviceSelection.onlinePresence.title')}
                      </Label>
                    </div>
                    <div className="pl-8 text-sm text-muted-foreground">
                      {t('getStarted.serviceSelection.onlinePresence.description')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="web-app" id="web-app" />
                      <Label htmlFor="web-app" className="cursor-pointer font-medium py-0 my-0">
                        {t('getStarted.serviceSelection.webApp.title')}
                      </Label>
                    </div>
                    <div className="pl-8 text-sm text-muted-foreground">
                      {t('getStarted.serviceSelection.webApp.description')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value="mobile-app" id="mobile-app" />
                      <Label htmlFor="mobile-app" className="cursor-pointer font-medium py-0 my-0">
                        {t('getStarted.serviceSelection.mobileApp.title')}
                      </Label>
                    </div>
                    <div className="pl-8 text-sm text-muted-foreground">
                      {t('getStarted.serviceSelection.mobileApp.description')}
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
          </div>

          {selectedPackage ? (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              {selectedPackage === "online-presence" ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{t('getStarted.onlinePresence.title')}</CardTitle>
                    <CardDescription>{t('getStarted.onlinePresence.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">{t('getStarted.onlinePresence.brandName')}</Label>
                      <Input id="brand" value={brandName} onChange={e => setBrandName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">{t('getStarted.onlinePresence.domain')}</Label>
                      <Input 
                        id="domain" 
                        placeholder={t('getStarted.onlinePresence.domainPlaceholder')} 
                        value={domainPreference} 
                        onChange={e => setDomainPreference(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('getStarted.onlinePresence.notes')}</Label>
                      <Textarea 
                        id="notes" 
                        rows={4} 
                        value={additionalNotes} 
                        onChange={e => setAdditionalNotes(e.target.value)} 
                        placeholder={t('getStarted.onlinePresence.notesPlaceholder')} 
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{t('getStarted.customApp.title')}</CardTitle>
                    <CardDescription>{t('getStarted.customApp.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="details">{t('getStarted.customApp.details')}</Label>
                      <Textarea 
                        id="details" 
                        rows={6} 
                        value={projectDetails} 
                        onChange={e => setProjectDetails(e.target.value)} 
                        placeholder={t('getStarted.customApp.detailsPlaceholder')} 
                        required 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>{t('getStarted.customApp.features')}</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {featureList.map((feat) => (
                          <label key={feat} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={selectedFeatures.includes(feat)} onCheckedChange={() => toggleFeature(feat)} />
                            <span className="text-sm text-muted-foreground">{feat}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status Messages */}
              {status === "success" && selectedPackage !== "online-presence" && (
                <div className="p-3 mb-4 bg-green-50/20 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 rounded">
                  {t(`getStarted.success.${selectedPackage === "web-app" ? "webApp" : "mobileApp"}`)}
                </div>
              )}
              {status === "error" && (
                <div className="p-3 mb-4 bg-red-50/20 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded">
                  {t('getStarted.error')}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t(selectedPackage === "online-presence" ? 'getStarted.buttons.processing' : 'getStarted.buttons.submitting')}
                    </>
                  ) : (
                    <>{t(selectedPackage === "online-presence" ? 'getStarted.buttons.payment' : 'getStarted.buttons.submit')}</>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center text-muted-foreground">
              {t('getStarted.selectPrompt')}
            </div>
          )}
      </section>

      <Footer />
    </div>
  )
}

export default GetStarted