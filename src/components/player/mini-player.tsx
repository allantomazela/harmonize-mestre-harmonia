import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Music,
  Loader2,
  ListMusic,
} from 'lucide-react'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { QueueList } from './queue-list'

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
    queue,
    currentIndex,
    reorderQueue,
    removeFromQueue,
    skipToIndex,
  } = useAudioPlayer()

  if (!currentTrack) return null

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-[58px] md:bottom-0 left-0 md:left-64 right-0 bg-black/90 backdrop-blur-xl border-t border-primary/20 shadow-[0_-4px_30px_rgba(0,0,0,0.5)] z-40 transition-transform duration-300 animate-slide-up">
      {/* Slim Neon Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 group cursor-pointer overflow-hidden">
        <div
          className="h-full bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-100 ease-linear relative"
          style={{ width: `${progressPercent}%` }}
        />
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={(v) => seek(v[0])}
          className="absolute inset-0 opacity-0 h-full cursor-pointer z-10"
        />
      </div>

      <div className="flex items-center justify-between p-3 gap-4 h-20">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0 group">
          <div className="h-12 w-12 rounded-sm bg-secondary flex-shrink-0 overflow-hidden relative border border-white/10 shadow-lg">
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
            <Link
              to="/player"
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]"
            >
              <Maximize2 className="w-5 h-5 text-primary" />
            </Link>
          </div>
          <div className="flex flex-col min-w-0 justify-center">
            <h4 className="font-bold text-sm truncate leading-tight hover:text-primary transition-colors text-white">
              <Link to="/player">{currentTrack.title}</Link>
            </h4>
            <p className="text-xs text-muted-foreground truncate font-medium">
              {currentTrack.composer}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hidden sm:inline-flex text-muted-foreground hover:text-white hover:bg-transparent transition-transform hover:scale-110"
            onClick={playPrev}
            disabled={isLoading}
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </Button>

          <Button
            size="icon"
            className={cn(
              'h-10 w-10 rounded-full shadow-[0_0_15px_rgba(191,255,0,0.3)] hover:scale-105 active:scale-95 transition-all border border-primary/50',
              isPlaying
                ? 'bg-transparent text-primary hover:bg-primary hover:text-black'
                : 'bg-primary text-black hover:bg-primary/90',
            )}
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-transparent transition-transform hover:scale-110"
            onClick={playNext}
            disabled={isLoading}
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </Button>
        </div>

        {/* Extra Actions */}
        <div className="flex items-center gap-2 md:w-[150px] justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-transparent"
              >
                <ListMusic className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md p-0 border-l border-border bg-background">
              <div className="h-full pt-10">
                <QueueList
                  queue={queue}
                  currentIndex={currentIndex}
                  onReorder={reorderQueue}
                  onRemove={removeFromQueue}
                  onSkipTo={skipToIndex}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
