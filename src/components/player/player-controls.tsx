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
  Download,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Progress } from '@/components/ui/progress'

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
  const {
    downloadProgress,
    currentTrack,
    downloadTrackForOffline,
    isOfflineMode,
    isTransitioning,
  } = useAudioPlayer()

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    if (currentTrack) {
      downloadTrackForOffline(currentTrack)
    }
  }

  const downloadPercentage = currentTrack
    ? downloadProgress[currentTrack.id]
    : undefined

  return (
    <div className="w-full h-full flex items-center justify-between px-6 gap-6">
      {/* Left: Playback Info / Download */}
      <div className="flex-1 flex items-center gap-4 min-w-0">
        {currentTrack && !currentTrack.offlineAvailable && !isOfflineMode && (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary rounded-full hover:bg-white/5"
              onClick={handleDownload}
              disabled={downloadPercentage !== undefined}
            >
              {downloadPercentage !== undefined ? (
                <span className="text-[10px] font-mono">
                  {downloadPercentage}%
                </span>
              ) : (
                <Download className="w-4 h-4" />
              )}
            </Button>
            {downloadPercentage !== undefined && (
              <Progress value={downloadPercentage} className="w-24 h-1.5" />
            )}
          </div>
        )}
      </div>

      {/* Center: Main Controls & Scrubber */}
      <div className="flex-[2] flex flex-col items-center justify-center gap-2 max-w-2xl w-full">
        {/* Buttons */}
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white"
          >
            <Shuffle className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onPrev}
            className="h-10 w-10 text-foreground hover:text-primary rounded-full hover:bg-white/5"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </Button>

          <Button
            onClick={onTogglePlay}
            disabled={isLoading && !isTransitioning}
            className={cn(
              'h-14 w-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center',
              isPlaying
                ? 'bg-primary text-black shadow-[0_0_20px_hsl(var(--primary)/0.4)]'
                : 'bg-white text-black hover:bg-white/90',
              isTransitioning &&
                'border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.5)]',
            )}
          >
            {isLoading && !isTransitioning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            className="h-10 w-10 text-foreground hover:text-primary rounded-full hover:bg-white/5"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white"
          >
            <Repeat className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrubber */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground w-10 text-right">
            {formatTime(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            onValueChange={(v) => onSeek(v[0])}
            className="flex-1 cursor-pointer"
          />
          <span className="text-xs font-mono text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>
        <div className="w-24 lg:w-32">
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={(v) => onVolumeChange(v[0])}
          />
        </div>
      </div>
    </div>
  )
}
