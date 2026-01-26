import { useAudioPlayer } from '@/hooks/use-audio-player'
import { TrackInfo } from '@/components/player/track-info'
import { PlayerControls } from '@/components/player/player-controls'
import { QueueList } from '@/components/player/queue-list'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Settings2, Music } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Player() {
  const {
    isPlaying,
    currentTrack,
    queue,
    currentIndex,
    currentTime,
    duration,
    volume,
    fadeDuration,
    isLoading,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    setFadeDuration,
    reorderQueue,
    skipToIndex,
  } = useAudioPlayer()

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 p-4 max-w-7xl mx-auto animate-fade-in">
      {/* Left Column: Player Main */}
      <div className="flex-1 flex flex-col justify-center space-y-8 max-w-2xl mx-auto w-full">
        {/* Header / Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Player Ritual</h1>
              <p className="text-xs text-muted-foreground">Sessão Ativa</p>
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Transição</span>
                <Badge variant="secondary" className="ml-1 text-[10px] h-5">
                  {fadeDuration}s
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Duração do Fade</Label>
                    <span className="text-xs text-muted-foreground">
                      {fadeDuration}s
                    </span>
                  </div>
                  <Slider
                    value={[fadeDuration]}
                    min={0}
                    max={10}
                    step={0.5}
                    onValueChange={(v) => setFadeDuration(v[0])}
                  />
                  <p className="text-xs text-muted-foreground pt-1">
                    Controla o tempo de Fade-in ao iniciar e Fade-out ao
                    finalizar.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Info & Cover */}
        <TrackInfo track={currentTrack} isLoading={isLoading} />

        {/* Controls */}
        <div className="bg-card/30 rounded-2xl p-6 border border-border/50 backdrop-blur-sm">
          <PlayerControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onTogglePlay={togglePlay}
            onNext={playNext}
            onPrev={playPrev}
            progress={currentTime}
            duration={duration}
            onSeek={seek}
            volume={volume}
            onVolumeChange={setVolume}
          />
        </div>
      </div>

      {/* Right Column: Queue */}
      <div className="lg:w-96 w-full flex flex-col h-full overflow-hidden">
        <QueueList
          queue={queue}
          currentIndex={currentIndex}
          onReorder={reorderQueue}
          onSkipTo={skipToIndex}
        />
      </div>
    </div>
  )
}
