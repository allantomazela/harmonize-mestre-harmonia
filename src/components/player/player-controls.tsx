import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerControlsProps {
  isPlaying: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
  progress: number
  duration: number
  onSeek: (value: number) => void
  volume: number
  onVolumeChange: (value: number) => void
}

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function PlayerControls({
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  progress,
  duration,
  onSeek,
  volume,
  onVolumeChange,
}: PlayerControlsProps) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          className="w-full cursor-pointer"
          onValueChange={(v) => onSeek(v[0])}
        />
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>{formatTime(progress)}</span>
          <span>-{formatTime(duration - progress)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Shuffle className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-4 md:gap-8">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2"
            onClick={onPrev}
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>

          <Button
            className={cn(
              'h-16 w-16 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95',
              isPlaying
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2"
            onClick={onNext}
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Repeat className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex justify-center pt-2">
        <div className="flex items-center gap-2 w-full max-w-[200px]">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(v) => onVolumeChange(v[0] / 100)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
