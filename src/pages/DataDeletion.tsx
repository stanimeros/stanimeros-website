import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  TrashIcon as Trash2,
  ExclamationTriangleIcon as AlertTriangle,
  CheckCircleIcon,
  EnvelopeIcon as Mail,
  ShieldCheckIcon as Shield,
  ClockIcon as Clock
} from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"
import "../i18n"
import { sendEmail } from "@/lib/firebase"
import Layout from "@/components/Layout"
import { trackEvent } from "@/lib/events"

const DataDeletion = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    appName: "",
    reason: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [verifyChecked, setVerifyChecked] = useState(false)
  const [deleteAccount, setDeleteAccount] = useState(false)
  
  useEffect(() => {
    scrollTo(0, 0)
    trackEvent('pageView', {
      page: 'data-deletion'
    });
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const deletionType = deleteAccount ? "Account and Data" : "Data Only"
      const message = `Application: ${formData.appName}\nDeletion Type: ${deletionType}\nReason: ${formData.reason}`
      
      await sendEmail({
        name: formData.name,
        email: formData.email,
        message: message,
        subject: "Data Deletion Request"
      })
      
      setIsLoading(false)
      setIsSubmitted(true)
      
    } catch (error) {
      console.error("Error submitting data deletion request:", error)
      setIsLoading(false)
      // You could add error handling here if needed
      setIsSubmitted(true) // Still show success for UX
    }
  }

  if (isSubmitted) {
    return (
      <Layout>
        {/* Success Content */}
        <main className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">{t('dataDeletion.success.title')}</h1>
            <p className="text-muted-foreground mb-8">
              {t('dataDeletion.success.description')}
            </p>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Clock className="h-5 w-5 mr-2" />
                  {t('dataDeletion.success.whatHappensNext')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(t('dataDeletion.success.steps', { returnObjects: true }) as string[]).map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-muted-foreground text-left">
                      {step}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('dataDeletion.success.needHelp')}{" "}
                  <a href="mailto:hello@stanimeros.com" className="text-primary hover:underline">
                    hello@stanimeros.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Trash2 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t('dataDeletion.title')}</h1>
            <p className="text-muted-foreground">
              {t('dataDeletion.subtitle')}
            </p>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 border-red-200 bg-red-50/20 dark:border-red-800/50 dark:bg-red-950/30">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700 dark:text-red-300">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {t('dataDeletion.importantInformation.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-red-600 dark:text-red-400">
                {(t('dataDeletion.importantInformation.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>



          {/* Deletion Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t('dataDeletion.form.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('dataDeletion.form.fullName')}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('dataDeletion.form.fullNamePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('dataDeletion.form.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('dataDeletion.form.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appName">{t('dataDeletion.form.appName')}</Label>
                  <Input
                    id="appName"
                    name="appName"
                    value={formData.appName}
                    onChange={handleInputChange}
                    placeholder={t('dataDeletion.form.appNamePlaceholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">{t('dataDeletion.form.reason')}</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder={t('dataDeletion.form.reasonPlaceholder')}
                    rows={3}
                    required
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="deleteAccount"
                      checked={deleteAccount}
                      onCheckedChange={(checked) => setDeleteAccount(checked as boolean)}
                    />
                    <Label htmlFor="deleteAccount" className="text-sm cursor-pointer">
                      {t('dataDeletion.form.deleteAccount')}
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="confirm"
                      checked={confirmChecked}
                      onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
                      required
                    />
                    <Label htmlFor="confirm" className="text-sm cursor-pointer">
                      {t('dataDeletion.form.confirm')}
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="verify"
                      checked={verifyChecked}
                      onCheckedChange={(checked) => setVerifyChecked(checked as boolean)}
                      required
                    />
                    <Label htmlFor="verify" className="text-sm cursor-pointer">
                      {t('dataDeletion.form.verify')}
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  disabled={isLoading || !confirmChecked || !verifyChecked || !formData.appName.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('dataDeletion.form.processing')}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('dataDeletion.form.submit')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="text-center mt-8">
            <Separator className="my-8" />
            <p className="text-muted-foreground mb-4">
              {t('dataDeletion.contact.description')}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:hello@stanimeros.com" className="text-primary hover:underline">
                hello@stanimeros.com
              </a>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default DataDeletion 