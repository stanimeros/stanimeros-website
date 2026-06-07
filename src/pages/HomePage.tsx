import { useEffect, useRef } from "react"
import { Helmet } from "react-helmet-async"
import { useTranslation } from "react-i18next"
import "../i18n"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, useScroll, useTransform, useSpring, type HTMLMotionProps } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PortfolioCard } from "@/components/PortfolioCard"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  EnvelopeIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  LightBulbIcon,
  BuildingStorefrontIcon,
  CursorArrowRaysIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CubeTransparentIcon,
  QuestionMarkCircleIcon,
  PhoneIcon,
  BoltIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline"
import GitHubCalendarComponent from "@/components/GitHubCalendar"
import WhySection from "@/components/WhySection"
import UnderlineHighlight from "@/components/UnderlineHighlight"
import { trackEvent } from "@/lib/events"
import { useScrollAnimation, useMobileCardAnimation } from "@/lib/hooks"
import { FacebookIcon, InstagramIcon, LinkedinIcon, GithubIcon, BriefcaseIcon } from "lucide-react"
import Layout from "@/components/Layout"

const HomePage = () => {
  const { t, i18n } = useTranslation()
  const isGreek = i18n.language === 'el'
  const location = useLocation()
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
  const serviceCardRefs = Array(5).fill(null).map(() => useRef<HTMLDivElement>(null))
  const packageCardRefs = Array(3).fill(null).map(() => useRef<HTMLDivElement>(null))
  const portfolioCardRefs = Array(16).fill(null).map(() => useRef<HTMLDivElement>(null))
  
  // Get animation props for each section
  const aboutAnimation = useScrollAnimation(aboutRef)
  const servicesAnimation = useScrollAnimation(servicesRef)
  const packagesAnimation = useScrollAnimation(packagesRef)
  const portfolioAnimation = useScrollAnimation(portfolioRef)
  const contactAnimation = useScrollAnimation(contactRef)
  
  const navigate = useNavigate()

  const goToContact = (source: string, pkg?: string) => {
    trackEvent('ctaClick', { source, package: pkg ?? null })
    const params = new URLSearchParams({ source })
    if (pkg) params.set("package", pkg)
    navigate(`/contact?${params.toString()}`)
  }

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


  const portfolioItems = [
    {
      key: 'irisdrop',
      technologies: ["SaaS", "Web App", "Print Shops", "File Upload", "Queue", "Admin"],
      bgColor: "bg-cyan-900/30",
      textColor: "text-cyan-200",
      bgImage: "/assets/portfolio/irisdrop.jpg",
      logo: "/assets/logos/irisdrop.png",
      url: "https://irisdrop.web.app"
    },
    {
      key: 'athensMytransfer',
      technologies: ["Landing Page", "Transfers", "Athens", "Tourism", "Bookings", "Transport"],
      bgColor: "bg-sky-900/30",
      textColor: "text-sky-200",
      bgImage: "/assets/portfolio/athens-mytransfer.jpg",
      logo: "/assets/logos/athens-mytransfer.png",
      url: "https://athens-mytransfer.web.app"
    },
    {
      key: 'veridictum',
      technologies: ["Website", "AI", "LLM", "Legal Tech", "Document Analysis", "Automation"],
      bgColor: "bg-indigo-900/30",
      textColor: "text-indigo-200",
      bgImage: "/assets/portfolio/veridictum.jpg",
      url: "https://veridictum.ai/"
    },
    {
      key: 'process',
      technologies: ["Website", "Production Monitoring", "Manufacturing", "Real-time", "Dashboard", "Analytics"],
      bgColor: "bg-amber-900/30",
      textColor: "text-amber-200",
      bgImage: "/assets/portfolio/process.jpg",
      url: "https://process-a7a0f.web.app/"
    },
    {
      key: 'skiGreece',
      technologies: ["Website", "Ski Centers", "Travel", "Winter Sports", "Resort Info", "Maps"],
      bgColor: "bg-slate-900/30",
      textColor: "text-slate-200",
      bgImage: "/assets/portfolio/ski-greece.jpg",
      logo: "/assets/logos/ski-greece.png",
      url: "https://ski-greece.gr/"
    },
    {
      key: 'nikiMargariti',
      technologies: ["Website", "AI", "Chatbot", "Education", "Students", "Academic"],
      bgColor: "bg-violet-900/30",
      textColor: "text-violet-200",
      bgImage: "/assets/portfolio/niki-margariti.jpg",
      url: "https://ai.nikimargariti.gr/chats"
    },
    {
      key: 'fireMessage',
      technologies: ["iOS", "Android", "Mobile App", "Push Notifications", "Monetization"],
      bgColor: "bg-red-900/30",
      textColor: "text-red-200",
      bgImage: "/assets/portfolio/fire-message.jpg",
      logo: "/assets/logos/fire-message.png"
    },
    {
      key: 'tattooHealer',
      technologies: ["Web App", "iOS", "Android", "Push Notifications", "Admin Panel", "Education"],
      bgColor: "bg-purple-900/30",
      textColor: "text-purple-200",
      bgImage: "/assets/portfolio/tattoo-healer.jpg",
      logo: "/assets/logos/tattoo-healer.png",
      url: "https://tattoo-healer.com"
    },
    {
      key: 'transHellas',
      technologies: ["Web App", "Parcel Management", "Admin Panel", "Tracking System", "Logistics", "Germany-Greece"],
      bgColor: "bg-blue-900/30",
      textColor: "text-blue-200",
      bgImage: "/assets/portfolio/trans-hellas.jpg",
      logo: "/assets/logos/trans-hellas.jpg",
      url: "https://thr.topaketo.de"
    },
    {
      key: 'etui',
      technologies: ["Website", "E-commerce", "Luxury Packaging", "Jewelry", "Customization", "B2B"],
      bgColor: "bg-amber-900/30",
      textColor: "text-amber-200",
      bgImage: "/assets/portfolio/etui.jpg",
      logo: "/assets/logos/etui.png",
      logoBg: "bg-[#faf9f7]",
      url: "https://etuicreations.de/"
    },
    {
      key: 'ridefast',
      technologies: ["Web App", "Maps", "Payments", "Bookings", "Real-time", "Taxi & Transfers"],
      bgColor: "bg-gray-900/30",
      textColor: "text-gray-200",
      bgImage: "/assets/portfolio/ridefast.jpg",
      logo: "/assets/logos/ridefast.png"
    },
    {
      key: 'atproPartner',
      technologies: ["iOS", "Android", "Web App", "Push Notifications", "Bookings", "Transport"],
      bgColor: "bg-sky-900/30",
      textColor: "text-sky-200",
      bgImage: "/assets/portfolio/atpro-partner.jpg",
      logo: "/assets/logos/atpro-partner.png"
    },
    {
      key: 'mealAi',
      technologies: ["iOS", "Android", "AI", "Computer Vision", "Mobile App", "Nutrition"],
      bgColor: "bg-blue-900/30",
      textColor: "text-blue-200",
      bgImage: "/assets/portfolio/meal-ai.jpg",
      logo: "/assets/logos/meal-ai.png"
    },
    {
      key: 'near',
      technologies: ["iOS", "Android", "Mobile App", "Maps", "AI", "Privacy-focused"],
      bgColor: "bg-orange-900/30",
      textColor: "text-orange-200",
      bgImage: "/assets/portfolio/near.jpg",
      logo: "/assets/logos/near.png"
    },
    {
      key: 'hedeos',
      technologies: ["iOS", "Android", "Education", "Quizzes", "Mobile App", "Language Learning"],
      bgColor: "bg-yellow-900/30",
      textColor: "text-yellow-200",
      bgImage: "/assets/portfolio/hedeos.jpg",
      logo: "/assets/logos/hedeos.png",
      url: "https://hedeos.gr"
    },
    {
      key: 'ekarotsi',
      technologies: ["Website", "E-commerce", "Supermarket", "Online Ordering", "Delivery", "Inventory"],
      bgColor: "bg-green-900/30",
      textColor: "text-green-200",
      bgImage: "/assets/portfolio/ekarotsi.jpg",
      logo: "/assets/logos/e-karotsi.png",
      url: "https://e-karotsi.gr"
    }
  ]

  return (
    <Layout>
      <Helmet>
        <html lang={isGreek ? 'el' : 'en'} />
        <title>{isGreek
          ? 'Κατασκευή Εφαρμογών & AI Αυτοματισμοί | Pantelis Stanimeros'
          : 'AI Automation & App Development | Pantelis Stanimeros'}
        </title>
        <meta name="description" content={isGreek
          ? 'Ανάπτυξη AI agents, mobile εφαρμογών και αυτοματισμών για επιχειρήσεις στη Θεσσαλονίκη και σε όλη την Ελλάδα. Δωρεάν αρχική συνάντηση.'
          : 'Freelance software engineer in Thessaloniki, Greece. I build AI agents, mobile apps, and custom automations that save businesses time and money. Free strategy call.'}
        />
        <meta name="keywords" content={isGreek
          ? 'κατασκευή εφαρμογών Θεσσαλονίκη, AI αυτοματισμοί επιχειρήσεων, ανάπτυξη mobile εφαρμογών Ελλάδα, κατασκευή eshop, AI agents, freelance developer Ελλάδα'
          : 'AI automation Greece, freelance software engineer Thessaloniki, mobile app development Greece, custom web app developer, AI agents for business, Pantelis Stanimeros'}
        />
        <link rel="canonical" href={isGreek ? 'https://stanimeros.com/el' : 'https://stanimeros.com/en'} />
        <link rel="alternate" hrefLang="en" href="https://stanimeros.com/en" />
        <link rel="alternate" hrefLang="el" href="https://stanimeros.com/el" />
        <link rel="alternate" hrefLang="x-default" href="https://stanimeros.com/" />
        <meta property="og:title" content={isGreek
          ? 'Κατασκευή Εφαρμογών & AI Αυτοματισμοί | Pantelis Stanimeros'
          : 'AI Automation & App Development | Pantelis Stanimeros'}
        />
        <meta property="og:description" content={isGreek
          ? 'Ανάπτυξη AI agents, mobile εφαρμογών και αυτοματισμών για επιχειρήσεις στη Θεσσαλονίκη και σε όλη την Ελλάδα.'
          : 'Freelance software engineer in Thessaloniki, Greece. AI agents, mobile apps, and custom automations for businesses.'}
        />
        <meta property="og:url" content={isGreek ? 'https://stanimeros.com/el' : 'https://stanimeros.com/en'} />
        <meta property="og:locale" content={isGreek ? 'el_GR' : 'en_US'} />
        <meta property="og:locale:alternate" content={isGreek ? 'en_US' : 'el_GR'} />
      </Helmet>
      {/* Hero Section */}
      <section id="home" className="min-h-svh flex items-center justify-center relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative z-20">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-20">
            {t('hero.subtitleBefore')}
            <UnderlineHighlight key={i18n.language}>{t('hero.subtitleHighlight')}</UnderlineHighlight>
            {t('hero.subtitleAfter')}
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
            <h2 className="text-4xl font-bold mb-4 text-center">
              <UserIcon className="inline h-8 w-8 text-primary mr-3 align-text-bottom" />
              {t('about.title')}
            </h2>
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
                <Badge variant="secondary">Web App</Badge>
                <Badge variant="secondary">Mobile App</Badge>
                <Badge variant="secondary">Website</Badge>
                <Badge variant="secondary">E-commerce</Badge>
                <Badge variant="secondary">AI</Badge>
                <Badge variant="secondary">Maps</Badge>
                <Badge variant="secondary">Cloud</Badge>
                <Badge variant="secondary">Cross-platform</Badge>
                <Badge variant="secondary">Payments</Badge>
                <Badge variant="secondary">Education</Badge>
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

      <WhySection />

      {/* Services Section */}
      <motion.section
        ref={servicesRef}
        id="services" 
        className="p-10 pb-20 scroll-mt-10 overflow-hidden"
        {...(servicesAnimation as HTMLMotionProps<"section">)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-center">
              <WrenchScrewdriverIcon className="inline h-8 w-8 text-primary mr-3 align-text-bottom" />
              {t('services.title')}
            </h2>
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
                icon: <ChatBubbleLeftRightIcon className="h-8 w-8" />,
                title: 'services.aiAgent.title',
                description: 'services.aiAgent.description'
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
                    <CardTitle>
                      {t(service.title)}
                    </CardTitle>
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
            <h2 className="text-4xl font-bold mb-4 text-center">
              <CubeTransparentIcon className="inline h-8 w-8 text-primary mr-3 align-text-bottom" />
              {t('packages.title')}
            </h2>
            <Separator className="w-24 mx-auto" />
            <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
              {t('packages.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 w-full">
            {[
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
                    <Button
                      className="w-full h-13 px-8 text-base bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(74,222,128,0.35)] hover:shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-all duration-300"
                      onClick={() => goToContact('package-button', t(pkg.title))}
                    >
                      {pkg.ctaIcon}
                      {t('packages.getStarted')}
                    </Button>
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
            <h3 className="text-2xl font-semibold text-center mb-8 flex items-center justify-center gap-2">
              <QuestionMarkCircleIcon className="h-6 w-6 text-primary shrink-0" />
              {t('packages.faq.title')}
            </h3>
            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="hosting">
                <AccordionTrigger className="text-lg">{t('packages.faq.items.hosting.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.hosting.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="googleBusiness">
                <AccordionTrigger className="text-lg">{t('packages.faq.items.googleBusiness.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.googleBusiness.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="eshopPlatforms">
                <AccordionTrigger className="text-lg">{t('packages.faq.items.eshopPlatforms.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.eshopPlatforms.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="customization">
                <AccordionTrigger className="text-lg">{t('packages.faq.items.customization.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.customization.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hiddenFees">
                <AccordionTrigger className="text-lg">{t('packages.faq.items.hiddenFees.question')}</AccordionTrigger>
                <AccordionContent>
                  {t('packages.faq.items.hiddenFees.answer')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timeToLaunch">
                <AccordionTrigger className="text-lg">{t('packages.faq.items.timeToLaunch.question')}</AccordionTrigger>
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
            <h2 className="text-4xl font-bold mb-4 text-center">
              <BriefcaseIcon className="inline h-8 w-8 text-primary mr-3 align-text-bottom" />
              {t('portfolio.title')}
            </h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {portfolioItems.map((item, index) => (
              <motion.div
                key={item.key}
                ref={portfolioCardRefs[index]}
                {...useMobileCardAnimation(portfolioCardRefs[index], index)}
                className="md:transform-none w-full"
              >
                <PortfolioCard
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
            <h2 className="text-4xl font-bold mb-4 text-center">
              <PhoneIcon className="inline h-8 w-8 text-primary mr-3 align-text-bottom" />
              {t('contact.title')}
            </h2>
            <Separator className="w-24 mx-auto mb-4" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('contact.description')}
            </p>
          </div>
          <div className="flex flex-col items-center gap-12 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 w-full">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-card/70 border border-border/60">
                <div className="mt-1 shrink-0">
                  <ClockIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{t('contact.features.consultation.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.features.consultation.description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-card/70 border border-border/60">
                <div className="mt-1 shrink-0">
                  <CursorArrowRaysIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{t('contact.features.solutions.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.features.solutions.description')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-card/70 border border-border/60">
                <div className="mt-1 shrink-0">
                  <SparklesIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{t('contact.features.noObligations.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('contact.features.noObligations.description')}</p>
                </div>
              </div>
            </div>

            <Button
              className="!px-[100px] h-14 text-base bg-green-500 hover:bg-green-400 text-white shadow-[0_0_24px_rgba(74,222,128,0.4)] hover:shadow-[0_0_40px_rgba(74,222,128,0.33)] transition-all duration-300"
              onClick={() => goToContact('contact-section')}
            >
              <CalendarDaysIcon className="h-6 w-6 mr-2 stroke-[1.5]" />
              {t('contact.form.send')}
            </Button>

            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-primary" />
                  <a href="mailto:hello@stanimeros.com" className="hover:text-primary transition-colors">
                    hello@stanimeros.com
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-4 w-4 text-primary" />
                  <span>Thessaloniki, Greece</span>
                </div>
              </div>
              <div className="flex space-x-3">
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