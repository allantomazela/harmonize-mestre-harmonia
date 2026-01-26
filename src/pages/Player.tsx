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
import { Settings2, Music, MonitorPlay, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Player() {
  const {
    isPlaying,
    currentTrack,
    queue,
    currentIndex,
    currentTime,
    duration,
    volume,
    fadeInDuration,
    fadeOutDuration,
    fadeCurve,
    isLoading,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    setFadeInDuration,
    setFadeOutDuration,
    setFadeCurve,
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

          <div className="flex items-center gap-2">
            <Link to="/live-mode">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary/20 hover:border-primary/50"
              >
                <MonitorPlay className="w-4 h-4" />
                <span className="hidden sm:inline">Live Mode</span>
              </Button>
            </Link>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Transição</span>
                  <Badge variant="secondary" className="ml-1 text-[10px] h-5">
                    {fadeInDuration}s / {fadeOutDuration}s
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Configuração de Fade
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Fade In (Início)</Label>
                        <span className="text-xs text-muted-foreground">
                          {fadeInDuration}s
                        </span>
                      </div>
                      <Slider
                        value={[fadeInDuration]}
                        min={0}
                        max={10}
                        step={0.5}
                        onValueChange={(v) => setFadeInDuration(v[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Fade Out (Fim)</Label>
                        <span className="text-xs text-muted-foreground">
                          {fadeOutDuration}s
                        </span>
                      </div>
                      <Slider
                        value={[fadeOutDuration]}
                        min={0}
                        max={10}
                        step={0.5}
                        onValueChange={(v) => setFadeOutDuration(v[0])}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Curva de Transição</Label>
                      <Select
                        value={fadeCurve}
                        onValueChange={(v: any) => setFadeCurve(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="exponential">
                            Exponencial
                          </SelectItem>
                          <SelectItem value="smooth">
                            Suave (SmoothStep)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
                    Controla a suavidade da entrada e saída do áudio.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
