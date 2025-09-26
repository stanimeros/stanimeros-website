export interface ConversionSettings {
  compressionMethod: 'percentage';
  targetPercentage: string;
  videoCodec: string;
  audioCodec: string;
  audioBitrate: string;
  frameRate: string;
  resolution: string;
}

export const defaultSettings: ConversionSettings = {
  compressionMethod: 'percentage',
  targetPercentage: '80',
  videoCodec: 'libx264',
  audioCodec: 'aac',
  audioBitrate: '128k',
  frameRate: '30',
  resolution: '1920x1080'
};