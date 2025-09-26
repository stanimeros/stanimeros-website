import type { ConversionSettings } from '@/lib/video-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface VideoSettingsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
}

export default function VideoSettings({ settings, onSettingsChange }: VideoSettingsProps) {
  const { t } = useTranslation();

  const handleSettingChange = (key: keyof ConversionSettings, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="p-6 bg-card/70 backdrop-blur-sm mb-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>{t('tools.videoCompressor.targetQuality')}</Label>
            <span className="text-sm text-muted-foreground">{settings.targetPercentage || '80'}%</span>
          </div>
          <Slider
            min={1}
            max={100}
            value={[parseInt(settings.targetPercentage || '80')]}
            onValueChange={([value]) => handleSettingChange('targetPercentage', value.toString())}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </Card>
  );
}