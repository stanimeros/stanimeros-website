import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import imageCompression from 'browser-image-compression'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import Layout from '@/components/Layout'
import ContactSection from '@/components/ContactSection'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ImageInfo = {
  file: File
  preview: string
  size: number
}

export default function ImageConverter() {
  const { t } = useTranslation()
  const [sourceImage, setSourceImage] = useState<ImageInfo | null>(null)
  const [convertedImage, setConvertedImage] = useState<ImageInfo | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>('webp')
  const [quality, setQuality] = useState<number>(80)
  const [maxWidth, setMaxWidth] = useState<number>(1920)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setSourceImage({
      file,
      preview,
      size: file.size
    })
    setConvertedImage(null)
  }

  const convertImage = async () => {
    if (!sourceImage) return

    setIsProcessing(true)
    try {
      // Compress the image first
      const compressedFile = await imageCompression(sourceImage.file, {
        maxSizeMB: 1,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        fileType: `image/${targetFormat}`,
        initialQuality: quality / 100,
      })

      // Create preview URL for the compressed image
      const preview = URL.createObjectURL(compressedFile)

      setConvertedImage({
        file: compressedFile,
        preview,
        size: compressedFile.size
      })
    } catch (error) {
      console.error('Error converting image:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!convertedImage) return

    const link = document.createElement('a')
    link.href = convertedImage.preview
    const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat
    link.download = `converted-image.${extension}`
    link.click()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const calculateReduction = () => {
    if (!sourceImage || !convertedImage) return 0
    return ((sourceImage.size - convertedImage.size) / sourceImage.size * 100).toFixed(1)
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('tools.imageConverter.title')}</h1>
        <p className="text-lg text-center mb-8">{t('tools.imageConverter.description')}</p>

        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-card/70 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Source Image Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t('tools.imageConverter.sourceImage')}</h2>
                <div className="space-y-4">
                  <div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      {t('tools.imageConverter.selectImage')}
                    </Button>
                  </div>
                  {sourceImage && (
                    <div className="space-y-2">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={sourceImage.preview}
                          alt="Source"
                          className="max-h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('tools.imageConverter.originalSize')}: {formatBytes(sourceImage.size)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings & Output Section */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">{t('tools.imageConverter.settings')}</h2>
                  
                  <div className="space-y-2">
                    <Label>{t('tools.imageConverter.format')}</Label>
                    <Select
                      value={targetFormat}
                      onValueChange={setTargetFormat}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>{t('tools.imageConverter.quality')}</Label>
                      <span className="text-sm text-muted-foreground">{quality}%</span>
                    </div>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={[quality]}
                      onValueChange={([value]) => setQuality(value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>{t('tools.imageConverter.maxWidth')}</Label>
                      <span className="text-sm text-muted-foreground">{maxWidth}px</span>
                    </div>
                    <Slider
                      min={100}
                      max={3840}
                      step={100}
                      value={[maxWidth]}
                      onValueChange={([value]) => setMaxWidth(value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={convertImage}
                    disabled={!sourceImage || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? t('tools.imageConverter.processing') : t('tools.imageConverter.convert')}
                  </Button>
                </div>

                {convertedImage && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">{t('tools.imageConverter.result')}</h2>
                    <div className="space-y-2">
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={convertedImage.preview}
                          alt="Converted"
                          className="max-h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {t('tools.imageConverter.newSize')}: {formatBytes(convertedImage.size)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('tools.imageConverter.reduction')}: {calculateReduction()}%
                        </p>
                      </div>
                      <Button
                        onClick={handleDownload}
                        className="w-full"
                      >
                        {t('tools.imageConverter.download')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <ContactSection />
    </Layout>
  )
}
