import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Waveform } from '@/components/ui/waveform'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerControlsProps {
  isPlaying: boolean
  isLoading: boolean
  isAutoPlay: boolean
  onTogglePlay: () => void
  onToggleAutoPlay: () => void
  onNext: () => void
  onPrev: () => void
  onFadeOut: () => void
  progress: number
  duration: number
  onSeek: (time: number) => void
  volume: number
  onVolumeChange: (vol: number) => void
  currentTrackId?: string
}

export function PlayerControls({
  isPlaying,
  isLoading,
  isAutoPlay,
  onTogglePlay,
  onToggleAutoPlay,
  onNext,
  onPrev,
  onFadeOut,
  progress,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  currentTrackId,
}: PlayerControlsProps) {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remaining = Math.max(0, duration - progress)

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

        <div className="mb-8 space-y-2">
          <div className="flex justify-between items-end px-1 mb-2">
            <div className="text-left">
              <span className="text-2xl font-mono font-bold text-white tracking-tight">
                {formatTime(progress)}
              </span>
            </div>
            <div className="text-right">
              <span
                className={cn(
                  'text-2xl font-mono font-bold tracking-tight transition-colors',
                  remaining < 10 && remaining > 0
                    ? 'text-destructive animate-pulse'
                    : 'text-muted-foreground',
                )}
              >
                -{formatTime(remaining)}
              </span>
            </div>
          </div>

          <div className="relative h-16 w-full flex items-center justify-center bg-black/20 rounded-lg overflow-hidden border border-white/5">
            {currentTrackId ? (
              <Waveform
                trackId={currentTrackId}
                progress={progress}
                duration={duration || 1}
                onSeek={onSeek}
                height={64}
              />
            ) : (
              <div className="w-full h-[1px] bg-white/10" />
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <Button
              variant="outline"
              onClick={onToggleAutoPlay}
              className={cn(
                'h-12 px-5 border-2 transition-all duration-300 relative overflow-hidden',
                isAutoPlay
                  ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-[0_0_15px_-5px_hsl(var(--primary))]'
                  : 'border-border bg-transparent text-muted-foreground hover:border-primary/50 hover:text-white',
              )}
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                  Auto Cue
                </span>
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isAutoPlay ? 'bg-primary' : 'bg-muted-foreground',
                    )}
                  />
                  <span className="text-xs font-bold">
                    {isAutoPlay ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={onFadeOut}
              className="h-12 px-5 border-2 border-border bg-transparent text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1 group-hover:text-destructive transition-colors">
                  Output
                </span>
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">FADE</span>
                </div>
              </div>
            </Button>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition-transform hover:scale-110 active:scale-95"
              onClick={onPrev}
              disabled={isLoading}
            >
              <SkipBack className="w-8 h-8 fill-current" />
            </Button>
            <Button
              className={cn(
                'h-24 w-24 rounded-full transition-all duration-300 flex items-center justify-center border-4 relative overflow-hidden',
                isPlaying
                  ? 'bg-transparent border-primary text-primary shadow-[0_0_30px_rgba(191,255,0,0.3)] hover:scale-105 hover:bg-primary/10'
                  : 'bg-primary border-primary text-black shadow-[0_0_40px_rgba(191,255,0,0.6)] hover:scale-105 hover:shadow-[0_0_60px_rgba(191,255,0,0.8)]',
              )}
              onClick={onTogglePlay}
              disabled={isLoading}
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-1.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition-transform hover:scale-110 active:scale-95"
              onClick={onNext}
              disabled={isLoading}
            >
              <SkipForward className="w-8 h-8 fill-current" />
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl border border-white/5 h-12 w-full md:w-40">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-primary rounded-full shrink-0"
                onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={(v) => onVolumeChange(v[0])}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
