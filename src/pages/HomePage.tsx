import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Mail, MapPin, Github, Linkedin, Twitter, Send, Code, Palette, Smartphone, Database } from "lucide-react"
import Footer from "@/components/Footer"
import { sendEmail } from "@/lib/firebase"

const HomePage = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      description: "A modern ride-sharing platform connecting drivers and passengers with real-time tracking and secure payments",
      technologies: ["React Native", "Node.js", "MongoDB", "Socket.io"],
      bgColor: "bg-gray-800",
      textColor: "text-gray-100"
    },
    {
      title: "TapFast",
      description: "Quick and efficient food delivery service with instant order processing and real-time delivery tracking",
      technologies: ["React", "Express.js", "PostgreSQL", "Redis"],
      bgColor: "bg-orange-900/50",
      textColor: "text-orange-100"
    },
    {
      title: "Meal AI",
      description: "AI-powered meal planning and recipe recommendation system with personalized nutrition insights",
      technologies: ["Python", "TensorFlow", "React", "FastAPI"],
      bgColor: "bg-green-900/50",
      textColor: "text-green-100"
    },
    {
      title: "Reserwave",
      description: "Advanced restaurant reservation and table management system with dynamic pricing and analytics",
      technologies: ["Vue.js", "Laravel", "MySQL", "WebSockets"],
      bgColor: "bg-blue-900/50",
      textColor: "text-blue-100"
    },
    {
      title: "Near",
      description: "Location-based social networking app helping users discover and connect with people nearby",
      technologies: ["React Native", "Firebase", "Google Maps API", "TypeScript"],
      bgColor: "bg-purple-900/50",
      textColor: "text-purple-100"
    },
    {
      title: "Hedeos",
      description: "Comprehensive healthcare management platform for clinics and medical professionals",
      technologies: ["Angular", "Spring Boot", "PostgreSQL", "Docker"],
      bgColor: "bg-red-900/50",
      textColor: "text-red-100"
    },
    {
      title: "e-karotsi",
      description: "Digital marketplace for local farmers and consumers with secure payment processing and delivery tracking",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      bgColor: "bg-yellow-900/50",
      textColor: "text-yellow-100"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">Stanimeros</div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" onClick={() => scrollToSection('home')} className="cursor-pointer">
                Home
              </Button>
              <Button variant="ghost" onClick={() => scrollToSection('about')} className="cursor-pointer">
                About
              </Button>
              <Button variant="ghost" onClick={() => scrollToSection('services')} className="cursor-pointer">
                Services
              </Button>
              <Button variant="ghost" onClick={() => scrollToSection('portfolio')} className="cursor-pointer">
                Portfolio
              </Button>
              <Button variant="ghost" onClick={() => scrollToSection('contact')} className="cursor-pointer">
                Contact
              </Button>
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-2 mt-8">
                  <Button variant="ghost" onClick={() => scrollToSection('home')} className="justify-start cursor-pointer">
                    Home
                  </Button>
                  <Button variant="ghost" onClick={() => scrollToSection('about')} className="justify-start cursor-pointer">
                    About
                  </Button>
                  <Button variant="ghost" onClick={() => scrollToSection('services')} className="justify-start cursor-pointer">
                    Services
                  </Button>
                  <Button variant="ghost" onClick={() => scrollToSection('portfolio')} className="justify-start cursor-pointer">
                    Portfolio
                  </Button>
                  <Button variant="ghost" onClick={() => scrollToSection('contact')} className="justify-start cursor-pointer">
                    Contact
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Stanimeros
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Full-stack developer passionate about creating innovative digital solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => scrollToSection('portfolio')}>
              View My Work
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollToSection('contact')}>
              Get In Touch
            </Button>
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
                My expertise spans across modern web technologies, mobile development, and cloud solutions. 
                I believe in writing clean, maintainable code and creating exceptional user experiences.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Node.js</Badge>
                <Badge variant="secondary">Python</Badge>
                <Badge variant="secondary">AWS</Badge>
                <Badge variant="secondary">Docker</Badge>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 rounded-lg overflow-hidden">
                <img 
                  src="/images/pantelis.jpg" 
                  alt="Pantelis Stanimeros"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
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

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Portfolio</h2>
            <Separator className="w-24 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
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
                <Link to="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Github className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Twitter className="h-5 w-5" />
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
                    placeholder="your.email@example.com" 
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
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    Message sent successfully! I'll get back to you soon.
                  </div>
                )}
                
                {submitStatus === "error" && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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