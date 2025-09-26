import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import Layout from '@/components/Layout'
import ContactSection from '@/components/ContactSection'
import { trackEvent } from '@/lib/events'

export default function QRCodeGenerator() {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [qrSize, setQrSize] = useState(500)

  useEffect(() => {
    scrollTo(0, 0)
    trackEvent('pageView', {
      page: 'qr-code-generator'
    });
  }, [])

  const handleDownload = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = qrSize
      canvas.height = qrSize
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      
      const downloadLink = document.createElement('a')
      downloadLink.download = 'qr-code.png'
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('tools.qrcode.title')}</h1>
        <p className="text-lg text-center mb-8">{t('tools.qrcode.description')}</p>

        <div className="max-w-xl mx-auto">
          <Card className="p-6 bg-card/70 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">{t('tools.qrcode.urlLabel')}</Label>
                <Input
                  id="url"
                  type="text"
                  placeholder={t('tools.qrcode.urlPlaceholder')}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="size">{t('tools.qrcode.sizeLabel')}</Label>
                  <span className="text-sm text-muted-foreground">{qrSize}px</span>
                </div>
                <Slider
                  id="size"
                  min={200}
                  max={2000}
                  step={100}
                  value={[qrSize]}
                  onValueChange={([value]) => setQrSize(value)}
                  className="w-full"
                />
              </div>

            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG
                  id="qr-code"
                  value={url}
                  size={300}
                  marginSize={1}
                  level="H"
                />
              </div>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full"
            >
              {t('tools.qrcode.downloadButton')}
            </Button>
            </div>
          </Card>
        </div>
      </div>
      <ContactSection />
    </Layout>
  )
}
