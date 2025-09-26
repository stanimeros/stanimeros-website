import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileVideo, Upload, X, Loader2 } from 'lucide-react';
import VideoSettings from '@/components/VideoSettings';
import type { ConversionSettings } from '@/lib/video-types';
import { defaultSettings } from '@/lib/video-types';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import ContactSection from '@/components/ContactSection';

const ffmpeg = createFFmpeg({ log: true });

export default function VideoCompressor() {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [video, setVideo] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [settings, setSettings] = useState<ConversionSettings>(defaultSettings);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  // Load FFmpeg only when needed
  const loadFFmpeg = async () => {
    try {
      setIsLoading(true);
      await ffmpeg.load();
      setIsReady(true);
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    // Revoke any existing object URLs to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
    }

    // Reset all state variables
    setVideo(null);
    setProgress(0);
    setOutputUrl('');
    setIsProcessing(false);
    setProcessedSize(null);
    setPreviewUrl('');
    setSettings(defaultSettings);

    // Reset video elements
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    if (previewRef.current) {
      previewRef.current.src = '';
    }
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: {
      'video/*': []
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async (acceptedFiles) => {
      resetState(); // Reset state before setting new video
      setVideo(acceptedFiles[0]);
      
      // Load FFmpeg if not already loaded
      if (!isReady) {
        await loadFFmpeg();
      }
    }
  });

  // Create object URL for preview when video is selected
  React.useEffect(() => {
    if (video) {
      const url = URL.createObjectURL(video);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [video]);

  // Update preview position based on progress
  React.useEffect(() => {
    if (previewRef.current && videoRef.current && isProcessing) {
      const duration = videoRef.current.duration;
      if (duration) {
        previewRef.current.currentTime = (progress / 100) * duration;
      }
    }
  }, [progress, isProcessing]);

  const compressVideo = async () => {
    if (!video || !isReady) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessedSize(0);

    // Write the file to memory
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(video));

    // Set up progress tracking
    ffmpeg.setProgress(({ ratio }) => {
      setProgress(Math.round(ratio * 100));
      // Simulate growing file size during compression
      setProcessedSize(Math.min(video.size * ratio * 0.4, video.size * 0.4));
    });

    // Build FFmpeg command based on settings
    const args = [
      '-i', 'input.mp4',
      '-c:v', settings.videoCodec,
    ];

    // Calculate CRF based on quality percentage
    const crf = Math.round(51 - (parseInt(settings.targetPercentage || '80') / 100) * 33);
    args.push('-crf', crf.toString());

    // Add remaining settings
    args.push(
      '-c:a', settings.audioCodec,
      '-b:a', settings.audioBitrate,
      '-r', settings.frameRate,
      'output.mp4'
    );

    try {
      // Run the FFmpeg command
      await ffmpeg.run(...args);

      // Read the result
      const data = ffmpeg.FS('readFile', 'output.mp4');
      const url = URL.createObjectURL(new Blob([data as unknown as BlobPart], { type: 'video/mp4' }));
      
      setOutputUrl(url);
      setIsProcessing(false);
      setProgress(100);
      setProcessedSize(data.length);

      // Clean up
      ffmpeg.FS('unlink', 'input.mp4');
      ffmpeg.FS('unlink', 'output.mp4');
    } catch (error) {
      console.error('Error during compression:', error);
      setIsProcessing(false);
      setProgress(0);
      setProcessedSize(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">{t('tools.videoCompressor.title')}</h1>
        <p className="text-lg text-center mb-4">{t('tools.videoCompressor.description')}</p>
        <p className="text-sm text-center text-muted-foreground mb-8">
          {t('tools.videoCompressor.handbrakeNote')} <a href="https://handbrake.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">HandBrake</a>
        </p>

        <div className="max-w-4xl mx-auto">
          <VideoSettings 
            settings={settings}
            onSettingsChange={setSettings}
          />
          
          <Card className="p-6 bg-card/70 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{t('tools.videoCompressor.dropzoneTitle')}</h2>
            </div>

            {!video ? (
              <div 
                {...getRootProps()} 
                className={`bg-muted/50 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors relative
                  ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
              >
                <input {...getInputProps()} />
                {isLoading ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                    <p className="text-muted-foreground">{t('tools.videoCompressor.loading')}</p>
                  </>
                ) : (
                  <>
                    <FileVideo className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">{t('tools.videoCompressor.dropzone')}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t('tools.videoCompressor.maxSize')}</p>
                    {fileRejections.length > 0 && (
                      <p className="text-sm text-destructive mt-2">{t('tools.videoCompressor.fileTooLarge')}</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileVideo className="w-6 h-6 mr-2" />
                    <span className="font-medium">{video.name}</span>
                  </div>
                  <button 
                    onClick={resetState}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!isProcessing && !outputUrl && (
                  <Button 
                    onClick={compressVideo}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={!isReady}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('tools.videoCompressor.loading')}
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        {t('tools.videoCompressor.compress')}
                      </>
                    )}
                  </Button>
                )}

                {(isProcessing || outputUrl) && (
                  <div className="flex gap-4 pt-6">
                    <div className="bg-muted/50 p-5 rounded-2xl flex-1">
                      <div className="text-[0.7rem] uppercase text-muted-foreground">{t('tools.videoCompressor.original')}</div>
                      <div className="text-3xl font-bold tracking-tight">
                        {(video.size / (1024 * 1024)).toFixed(1)} <span className="text-3xl">MB</span>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-5 rounded-2xl flex-1">
                      <div className="text-[0.7rem] uppercase text-muted-foreground">{t('tools.videoCompressor.compressed')}</div>
                      <div className="text-3xl font-bold tracking-tight">
                        {processedSize ? (processedSize / (1024 * 1024)).toFixed(1) : '0.0'} <span className="text-3xl">MB</span>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="mt-4">
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                      <video 
                        ref={videoRef}
                        src={previewUrl}
                        className="absolute inset-0 w-full h-full opacity-50"
                        muted
                      />
                      <video
                        ref={previewRef}
                        src={previewUrl}
                        className="absolute inset-0 w-full h-full clip-progress"
                        style={{
                          clipPath: `inset(0 ${100 - progress}% 0 0)`
                        }}
                        muted
                      />
                    </div>
                    <Progress value={progress} className="mb-2" />
                    <div className="text-center text-sm text-muted-foreground">
                      {t('tools.videoCompressor.compressing')}: {progress}%
                    </div>
                  </div>
                )}

                {outputUrl && (
                  <div className="mt-4">
                    <video 
                      src={outputUrl} 
                      controls 
                      className="w-full rounded-lg"
                    />
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {t('tools.videoCompressor.saved')} {processedSize && ((1 - processedSize / video.size) * 100).toFixed(0)}%
                      </div>
                      <a
                        href={outputUrl}
                        download="compressed-video.mp4"
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
                      >
                        {t('tools.videoCompressor.download')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
      <ContactSection />

    </Layout>
  );
}