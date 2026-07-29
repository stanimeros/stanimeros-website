import { useTranslation } from "react-i18next"

const Footer = () => {
  const { t, i18n } = useTranslation()
  const currentYear = new Date().getFullYear()
  const prefix = i18n.language === 'el' ? '/el' : ''

  return (
    <footer className="bg-card py-8 border-t text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-center md:text-left space-y-1">
            <div>{`© ${currentYear} ${t('footer.copyright')}`}</div>
            <div className="text-xs">ELGEMI.183133106000</div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <a href={`${prefix}/privacy-policy`} className="text-muted-foreground hover:text-primary transition-colors">
              {t('footer.links.privacy')}
            </a>
            <a href={`${prefix}/data-deletion`} className="text-muted-foreground hover:text-primary transition-colors">
              {t('footer.links.dataDeletion')}
            </a>
            <a
              href="https://www.pexels.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t('footer.pexels')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 