import type { ConversionSettings } from '@/lib/video-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from 'react-i18next';

interface VideoSettingsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VideoSettings({ settings, onSettingsChange, open, onOpenChange }: VideoSettingsProps) {
  const { t } = useTranslation();

  const handleSettingChange = (key: keyof ConversionSettings, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const renderCompressionControl = () => {
    switch (settings.compressionMethod) {
      case 'percentage':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>{t('tools.videoCompressor.targetQuality')}</Label>
              <span className="text-sm text-muted-foreground">{settings.targetPercentage || '100'}%</span>
            </div>
            <Slider
              min={1}
              max={100}
              value={[parseInt(settings.targetPercentage || '100')]}
              onValueChange={([value]) => handleSettingChange('targetPercentage', value.toString())}
              className="w-full"
            />
          </div>
        );
      case 'filesize':
        return (
          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.targetFilesize')}</Label>
            <input
              type="number"
              min="1"
              max="10240"
              value={settings.targetFilesize || '100'}
              onChange={(e) => handleSettingChange('targetFilesize', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        );
      case 'crf':
        return (
          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.videoQuality')}</Label>
            <Select
              value={settings.crfValue || '23'}
              onValueChange={(value) => handleSettingChange('crfValue', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 34 }, (_, i) => i + 18).map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} {value === 18 ? '(Best Quality)' : value === 51 ? '(Smallest Size)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'bitrate':
        return (
          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.videoBitrate')}</Label>
            <Select
              value={settings.videoBitrate}
              onValueChange={(value) => handleSettingChange('videoBitrate', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300k">300 Kbps</SelectItem>
                <SelectItem value="1000k">1 Mbps</SelectItem>
                <SelectItem value="2500k">2.5 Mbps</SelectItem>
                <SelectItem value="5000k">5 Mbps</SelectItem>
                <SelectItem value="8000k">8 Mbps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('tools.videoCompressor.settings')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.compressionMethod')}</Label>
            <Select
              value={settings.compressionMethod}
              onValueChange={(value) => handleSettingChange('compressionMethod', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bitrate">{t('tools.videoCompressor.methods.bitrate')}</SelectItem>
                <SelectItem value="percentage">{t('tools.videoCompressor.methods.percentage')}</SelectItem>
                <SelectItem value="filesize">{t('tools.videoCompressor.methods.filesize')}</SelectItem>
                <SelectItem value="crf">{t('tools.videoCompressor.methods.crf')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-2">
            {renderCompressionControl()}
          </div>

          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.videoCodec')}</Label>
            <Select
              value={settings.videoCodec}
              onValueChange={(value) => handleSettingChange('videoCodec', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="libx264">H.264</SelectItem>
                <SelectItem value="libx265">H.265</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.audioCodec')}</Label>
            <Select
              value={settings.audioCodec}
              onValueChange={(value) => handleSettingChange('audioCodec', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aac">AAC</SelectItem>
                <SelectItem value="mp3">MP3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.audioBitrate')}</Label>
            <Select
              value={settings.audioBitrate}
              onValueChange={(value) => handleSettingChange('audioBitrate', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="64k">64 kbps</SelectItem>
                <SelectItem value="96k">96 kbps</SelectItem>
                <SelectItem value="128k">128 kbps</SelectItem>
                <SelectItem value="192k">192 kbps</SelectItem>
                <SelectItem value="256k">256 kbps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.frameRate')}</Label>
            <Select
              value={settings.frameRate}
              onValueChange={(value) => handleSettingChange('frameRate', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 fps</SelectItem>
                <SelectItem value="30">30 fps</SelectItem>
                <SelectItem value="60">60 fps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('tools.videoCompressor.resolution')}</Label>
            <Select
              value={settings.resolution}
              onValueChange={(value) => handleSettingChange('resolution', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1920x1080">1080p (1920px)</SelectItem>
                <SelectItem value="1280x720">720p (1280px)</SelectItem>
                <SelectItem value="854x480">480p (854px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      size="icon"
      onClick={onClick}
      className="ml-2"
    >
      <Settings className="h-4 w-4" />
    </Button>
  );
}
