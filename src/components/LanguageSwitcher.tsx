import { Button } from "@/components/ui/button"
import { GlobeAltIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'el' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <Button variant="ghost" onClick={toggleLanguage} className="justify-start cursor-pointer">
      <GlobeAltIcon className="h-4 w-4 mr-3" />
      {i18n.language === 'en' ? 'Αλλαγή στα Ελληνικά' : 'Switch to English'}
    </Button>
  )
}

export default LanguageSwitcher
