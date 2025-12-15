import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Bars3Icon as Menu,
  HomeIcon,
  UserIcon,
  Cog6ToothIcon as Settings,
  BriefcaseIcon,
  EnvelopeIcon as Mail,
} from "@heroicons/react/24/outline"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "./LanguageSwitcher"

const Header = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
    navigate('/#' + sectionId)
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-sm border-b' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/#home">
            <div className="flex items-center space-x-2">
              <img 
                src="/images/logo-glass.png" 
                alt="Stanimeros Logo" 
                className="h-12 w-12"
              />
              <div className="text-2xl font-bold">Stanimeros</div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-6 mr-6">
              <Button variant="ghost" onClick={() => handleScrollToSection('home')} className="cursor-pointer">
                {t('nav.home')}
              </Button>
              <Button variant="ghost" onClick={() => handleScrollToSection('about')} className="cursor-pointer">
                {t('nav.about')}
              </Button>
              <Button variant="ghost" onClick={() => handleScrollToSection('services')} className="cursor-pointer">
                {t('nav.services')}
              </Button>
              <Button variant="ghost" onClick={() => handleScrollToSection('portfolio')} className="cursor-pointer">
                {t('nav.portfolio')}
              </Button>
              <Button variant="ghost" onClick={() => handleScrollToSection('contact')} className="cursor-pointer">
                {t('nav.contact')}
              </Button>
              {/* <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={`bg-transparent`}
                    >{t('nav.tools')}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[400px]">
                        <Link to="/tools/qr-code" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('tools.qrcode.title')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('tools.qrcode.description')}
                          </p>
                        </Link>
                        <Link to="/tools/image-converter" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('tools.imageConverter.title')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('tools.imageConverter.description')}
                          </p>
                        </Link>
                        <Link to="/tools/video-compressor" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">{t('tools.videoCompressor.title')}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {t('tools.videoCompressor.description')}
                          </p>
                        </Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu> */}
            </div>
            <div className="border-l border-border/60 pl-6">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-2 md:hidden">
            <LanguageSwitcher variant="compact" />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col space-y-2 mt-2">
                <Button variant="ghost" onClick={() => handleScrollToSection('home')} className="justify-start cursor-pointer">
                  <HomeIcon className="h-4 w-4 mr-3" />
                  {t('nav.home')}
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('about')} className="justify-start cursor-pointer">
                  <UserIcon className="h-4 w-4 mr-3" />
                  {t('nav.about')}
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('services')} className="justify-start cursor-pointer">
                  <Settings className="h-4 w-4 mr-3" />
                  {t('nav.services')}
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('portfolio')} className="justify-start cursor-pointer">
                  <BriefcaseIcon className="h-4 w-4 mr-3" />
                  {t('nav.portfolio')}
                </Button>
                <Button variant="ghost" onClick={() => handleScrollToSection('contact')} className="justify-start cursor-pointer">
                  <Mail className="h-4 w-4 mr-3" />
                  {t('nav.contact')}
                </Button>
                {/* <NavigationMenu className="w-full">
                  <NavigationMenuList>
                    <NavigationMenuItem className="w-full">
                      <NavigationMenuTrigger className="w-full bg-transparent justify-start">
                        <Tools className="h-4 w-4 mr-3" />
                        {t('nav.tools')}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="grid gap-3 p-4 w-[300px]">
                          <Link to="/tools/qr-code" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">{t('tools.qrcode.title')}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t('tools.qrcode.description')}
                            </p>
                          </Link>
                          <Link to="/tools/image-converter" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">{t('tools.imageConverter.title')}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t('tools.imageConverter.description')}
                            </p>
                          </Link>
                          <Link to="/tools/video-compressor" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">{t('tools.videoCompressor.title')}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {t('tools.videoCompressor.description')}
                            </p>
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu> */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
    </nav>
  )
}

export default Header 