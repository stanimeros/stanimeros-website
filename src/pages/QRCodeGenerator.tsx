import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
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

const DOWNLOAD_SIZES = [256, 512, 1024, 2048, 4096] as const

export default function QRCodeGenerator() {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')
  const [downloadSizeIndex, setDownloadSizeIndex] = useState(1)
  const downloadSize = DOWNLOAD_SIZES[downloadSizeIndex]
  const PREVIEW_MAX_PX = 500

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
      canvas.width = downloadSize
      canvas.height = downloadSize
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
      <Helmet>
        <title>Free QR Code Generator | Pantelis Stanimeros</title>
        <meta name="description" content="Generate custom QR codes for free — URLs, text, contact info and more. Download in high resolution. No signup required." />
        <link rel="canonical" href="https://stanimeros.com/tools/qr-code" />
        <meta property="og:title" content="Free QR Code Generator | Pantelis Stanimeros" />
        <meta property="og:description" content="Generate custom QR codes for free — URLs, text, contact info and more. Download in high resolution. No signup required." />
        <meta property="og:url" content="https://stanimeros.com/tools/qr-code" />
      </Helmet>
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
                  <span className="text-sm text-muted-foreground">{downloadSize}px</span>
                </div>
                <Slider
                  id="size"
                  min={0}
                  max={DOWNLOAD_SIZES.length - 1}
                  step={1}
                  value={[downloadSizeIndex]}
                  onValueChange={([i]) => setDownloadSizeIndex(i)}
                  className="w-full"
                />
                <div className="grid grid-cols-5 gap-0.5 text-center text-xs text-muted-foreground tabular-nums">
                  {DOWNLOAD_SIZES.map((px) => (
                    <span key={px}>{px}px</span>
                  ))}
                </div>
              </div>

            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: PREVIEW_MAX_PX, height: PREVIEW_MAX_PX }}
                >
                <QRCodeSVG
                  id="qr-code"
                  value={url}
                  size={downloadSize}
                  marginSize={1}
                  level="H"
                  className="max-w-full max-h-full w-full h-full"
                />
                </div>
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
