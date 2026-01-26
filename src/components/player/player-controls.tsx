import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
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

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          onValueChange={(v) => onSeek(v[0])}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>-{formatTime((duration || 0) - progress)}</span>
        </div>
      </div>

      {/* Main Buttons */}
      <div className="flex items-center justify-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 hover:bg-secondary/20"
          onClick={onPrev}
          disabled={isLoading}
        >
          <SkipBack className="w-6 h-6 fill-current" />
        </Button>

        <Button
          className={cn(
            'h-16 w-16 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95',
            isPlaying
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary text-primary-foreground',
          )}
          onClick={onTogglePlay}
          disabled={isLoading}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 hover:bg-secondary/20"
          onClick={onNext}
          disabled={isLoading}
        >
          <SkipForward className="w-6 h-6 fill-current" />
        </Button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 max-w-xs mx-auto pt-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
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
  )
}
