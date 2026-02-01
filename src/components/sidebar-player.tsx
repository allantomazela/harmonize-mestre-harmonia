/* Compact Player for Sidebar */
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  Music,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function SidebarPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    volume,
    setVolume,
    isLoading,
    currentTime,
    duration,
  } = useAudioPlayer()

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  if (!currentTrack) {
    return (
      <div className="p-4 mt-auto border-t border-sidebar-border bg-sidebar-accent/5">
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <Music className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            Nenhuma música selecionada
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 mt-auto border-t border-sidebar-border bg-sidebar-accent/5 flex flex-col gap-3">
      {/* Track Info */}
      <Link to="/player" className="group block">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-secondary flex-shrink-0 overflow-hidden relative">
            {currentTrack.cover ? (
              <img
                src={currentTrack.cover}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-5 h-5 m-auto text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_lime]" />
            </div>
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.composer}
            </p>
          </div>
        </div>
      </Link>

      {/* Progress */}
      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
        >
          {volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        <Button
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full shadow-lg transition-all',
            isPlaying
              ? 'bg-primary text-black'
              : 'bg-primary/20 text-primary hover:bg-primary hover:text-black',
          )}
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={playNext}
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </Button>
      </div>
    </div>
  )
}
