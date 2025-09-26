import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  EnvelopeIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  ClockIcon,
  SparklesIcon,
  CursorArrowRaysIcon
} from "@heroicons/react/24/outline"
import { FacebookIcon, InstagramIcon, LinkedinIcon, GithubIcon } from "lucide-react"
import { sendEmail } from "@/lib/firebase"
import { trackEvent } from "@/lib/events"

export default function ContactSection() {
  const { t } = useTranslation()
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const result = await sendEmail({
        subject: "Free Consultation Request",
        name: contactForm.name,
        email: contactForm.email,
        message: 'Client filled the free consultation form'
      })
      
      console.log("Email sent successfully:", result)
      
      trackEvent('beginCheckout', {
        value: 0,
        currency: 'EUR',
        package: 'free-consultation'
      });
      
      setSubmitStatus("success")
      setContactForm({ name: "", email: "" })
      
      setTimeout(() => setSubmitStatus("idle"), 5000)
      
    } catch (error: any) {
      console.error("Error sending email:", error)
      setSubmitStatus("error")
      
      setTimeout(() => setSubmitStatus("idle"), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <motion.section 
      id="contact" 
      className="py-20 scroll-mt-10 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">✨ {t('contact.title')}</h2>
          <Separator className="w-24 mx-auto mb-4" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-6">{t('contact.subtitle')}</h3>
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-card/70 border border-border/60">
                <div className="mt-1">
                  <ClockIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{t('contact.features.consultation.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.features.consultation.description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-card/70 border border-border/60">
                <div className="mt-1">
                  <CursorArrowRaysIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{t('contact.features.solutions.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.features.solutions.description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-card/70 border border-border/60">
                <div className="mt-1">
                  <SparklesIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{t('contact.features.noObligations.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.features.noObligations.description')}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.form.message')}</CardTitle>
                <CardDescription>{t('contact.form.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('contact.form.name')}</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.namePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('contact.form.email')}</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      value={contactForm.email}
                      onChange={handleInputChange}
                      placeholder={t('contact.form.emailPlaceholder')}
                      required
                    />
                  </div>
                  
                  {/* Status Messages */}
                  {submitStatus === "success" && (
                    <div className="p-3 bg-green-50/20 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 rounded">
                      {t('contact.form.success')}
                    </div>
                  )}
                  
                  {submitStatus === "error" && (
                    <div className="p-3 bg-red-50/20 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded">
                      {t('contact.form.error')}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-primary" />
                <a href="mailto:hello@stanimeros.com" className="hover:text-primary transition-colors">
                  hello@stanimeros.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-primary" />
                <span>Thessaloniki, Greece</span>
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <Link to="https://linkedin.com/in/stanimeros" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <LinkedinIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="https://www.facebook.com/stanimeros.dev" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <FacebookIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="https://www.instagram.com/stanimeros_dev" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <InstagramIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="https://github.com/stanimeros" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <GithubIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
