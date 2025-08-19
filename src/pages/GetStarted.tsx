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
import { trackEvent } from "@/lib/events"

type PackageKey = "online-presence" | "e-shop" | "custom-app"

const PACKAGE_META: Record<PackageKey, { label: string; tagline: string; highlight?: boolean }> = {
  "online-presence": {
    label: "Online Presence",
    tagline: "Everything you need to look professional online",
  },
  "e-shop": {
    label: "E-shop",
    tagline: "A complete online store built with WordPress or Shopify",
    highlight: true,
  },
  "custom-app": {
    label: "Custom App",
    tagline: "Custom web, iOS, and Android apps",
  },
}

const CUSTOM_APP_FEATURES = [
  "Database",
  "Email sign-in",
  "Google sign-in",
  "Apple sign-in",
  "Stripe payments",
  "Subscriptions",
  "Maps & Location",
  "Multi-language",
  "Camera & Photos",
  "Documents & Files",
  "Analytics",
  "Reminders",
  "Push notifications",
  "Ads",
]

const PAYMENT_METHODS = [
  "Apple & Google Pay",
  "Bank Transfer",
  "Cash on Delivery",
  "Cards (Visa, Mastercard, etc.)",
]

const DELIVERY_METHODS = [
  "ACS",
  "ELTA",
  "Geniki",
  "Speedex",
  "BOX Now",
  "Pickup",
  "Other"
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
  const featureList = useMemo(() => (selectedPackage === "custom-app" ? CUSTOM_APP_FEATURES : []), [selectedPackage])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  // E-shop specific fields
  const [businessType, setBusinessType] = useState("")
  const [productsCount, setProductsCount] = useState("")
  const [additionalNeeds, setAdditionalNeeds] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [deliveryMethods, setDeliveryMethods] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    window.scrollTo({ top: 0 })
    trackEvent('pageView', {
      page: 'get-started'
    });
  }, [])

  useEffect(() => {
    if (initialPackage && ["online-presence", "e-shop", "custom-app"].includes(initialPackage)) {
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
    setBusinessType("")
    setProductsCount("")
    setAdditionalNeeds("")
    setPaymentMethods([])
    setDeliveryMethods([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage || isSubmitting) return

    setIsSubmitting(true)
    setStatus("idle")

    const pkg = PACKAGE_META[selectedPackage]

    const lines: string[] = []
    lines.push(`Package: ${pkg.label}`)
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
    } else if (selectedPackage === "e-shop") {
      lines.push("E-shop Requirements")
      lines.push(`- Business Type: ${businessType}`)
      lines.push(`- Products Count: ${productsCount}`)
      if (paymentMethods.length) {
        lines.push("- Payment Methods:")
        paymentMethods.forEach(method => lines.push(`  • ${method}`))
      }
      if (deliveryMethods.length) {
        lines.push("- Delivery Methods:")
        deliveryMethods.forEach(method => lines.push(`  • ${method}`))
      }
      if (additionalNeeds) {
        lines.push("- Additional Requirements:")
        lines.push(`  ${additionalNeeds}`)
      }
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

      if (selectedPackage === "online-presence" || selectedPackage === "e-shop") {
        // Track payment initiation
        trackEvent('beginCheckout', {
          currency: 'EUR',
          package: selectedPackage,
          value: selectedPackage === "online-presence" ? 1200 : 2400,
        });
        // Redirect to Stripe payment link with email parameter
        const stripeUrl = new URL(
          selectedPackage === "online-presence" 
            ? "https://buy.stripe.com/eVq8wP3OV1wPgKOena2Nq00"
            : "https://buy.stripe.com/14AeVd5X3b7p5265QE2Nq01"
        )
        stripeUrl.searchParams.set('prefilled_email', email.trim())
        window.location.href = stripeUrl.toString()
      } else {
        trackEvent('beginCheckout', {
          currency: 'EUR',
          value: 5000,
          package: selectedPackage
        });
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

          <form onSubmit={handleSubmit}>
            {/* Service Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t('getStarted.serviceSelection.title')}</CardTitle>
                <CardDescription>{t('getStarted.serviceSelection.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPackage} onValueChange={(value) => setSelectedPackage(value as PackageKey)} required>
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
                        <RadioGroupItem value="e-shop" id="e-shop" />
                        <Label htmlFor="e-shop" className="cursor-pointer font-medium py-0 my-0">
                          {t('getStarted.serviceSelection.eShop.title')}
                        </Label>
                      </div>
                      <div className="pl-8 text-sm text-muted-foreground">
                        {t('getStarted.serviceSelection.eShop.description')}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-4">
                        <RadioGroupItem value="custom-app" id="custom-app" />
                        <Label htmlFor="custom-app" className="cursor-pointer font-medium py-0 my-0">
                          {t('getStarted.serviceSelection.customApp.title')}
                        </Label>
                      </div>
                      <div className="pl-8 text-sm text-muted-foreground">
                        {t('getStarted.serviceSelection.customApp.description')}
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

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
              ) : selectedPackage === "e-shop" ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{t('getStarted.eshop.title')}</CardTitle>
                    <CardDescription>{t('getStarted.eshop.subtitle')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">{t('getStarted.eshop.businessType')}</Label>
                      <Input 
                        id="businessType" 
                        value={businessType}
                        onChange={e => setBusinessType(e.target.value)}
                        placeholder={t('getStarted.eshop.businessTypePlaceholder')}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productsCount">{t('getStarted.eshop.productsCount')}</Label>
                      <Input 
                        id="productsCount"
                        value={productsCount}
                        onChange={e => setProductsCount(e.target.value)}
                        placeholder={t('getStarted.eshop.productsCountPlaceholder')}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>{t('getStarted.eshop.paymentMethods')}</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {PAYMENT_METHODS.map((method) => (
                          <label key={method} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox 
                              checked={paymentMethods.includes(method)} 
                              onCheckedChange={() => {
                                setPaymentMethods(prev => 
                                  prev.includes(method) 
                                    ? prev.filter(m => m !== method)
                                    : [...prev, method]
                                )
                              }} 
                            />
                            <span className="text-sm text-muted-foreground">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryMethods">{t('getStarted.eshop.deliveryMethods')}</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {DELIVERY_METHODS.map((method) => (
                          <label key={method} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={deliveryMethods.includes(method)} onCheckedChange={() => setDeliveryMethods(prev => 
                              prev.includes(method) 
                                ? prev.filter(m => m !== method)
                                : [...prev, method]
                            )} />
                            <span className="text-sm text-muted-foreground">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="additionalNeeds">{t('getStarted.eshop.additionalNeeds')}</Label>
                      <Textarea 
                        id="additionalNeeds"
                        value={additionalNeeds}
                        onChange={e => setAdditionalNeeds(e.target.value)}
                        placeholder={t('getStarted.eshop.additionalNeedsPlaceholder')}
                        rows={3}
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

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isSubmitting || !selectedPackage}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('getStarted.buttons.processing')}
                  </>
                ) : (
                  <>{t(['online-presence', 'e-shop'].includes(selectedPackage || '') ? 'getStarted.buttons.payment' : 'getStarted.buttons.submit')}</>
                )}
              </Button>
            </div>
            {/* Status Messages */}
            {status === "success" && selectedPackage !== "online-presence" && (
              <div className="p-3 mb-4 bg-green-50/20 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 rounded">
                {t('getStarted.success')}
              </div>
            )}
            {status === "error" && (
              <div className="p-3 mb-4 bg-red-50/20 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded">
                {t('getStarted.error')}
              </div>
            )}
          </form>
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default GetStarted