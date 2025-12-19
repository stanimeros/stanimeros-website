import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import "../i18n"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform, useSpring, type HTMLMotionProps } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  EnvelopeIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  LightBulbIcon,
  BuildingStorefrontIcon,
  CogIcon,
  CursorArrowRaysIcon
} from "@heroicons/react/24/outline"
import { sendEmail } from "@/lib/firebase"
import GitHubCalendarComponent from "@/components/GitHubCalendar"
import { trackEvent } from "@/lib/events"
import { useScrollAnimation, useMobileCardAnimation } from "@/lib/hooks"
import { FacebookIcon, InstagramIcon, LinkedinIcon, GithubIcon } from "lucide-react"
import Layout from "@/components/Layout"

const HomePage = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const logoY = useTransform(scrollY, [0, 500], [0, 100])
  const logoOpacity = useTransform(scrollY, [0, 500], [0.1, 0])
  const smoothLogoY = useSpring(logoY, { stiffness: 100, damping: 30 })
  
  // Refs for scroll animations
  const aboutRef = useRef<HTMLElement>(null)
  const servicesRef = useRef<HTMLElement>(null)
  const packagesRef = useRef<HTMLElement>(null)
  const portfolioRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)
  
  // Refs for card animations
  const serviceCardRefs = Array(4).fill(null).map(() => useRef<HTMLDivElement>(null))
  const packageCardRefs = Array(3).fill(null).map(() => useRef<HTMLDivElement>(null))
  const portfolioCardRefs = Array(11).fill(null).map(() => useRef<HTMLDivElement>(null))
  
  // Get animation props for each section
  const aboutAnimation = useScrollAnimation(aboutRef)
  const servicesAnimation = useScrollAnimation(servicesRef)
  const packagesAnimation = useScrollAnimation(packagesRef)
  const portfolioAnimation = useScrollAnimation(portfolioRef)
  const contactAnimation = useScrollAnimation(contactRef)
  
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    trackEvent('pageView', {
      page: 'home'
    });
  }, []);

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
      
      // Track contact form submission
      trackEvent('beginCheckout', {
        value: 0,
        currency: 'EUR',
        package: 'free-consultation'
      });
      
      setSubmitStatus("success")
      setContactForm({ name: "", email: "" })
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000)
      
    } catch (error: any) {
      console.error("Error sending email:", error)
      setSubmitStatus("error")
      
      // Reset status after 5 seconds
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

  const portfolioItems = [
    {
      key: 'fireMessage',
      technologies: ["iOS", "Android", "Push Notifications", "Firebase Cloud Messaging", "In-App Purchases"],
      bgColor: "bg-red-900/30",
      textColor: "text-red-200"
    },
    {
      key: 'tattooHealer',
      technologies: ["Web App", "iOS", "Android", "Push Notifications", "Admin Dashboard", "Educational Content"],
      bgColor: "bg-purple-900/30",
      textColor: "text-purple-200"
    },
    {
      key: 'transHellas',
      technologies: ["Web App", "Parcel Management", "Admin Panel", "Tracking System", "Logistics"],
      bgColor: "bg-blue-900/30",
      textColor: "text-blue-200"
    },
    {
      key: 'ridefast',
      technologies: ["React", "TypeScript", "Google Maps", "Firestore", "Resend", "Stripe API"],
      bgColor: "bg-gray-900/30",
      textColor: "text-gray-200"
    },
    {
      key: 'mpTransfer',
      technologies: ["iOS", "Android", "Web", "Flutter", "Push Notifications", "Firestore"],
      bgColor: "bg-sky-900/30",
      textColor: "text-sky-200"
    },
    {
      key: 'tapfast',
      technologies: ["React", "TypeScript", "QR Codes", "Admin Panel"],
      bgColor: "bg-orange-900/30",
      textColor: "text-orange-200"
    },
    {
      key: 'mealAi',
      technologies: ["Android", "iOS", "AI", "Computer Vision", "Mobile App"],
      bgColor: "bg-blue-900/30",
      textColor: "text-blue-200"
    },
    {
      key: 'near',
      technologies: ["Java", "Python", "Android", "iOS", "Google Maps", "Machine Learning"],
      bgColor: "bg-orange-900/30",
      textColor: "text-orange-200"
    },
    {
      key: 'reserwave',
      technologies: ["PHP", "MySQL", "React", "JavaScript", "Search System"],
      bgColor: "bg-cyan-900/30",
      textColor: "text-cyan-200"
    },
    {
      key: 'hedeos',
      technologies: ["iOS", "Android", "Education", "Quizzes", "Mobile App"],
      bgColor: "bg-yellow-900/30",
      textColor: "text-yellow-200"
    },
    {
      key: 'ekarotsi',
      technologies: ["Web", "E-commerce", "Supermarket", "Online Ordering"],
      bgColor: "bg-green-900/30",
      textColor: "text-green-200"
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative z-20">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-20">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-row gap-4 justify-center relative z-20">
            <Button size="lg" onClick={() => scrollToSection('packages')}>
              {t('hero.viewPackages')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection('contact')}>
              {t('hero.getInTouch')}
            </Button>
          </div>
          {/* Logo positioned behind everything */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none"
            style={{ 
              y: smoothLogoY,
              opacity: logoOpacity
            }}
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          >
            <img 
              src="/images/logo-glass.png" 
              alt="Stanimeros Logo" 
              width="400"
              height="400"
              loading="lazy"
              className="h-[400%] w-auto object-contain"
              fetchPriority="low"
            />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <motion.section 
        ref={aboutRef}
        id="about" 
        className="py-20 bg-card/70 scroll-mt-10 overflow-hidden"
        {...(aboutAnimation as HTMLMotionProps<"section">)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('about.title')}</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-semibold mb-4">{t('about.name')}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('about.description1')}
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('about.description2')}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Flutter</Badge>
                <Badge variant="secondary">Python</Badge>
                <Badge variant="secondary">Java</Badge>
                <Badge variant="secondary">PHP</Badge>
                <Badge variant="secondary">Firestore</Badge>
                <Badge variant="secondary">MySQL</Badge>
                <Badge variant="secondary">Google Maps</Badge>
                <Badge variant="secondary">AI/ML</Badge>
              </div>
            </div>
            <div className="space-y-8">
              <div className="relative">
                <div className="w-full h-84 rounded-lg overflow-hidden">
                  <img 
                    src="/images/pantelis.webp" 
                    alt={t('about.name')}
                    width="600"
                    height="600"
                    loading="lazy"
                    className="w-full h-full object-cover object-center"
                    fetchPriority="high"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-hidden pt-16 w-full flex justify-center">
            <GitHubCalendarComponent username="stanimeros" />
          </div>
          <div className="overflow-hidden w-full flex justify-center">
            <p className="text-muted-foreground text-sm">
              {t('about.githubDescription')}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        ref={servicesRef}
        id="services" 
        className="p-10 pb-20 scroll-mt-10 overflow-hidden"
        {...(servicesAnimation as HTMLMotionProps<"section">)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('services.title')}</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              {
                icon: <LightBulbIcon className="h-8 w-8" />,
                title: 'services.consulting.title',
                description: 'services.consulting.description'
              },
              {
                icon: <BuildingStorefrontIcon className="h-8 w-8" />,
                title: 'services.websites.title',
                description: 'services.websites.description'
              },
              {
                icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
                title: 'services.mobile.title',
                description: 'services.mobile.description'
              },
              {
                icon: <CogIcon className="h-8 w-8" />,
                title: 'services.automation.title',
                description: 'services.automation.description'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                ref={serviceCardRefs[index]}
                {...useMobileCardAnimation(serviceCardRefs[index], index)}
                className="md:transform-none w-full"
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 h-full flex flex-col bg-card/70 hover:bg-card/70">
                  <CardHeader className="text-center flex-none">
                    <div className="mx-auto mb-4 text-primary">
                      {service.icon}
                    </div>
                    <CardTitle>{t(service.title)}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-center">
                      {t(service.description)}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Packages Section */}
      <motion.section 
        ref={packagesRef}
        id="packages" 
        className="py-10 pb-20 scroll-mt-10 overflow-hidden"
        {...(packagesAnimation as HTMLMotionProps<"section">)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('packages.title')}</h2>
            <Separator className="w-24 mx-auto" />
            <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
              {t('packages.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {[
              {
                title: 'packages.onlinePresence.title',
                description: 'packages.onlinePresence.description',
                badge: 'Essential',
                features: 'packages.onlinePresence.features',
                package: 'online-presence',
                className: 'border-border/60'
              },
              {
                title: 'packages.eShop.title',
                description: 'packages.eShop.description',
                badge: 'Business',
                features: 'packages.eShop.features',
                package: 'e-shop',
                className: 'border-primary/30 ring-1 ring-primary/30 bg-primary/5'
              },
              {
                title: 'packages.customApp.title',
                description: 'packages.customApp.description',
                badge: 'Premium',
                features: 'packages.customApp.features',
                package: 'custom-app',
                className: 'border-border/60',
              }
            ].map((pkg, index) => (
              <motion.div
                key={index}
                ref={packageCardRefs[index]}
                {...useMobileCardAnimation(packageCardRefs[index], index)}
                className="md:transform-none w-full"
              >
                <Card className={`relative flex flex-col hover:shadow-lg transition-all duration-300 h-full bg-card/70 hover:bg-card/70 ${pkg.className}`}>
                  <CardHeader className="flex-none">
                    <div className="flex items-center justify-between">
                      <CardTitle>{t(pkg.title)}</CardTitle>
                      <Badge variant="secondary" className="rounded-full">{pkg.badge}</Badge>
                    </div>
                    <CardDescription>{t(pkg.description)}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="text-lg font-semibold"> {t('packages.getQuote')}</div>
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
                    <Button className="w-full" onClick={() => {
                      trackEvent('packageSelected', {
                        package: pkg.package
                      });
                      navigate(`/get-started?package=${pkg.package}`);
                    }}>{t('packages.getStarted')}</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {t('packages.footer')}
          </p>

          {/* FAQ Section */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-center mb-8">{t('packages.faq.title')}</h3>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="hosting">
                <AccordionTrigger>{t('packages.faq.items.hosting.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.hosting.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="googleBusiness">
                <AccordionTrigger>{t('packages.faq.items.googleBusiness.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.googleBusiness.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="eshopPlatforms">
                <AccordionTrigger>{t('packages.faq.items.eshopPlatforms.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.eshopPlatforms.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="customization">
                <AccordionTrigger>{t('packages.faq.items.customization.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.customization.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hiddenFees">
                <AccordionTrigger>{t('packages.faq.items.hiddenFees.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.hiddenFees.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timeToLaunch">
                <AccordionTrigger>{t('packages.faq.items.timeToLaunch.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.timeToLaunch.answer')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </motion.section>

      {/* Portfolio Section */}
      <motion.section 
        ref={portfolioRef}
        id="portfolio" 
        className="py-20 bg-card/70 scroll-mt-10 overflow-hidden"
        {...(portfolioAnimation as HTMLMotionProps<"section">)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('portfolio.title')}</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {portfolioItems.map((item, index) => (
              <motion.div
                key={index}
                ref={portfolioCardRefs[index]}
                {...useMobileCardAnimation(portfolioCardRefs[index], index)}
                className="md:transform-none w-full"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 pt-0 h-full flex flex-col w-full bg-card/70 hover:bg-card/70">
                  <div className={`h-48 ${item.bgColor} flex items-center justify-center flex-none`}>
                    <h3 className={`text-4xl font-bold ${item.textColor}`}>
                      {t(`portfolio.items.${item.key}.title`)}
                    </h3>
                  </div>
                  <CardHeader className="pt-0 flex-none">
                    <CardTitle>{t(`portfolio.items.${item.key}.title`)}</CardTitle>
                    <CardDescription>{t(`portfolio.items.${item.key}.description`)}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        ref={contactRef}
        id="contact" 
        className="py-20 scroll-mt-10 overflow-hidden"
        {...(contactAnimation as HTMLMotionProps<"section">)}>
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
    </Layout>
  )
}

export default HomePage 