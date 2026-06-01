import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaperAirplaneIcon } from "@heroicons/react/24/outline"
import { sendEmail } from "@/lib/firebase"
import { trackEvent } from "@/lib/events"

const PACKAGE_LABELS: Record<string, string> = {
  'online-presence': 'AI Agents & Automation',
  'e-shop': 'Apps & Dashboards',
  'custom-app': 'Optimization & AI',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: string
  packageContext?: string
}

export default function ContactModal({ open, onOpenChange, source, packageContext }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")

  const reset = () => {
    setName("")
    setEmail("")
    setPhone("")
    setStatus("idle")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setStatus("idle")

    const packageLabel = packageContext ? (PACKAGE_LABELS[packageContext] ?? packageContext) : undefined

    const lines = [
      `Source: ${source}`,
      ...(packageLabel ? [`Package: ${packageLabel}`] : []),
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      ...(phone ? [`Phone: ${phone}`] : []),
    ]

    try {
      await sendEmail({
        subject: packageLabel ? `Service Inquiry - ${packageLabel}` : "Free Strategy Call Request",
        name,
        email,
        message: lines.join("\n"),
      })

      trackEvent('beginCheckout', {
        package: packageContext ?? source,
        value: 0,
        currency: 'EUR',
      })

      setStatus("success")
      reset()
      setTimeout(() => {
        setStatus("idle")
        onOpenChange(false)
      }, 3000)
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('contact.modalTitle')}</DialogTitle>
          <DialogDescription>{t('contact.form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="modal-name">{t('contact.form.name')}</Label>
            <Input
              id="modal-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('contact.form.namePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-email">{t('contact.form.email')}</Label>
            <Input
              id="modal-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('contact.form.emailPlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-phone">{t('getStarted.contactDetails.phone')}</Label>
            <Input
              id="modal-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+30 69X XXX XXXX"
            />
          </div>

          {status === "success" && (
            <div className="p-3 bg-green-950/30 border border-green-800/50 text-green-300 rounded text-sm">
              {t('contact.form.success')}
            </div>
          )}
          {status === "error" && (
            <div className="p-3 bg-red-950/30 border border-red-800/50 text-red-300 rounded text-sm">
              {t('contact.form.error')}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                {t('contact.form.sending')}
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                {t('contact.form.send')}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
