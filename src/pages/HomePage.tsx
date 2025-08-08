import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MapPin, Github, Linkedin, Send, Code, Palette, Smartphone, Database, Instagram, Check, Star } from "lucide-react"
import Footer from "@/components/Footer"
import { sendEmail } from "@/lib/firebase"
import GitHubCalendarComponent from "@/components/GitHubCalendar"
import Header from "@/components/Header"

const HomePage = () => {
  const location = useLocation()
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

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
        subject: "New Contact Form Submission",
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message
      })
      
      console.log("Email sent successfully:", result)
      setSubmitStatus("success")
      setContactForm({ name: "", email: "", message: "" })
      
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

  const services = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Web Development",
      description: "Modern, responsive websites and web applications built with cutting-edge technologies."
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Development",
      description: "Native and cross-platform mobile applications for iOS and Android."
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Backend Development",
      description: "Robust server-side solutions and API development with scalable architectures."
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "UI/UX Design",
      description: "Beautiful and intuitive user interfaces with exceptional user experiences."
    }
  ]

            const portfolioItems = [
            {
              title: "RideFast",
              description: "Comprehensive reservation management system for transfer companies and taxi services, featuring real-time booking, scheduling, and payment processing with integrated mapping and notification systems",
              technologies: ["React", "TypeScript", "Google Maps", "Firestore", "Resend", "Stripe API"],
              bgColor: "bg-gray-900/30",
              textColor: "text-gray-200"
            },
            {
              title: "MP-Transfer",
              description: "Enterprise-grade appointment management system for transportation companies and hotels, facilitating seamless transfer scheduling, real-time updates, and comprehensive booking administration",
              technologies: ["iOS", "Android", "Web", "Flutter", "Push Notifications", "Firestore"],
              bgColor: "bg-sky-900/30",
              textColor: "text-sky-200"
            },
            {
              title: "TapFast",
              description: "Advanced QR code generation and management platform for digital assets including wallet badges, shopping carts, promotional coupons, and loyalty programs with comprehensive admin controls",
              technologies: ["React", "TypeScript", "QR Codes", "Admin Panel"],
              bgColor: "bg-orange-900/30",
              textColor: "text-orange-200"
            },
            {
              title: "Meal AI",
              description: "Intelligent mobile application leveraging computer vision and AI to automatically scan, identify, and count food items for precise nutrition tracking and dietary management",
              technologies: ["Android", "iOS", "AI", "Computer Vision", "Mobile App"],
              bgColor: "bg-blue-900/30",
              textColor: "text-blue-200"
            },
            {
              title: "Near",
              description: "Privacy-focused social networking platform enabling users to share their current location with friends and family while maintaining complete control over data visibility and implementing advanced privacy preservation mechanisms",
              technologies: ["Java", "Python", "Android", "iOS", "Google Maps", "Machine Learning"],
              bgColor: "bg-orange-900/30",
              textColor: "text-orange-200"
            },
            {
              title: "Reserwave",
              description: "Sophisticated booking and discovery platform enabling users to search, compare, and reserve services while providing businesses with comprehensive reservation management tools",
              technologies: ["PHP", "MySQL", "React", "JavaScript", "Search System"],
              bgColor: "bg-cyan-900/30",
              textColor: "text-cyan-200"
            },
            {
              title: "Hedeos",
              description: "Interactive educational mobile application designed to teach Greek language through gamified learning experiences, featuring vocabulary building, interactive quizzes, and progress tracking",
              technologies: ["iOS", "Android", "Education", "Quizzes", "Mobile App"],
              bgColor: "bg-yellow-900/30",
              textColor: "text-yellow-200"
            },
            {
              title: "e-karotsi",
              description: "Full-featured e-commerce platform for Thessaloniki-based Greek supermarket, offering seamless online shopping experience with real-time inventory management and efficient delivery services",
              technologies: ["Web", "E-commerce", "Supermarket", "Online Ordering"],
              bgColor: "bg-green-900/30",
              textColor: "text-green-200"
            }
          ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative z-20">
            Pantelis Stanimeros
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-20">
            Full-stack developer passionate about creating innovative digital solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
            <Button size="lg" onClick={() => scrollToSection('packages')}>
              View Packages
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection('contact')}>
              Get In Touch
            </Button>
          </div>
          {/* Logo positioned behind everything */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 z-0 pointer-events-none">
            <img 
              src="/images/logo-white.png" 
              alt="Stanimeros Logo" 
              className="h-[300%] w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">About Me</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Pantelis Stanimeros</h3>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        I'm a dedicated full-stack developer with a passion for creating innovative digital solutions.
                        With years of experience in web and mobile development, I specialize in building scalable,
                        user-friendly applications that solve real-world problems.
                      </p>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        I hold a Bachelor's degree in Computer Science and am currently pursuing a Master's degree in AI and Data Analytics.
                        My expertise spans across modern web technologies, mobile development, and cloud solutions.
                        I believe in writing clean, maintainable code and creating exceptional user experiences.
                      </p>
              <div className="flex flex-wrap gap-2">
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
            <div className="relative">
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <img 
                  src="/images/pantelis.webp" 
                  alt="Pantelis Stanimeros"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Packages</h2>
            <Separator className="w-24 mx-auto" />
            <p className="text-muted-foreground mt-4 max-w-3xl mx-auto">
              Simple, transparent packages designed for real business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Online Presence */}
            <Card className="relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Online Presence</CardTitle>
                  <Badge variant="secondary" className="rounded-full">Essential</Badge>
                </div>
                <CardDescription>Everything you need to look professional online</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold">€1,200 <span className="text-sm text-muted-foreground">(incl. VAT)</span></div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>One-page website designed for your brand</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Contact form with the fields you need</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Hosting, domain, and custom email setup</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Google Business and Search Console</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>2 Meta campaigns (excluding content)</span></div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button className="w-full" onClick={() => scrollToSection('contact')}>Get Started</Button>
              </div>
            </Card>

            {/* Custom Web App - Most Popular */}
            <Card className="relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-primary/30 ring-1 ring-primary/30 bg-primary/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="rounded-full px-3 py-1 flex items-center gap-1"><Star className="h-3 w-3" /> Most Popular</Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Custom Web App</CardTitle>
                  <Badge variant="secondary" className="rounded-full">Business</Badge>
                </div>
                <CardDescription>Tailored web application built around your workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold">€4,000 <span className="text-sm text-muted-foreground">(incl. VAT)</span></div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Up to 5 pages</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Custom features built for your needs</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Database included</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Optional sign‑in</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Deployment & basic monitoring</span></div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button className="w-full" onClick={() => scrollToSection('contact')}>Request Quote</Button>
              </div>
            </Card>

            {/* Custom Mobile App */}
            <Card className="relative flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-border/60">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Custom Mobile App</CardTitle>
                  <Badge variant="secondary" className="rounded-full">Premium</Badge>
                </div>
                <CardDescription>iOS and Android application, launched properly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold">€10,000 <span className="text-sm text-muted-foreground">(incl. VAT)</span></div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>iOS + Android (up to 10 screens)</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Custom functionality</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Database & sync</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>Optional push notifications</span></div>
                  <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /><span>App Store / Play guidance</span></div>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <Button className="w-full" onClick={() => scrollToSection('contact')}>Book a Call</Button>
              </div>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            We’ll guide you end‑to‑end. Prices may vary for custom requirements.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="p-10 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Services</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 text-primary">
                    {service.icon}
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* GitHub Activity Section */}
      <section className="pb-20 w-full overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">GitHub Activity</h2>
            <Separator className="w-24 mx-auto" />
            <p className="text-muted-foreground mt-4">
              My coding activity and contributions over the past year
            </p>
          </div>
          <div className="mx-auto w-full flex justify-center">
            <GitHubCalendarComponent username="stanimeros" />
          </div>
        </div>
      </section>


      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Portfolio</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 pt-0">
                <div className={`h-48 ${item.bgColor} flex items-center justify-center`}>
                  <h3 className={`text-4xl font-bold ${item.textColor}`}>
                    {item.title}
                  </h3>
                </div>
                <CardHeader className="pt-0">
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Get In Touch</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Let's Work Together</h3>
              <p className="text-muted-foreground mb-8">
                I'm always interested in new opportunities and exciting projects. 
                Whether you have a question or just want to say hi, feel free to reach out!
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <a href="mailto:hello@stanimeros.com" className="hover:text-primary transition-colors">
                    hello@stanimeros.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Thessaloniki, Greece</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <Link to="https://github.com/stanimeros" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Github className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="https://linkedin.com/in/stanimeros" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="https://www.instagram.com/stanimeross_" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Instagram className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    placeholder="Your name" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={contactForm.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    name="message"
                    value={contactForm.message}
                    onChange={handleInputChange}
                    placeholder="Tell me about your project..." 
                    rows={5} 
                    required
                  />
                </div>
                
                {/* Status Messages */}
                {submitStatus === "success" && (
                  <div className="p-3 bg-green-50/20 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 rounded">
                    Message sent successfully! I'll get back to you soon.
                  </div>
                )}
                
                {submitStatus === "error" && (
                  <div className="p-3 bg-red-50/20 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded">
                    Failed to send message. Please try again.
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default HomePage 