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
  Shuffle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerControlsProps {
  isPlaying: boolean
  isLoading: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
  progress: number
  duration: number
  onSeek: (time: number) => void
  volume: number
  onVolumeChange: (vol: number) => void
}

export function PlayerControls({
  isPlaying,
  isLoading,
  onTogglePlay,
  onNext,
  onPrev,
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
    <div className="space-y-8 w-full max-w-2xl mx-auto bg-card/50 p-6 rounded-3xl border border-border/50 shadow-sm backdrop-blur-sm">
      {/* Progress Bar & Time */}
      <div className="space-y-2 group">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          onValueChange={(v) => onSeek(v[0])}
          className="cursor-pointer py-2 [&_.bg-primary]:bg-primary [&_.bg-primary]:h-1.5 [&_.bg-secondary]:h-1.5 [&_.border-primary]:h-4 [&_.border-primary]:w-4"
        />
        <div className="flex justify-between text-sm font-mono font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          <span>{formatTime(progress)}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground/60">
              {formatTime(duration)}
            </span>
            <span className="text-primary font-bold">
              -{formatTime(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center gap-6 md:gap-10">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary transition-colors"
            disabled
          >
            <Shuffle className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-border hover:bg-secondary hover:scale-105 transition-all"
            onClick={onPrev}
            disabled={isLoading}
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </Button>

          <Button
            className={cn(
              'h-20 w-20 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center',
              isPlaying
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
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
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 border-border hover:bg-secondary hover:scale-105 transition-all"
            onClick={onNext}
            disabled={isLoading}
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary transition-colors"
            disabled
          >
            <Repeat className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-4 w-full max-w-xs mt-2 px-4 py-2 bg-secondary/30 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
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
