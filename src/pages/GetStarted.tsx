import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Star } from "lucide-react"
import { sendEmail } from "@/lib/firebase"

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
    tagline: "Tailored web application built around your workflow",
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      
      if (selectedPackage === "online-presence") {
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

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">Get Started</h1>
            <p className="text-muted-foreground">Choose a package and tell me about your needs. I'll reply within 1–2 business days.</p>
          </div>

          {/* Always visible package selector */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {(Object.keys(PACKAGE_META) as PackageKey[]).map((key) => {
              const meta = PACKAGE_META[key]
              const isSelected = selectedPackage === key
              return (
                <Card 
                  key={key} 
                  className={`relative cursor-pointer transition-all hover:shadow-lg
                    ${isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50'}
                    ${meta.highlight ? 'border-primary/30' : ''}`}
                  onClick={() => setSelectedPackage(key)}
                >
                  {meta.highlight && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <Badge className="rounded-full px-3 py-0.5 flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3" /> Powerful and affordable
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{meta.label}</CardTitle>
                      <Badge variant="secondary" className="rounded-full text-xs">
                        {key === "online-presence" ? "Essential" : key === "web-app" ? "Business" : "Premium"}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">{meta.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{meta.price}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {selectedPackage ? (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Just a Few Details</h2>
                <p className="text-muted-foreground">
                  {selectedPackage === "online-presence"
                    ? "Let's get your online presence set up! Fill in these details and proceed to secure payment."
                    : "Help me understand your project better. Fill in these details and I'll prepare a custom proposal for you."}
                </p>
              </div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                  <CardDescription>Tell me how to reach you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company (optional)</Label>
                      <Input id="company" value={company} onChange={e => setCompany(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedPackage === "online-presence" ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Website Requirements</CardTitle>
                    <CardDescription>Help me set up your one-page website and essentials</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand name</Label>
                      <Input id="brand" value={brandName} onChange={e => setBrandName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain preference</Label>
                      <Input id="domain" placeholder="e.g. yourbrand.com" value={domainPreference} onChange={e => setDomainPreference(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional notes</Label>
                      <Textarea id="notes" rows={4} value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} placeholder="Anything else you'd like to add" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Describe your app and select the features you care about</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="details">What are we building?</Label>
                      <Textarea id="details" rows={6} value={projectDetails} onChange={e => setProjectDetails(e.target.value)} placeholder="Briefly describe your idea, audience, and goals" required />
                    </div>
                    <div className="space-y-3">
                      <Label>Features</Label>
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
                  {selectedPackage === "web-app" 
                    ? "Thanks for your web app inquiry! I'll review your requirements and get back to you within 1-2 business days with a detailed proposal."
                    : "Thanks for your mobile app inquiry! I'll review your requirements and get back to you within 1-2 business days with a detailed proposal."
                  }
                </div>
              )}
              {status === "error" && (
                <div className="p-3 mb-4 bg-red-50/20 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded">
                  Something went wrong. Please try again.
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {selectedPackage === "online-presence" ? "Processing..." : "Submitting..."}
                    </>
                  ) : (
                    <>{selectedPackage === "online-presence" ? "Continue to Payment" : "Submit Request"}</>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center text-muted-foreground">
              Please select a package above to continue
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default GetStarted