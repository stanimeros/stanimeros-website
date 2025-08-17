import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const Footer = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-muted-foreground">
            {`© ${currentYear} ${t('footer.copyright')}`}
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
              {t('footer.links.privacy')}
            </Link>
            <Link to="/data-deletion" className="text-muted-foreground hover:text-primary transition-colors">
              {t('footer.links.dataDeletion')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 