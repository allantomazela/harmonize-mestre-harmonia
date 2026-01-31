import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Power,
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
      {/* Main Console Box */}
      <div className="bg-card border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

        {/* Progress Section */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between items-end px-1">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isPlaying ? 'bg-primary animate-pulse' : 'bg-muted',
                  )}
                />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
                  Elapsed
                </span>
              </div>
              <span className="text-2xl font-mono font-bold text-white tracking-tight">
                {formatTime(progress)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] block mb-0.5">
                Remaining
              </span>
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

          <div className="relative h-6 flex items-center group">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={(v) => onSeek(v[0])}
              className="cursor-pointer relative z-10 [&_.bg-primary]:bg-primary [&_.bg-primary]:shadow-[0_0_15px_rgba(191,255,0,0.5)] [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-black [&_[role=slider]]:shadow-[0_0_10px_rgba(191,255,0,0.5)]"
            />
          </div>
        </div>

        {/* Controls Layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {/* Left: Mode Toggles */}
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

          {/* Center: Transport Controls */}
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
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              {isPlaying ? (
                <Pause className="w-10 h-10 fill-current relative z-10" />
              ) : (
                <Play className="w-10 h-10 fill-current ml-1.5 relative z-10" />
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

          {/* Right: Volume */}
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
