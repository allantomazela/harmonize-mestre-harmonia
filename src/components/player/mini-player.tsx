import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  X,
  Music,
  Loader2,
} from 'lucide-react'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    seek,
    isLoading,
  } = useAudioPlayer()

  if (!currentTrack) return null

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-[58px] md:bottom-0 left-0 md:left-64 right-0 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 transition-transform duration-300 animate-slide-up">
      {/* Progress Bar (slim, on top) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-secondary group cursor-pointer">
        <div
          className="h-full bg-primary transition-all duration-100 ease-linear relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
        </div>
        {/* Invisible Slider for interaction */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={(v) => seek(v[0])}
          className="absolute inset-0 opacity-0 h-full"
        />
      </div>

      <div className="flex items-center justify-between p-2 md:p-3 gap-4 h-16 md:h-20">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-md bg-secondary flex-shrink-0 overflow-hidden relative border border-border">
            {currentTrack.cover ? (
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-500',
                  isLoading ? 'opacity-50' : 'opacity-100',
                )}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <Music className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <h4 className="font-semibold text-sm truncate leading-tight hover:text-primary transition-colors">
              <Link to="/player">{currentTrack.title}</Link>
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.composer}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            onClick={playPrev}
            disabled={isLoading}
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </Button>

          <Button
            size="icon"
            className={cn(
              'h-10 w-10 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all',
              isPlaying
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary text-primary-foreground',
            )}
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={playNext}
            disabled={isLoading}
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </Button>
        </div>

        {/* Extra Actions */}
        <div className="flex items-center gap-2 md:w-[150px] justify-end">
          <Link to="/player">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
