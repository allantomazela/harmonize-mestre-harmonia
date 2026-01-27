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

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="space-y-2 group">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          onValueChange={(v) => onSeek(v[0])}
          className="cursor-pointer py-2"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            disabled
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 hover:bg-transparent text-foreground hover:scale-110 transition-transform"
            onClick={onPrev}
            disabled={isLoading}
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </Button>

          <Button
            className={cn(
              'h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center',
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
            className="h-12 w-12 hover:bg-transparent text-foreground hover:scale-110 transition-transform"
            onClick={onNext}
            disabled={isLoading}
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            disabled
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-48 mt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
