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
    <div className="space-y-6 w-full max-w-4xl mx-auto bg-card p-6 rounded-xl border border-border shadow-2xl relative overflow-hidden">
      {/* Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Timers & Progress - Radio Console Style */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div className="text-center w-24">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">
            Elapsed
          </span>
          <span className="text-2xl font-mono font-bold text-primary block">
            {formatTime(progress)}
          </span>
        </div>

        <div className="relative h-12 flex items-center group">
          <div className="absolute inset-0 bg-secondary/30 rounded-full overflow-hidden h-3 m-auto border border-white/5">
            {/* Visual Waveform placeholder lines */}
            <div
              className="w-full h-full opacity-20"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, transparent 50%, #fff 50%)',
                backgroundSize: '4px 100%',
              }}
            />
          </div>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            onValueChange={(v) => onSeek(v[0])}
            className="cursor-pointer relative z-10 [&_.bg-primary]:bg-primary [&_.bg-primary]:shadow-[0_0_10px_rgba(132,204,22,0.5)]"
          />
        </div>

        <div className="text-center w-24">
          <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">
            Remaining
          </span>
          <span className="text-2xl font-mono font-bold text-destructive block animate-pulse">
            -{formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Console Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
        {/* Left: Modes */}
        <div className="flex gap-4">
          <Button
            variant={isAutoPlay ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleAutoPlay}
            className={cn(
              'min-w-[100px] border-primary/20 font-bold uppercase tracking-wider text-xs h-10',
              isAutoPlay
                ? 'bg-primary text-black hover:bg-primary/90'
                : 'text-muted-foreground bg-transparent hover:text-primary hover:border-primary',
            )}
          >
            {isAutoPlay ? (
              <>
                <Repeat className="w-3 h-3 mr-2" /> Auto Cue
              </>
            ) : (
              <>
                <Power className="w-3 h-3 mr-2" /> Manual
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onFadeOut}
            className="min-w-[100px] border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive font-bold uppercase tracking-wider text-xs h-10"
          >
            <TrendingDown className="w-3 h-3 mr-2" /> Fade Out
          </Button>
        </div>

        {/* Center: Transport */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full border border-border bg-secondary/20 hover:bg-secondary hover:text-white transition-all"
            onClick={onPrev}
            disabled={isLoading}
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </Button>

          <Button
            className={cn(
              'h-20 w-20 rounded-full shadow-[0_0_30px_rgba(132,204,22,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-4',
              isPlaying
                ? 'bg-transparent border-primary text-primary hover:bg-primary hover:text-black'
                : 'bg-primary border-primary text-black hover:bg-primary/90',
            )}
            onClick={onTogglePlay}
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 fill-current" />
            ) : (
              <Play className="w-10 h-10 fill-current ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full border border-border bg-secondary/20 hover:bg-secondary hover:text-white transition-all"
            onClick={onNext}
            disabled={isLoading}
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </Button>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center gap-3 w-48 bg-secondary/20 p-2 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white rounded-full"
            onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
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
  )
}
