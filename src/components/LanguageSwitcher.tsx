import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'el' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="font-medium"
    >
      {i18n.language === 'en' ? 'ΕΛ' : 'EN'}
    </Button>
  )
}

export default LanguageSwitcher
