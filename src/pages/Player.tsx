import { useAudioPlayer } from '@/hooks/use-audio-player-context'
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
import {
  Settings2,
  MonitorPlay,
  Activity,
  ListMusic,
  ChevronDown,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function Player() {
  const navigate = useNavigate()
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
    removeFromQueue,
    skipToIndex,
  } = useAudioPlayer()

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 p-4 max-w-7xl mx-auto animate-fade-in relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none rounded-[3rem]" />

      <div className="flex-1 flex gap-8 items-center justify-center relative z-10">
        {/* Main Player Area */}
        <div className="flex-1 max-w-3xl w-full flex flex-col justify-center space-y-8">
          {/* Header Controls */}
          <div className="flex items-center justify-between px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:bg-secondary/50 rounded-full"
            >
              <ChevronDown className="w-6 h-6" />
            </Button>

            <div className="flex items-center gap-3">
              <Link to="/live-mode">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 text-primary text-xs uppercase tracking-wider font-bold"
                >
                  <MonitorPlay className="w-4 h-4" /> Live Mode
                </Button>
              </Link>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/50"
                  >
                    <Settings2 className="w-5 h-5" />
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
                  </div>
                </PopoverContent>
              </Popover>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="lg:hidden rounded-full hover:bg-secondary/50"
                    size="icon"
                  >
                    <ListMusic className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md p-0">
                  <div className="h-full pt-6">
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

          {/* Visuals */}
          <TrackInfo track={currentTrack} isLoading={isLoading} />

          {/* Controls */}
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

        {/* Desktop Queue - Always visible on large screens */}
        <div className="hidden lg:flex w-96 flex-col h-full bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 overflow-hidden shadow-xl">
          <QueueList
            queue={queue}
            currentIndex={currentIndex}
            onReorder={reorderQueue}
            onRemove={removeFromQueue}
            onSkipTo={skipToIndex}
          />
        </div>
      </div>
    </div>
  )
}
