import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Link } from "react-router-dom"

interface HeaderProps {
  onScrollToSection: (sectionId: string) => void
}

const Header = ({ onScrollToSection }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScrollToSection = (sectionId: string) => {
    onScrollToSection(sectionId)
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/#">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/logo-white.png" 
                alt="Stanimeros Logo" 
                className="h-8 w-8"
              />
              <div className="text-2xl font-bold">Stanimeros</div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Button variant="ghost" onClick={() => handleScrollToSection('home')} className="cursor-pointer">
              Home
            </Button>
            <Button variant="ghost" onClick={() => handleScrollToSection('about')} className="cursor-pointer">
              About
            </Button>
            <Button variant="ghost" onClick={() => handleScrollToSection('services')} className="cursor-pointer">
              Services
            </Button>
            <Button variant="ghost" onClick={() => handleScrollToSection('portfolio')} className="cursor-pointer">
              Portfolio
            </Button>
            <Button variant="ghost" onClick={() => handleScrollToSection('contact')} className="cursor-pointer">
              Contact
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-2 mt-8">
                <Button variant="ghost" onClick={() => handleScrollToSection('home')} className="justify-start cursor-pointer">
                  Home
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('about')} className="justify-start cursor-pointer">
                  About
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('services')} className="justify-start cursor-pointer">
                  Services
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('portfolio')} className="justify-start cursor-pointer">
                  Portfolio
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('contact')} className="justify-start cursor-pointer">
                  Contact
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

export default Header 