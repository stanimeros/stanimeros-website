import { Button } from "@/components/ui/button"
import { GlobeAltIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact'
}

const LanguageSwitcher = ({ variant = 'default' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'el' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <Button 
      variant={variant === 'compact' ? 'outline' : 'ghost'} 
      onClick={toggleLanguage} 
      className={`cursor-pointer ${variant === 'compact' ? 'px-2 h-8 text-xs' : 'justify-start'}`}
      size={variant === 'compact' ? 'sm' : 'default'}
    >
      <GlobeAltIcon className={`h-4 w-4 ${variant === 'compact' ? 'mr-1' : 'mr-3'}`} />
      {variant === 'compact' 
        ? i18n.language === 'en' ? 'EL' : 'EN'
        : i18n.language === 'en' ? 'Αλλαγή στα Ελληνικά' : 'Switch to English'
      }
    </Button>
  )
}

export default LanguageSwitcher
