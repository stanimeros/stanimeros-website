import { useTranslation } from "react-i18next"
import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { trackEvent } from "@/lib/events"

const CONTACT_EMAIL = "hello@stanimeros.com"
const PHONE_INTL = "306980911668"

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03z" />
    </svg>
  )
}

interface ContactChannelsProps {
  className?: string
  hideEmail?: boolean
}

export function ContactChannels({ className, hideEmail }: ContactChannelsProps) {
  const { t } = useTranslation()

  return (
    <div className={className}>
      {!hideEmail && (
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          onClick={() => trackEvent("ctaClick", { source: "contact-channel-email" })}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium bg-background hover:bg-accent transition-colors"
        >
          <EnvelopeIcon className="h-4 w-4" />
          {t("contact.channels.email")}
        </a>
      )}
      <a
        href={`https://wa.me/${PHONE_INTL}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("ctaClick", { source: "contact-channel-whatsapp" })}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium bg-background hover:bg-accent transition-colors"
      >
        <WhatsAppIcon className="h-4 w-4" />
        {t("contact.channels.whatsapp")}
      </a>
      <a
        href={`viber://chat?number=%2B${PHONE_INTL}`}
        onClick={() => trackEvent("ctaClick", { source: "contact-channel-viber" })}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium bg-background hover:bg-accent transition-colors"
      >
        <ViberIcon className="h-4 w-4" />
        {t("contact.channels.viber")}
      </a>
    </div>
  )
}
