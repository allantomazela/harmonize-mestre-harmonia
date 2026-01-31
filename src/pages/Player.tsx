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
  Activity,
  ChevronDown,
  Mic2,
  Radio,
  Share2,
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
import { Badge } from '@/components/ui/badge'

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
    isAutoPlay,
    togglePlay,
    toggleAutoPlay,
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
    triggerFadeOut,
  } = useAudioPlayer()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-4 md:p-6 max-w-[1800px] mx-auto animate-fade-in relative bg-background overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 w-full mb-2 shrink-0">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-primary gap-2 hover:bg-transparent"
        >
          <ChevronDown className="w-5 h-5" />
          <span className="hidden sm:inline">Minimize</span>
        </Button>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden md:flex gap-2 px-3 py-1 border-primary/30 text-primary bg-primary/5 uppercase tracking-widest font-bold text-[10px]"
          >
            <Radio className="w-3 h-3 animate-pulse" /> Live Broadcast
          </Badge>

          <Link to="/live-mode">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 bg-black/50 hover:bg-primary/10 hover:text-primary hover:border-primary font-bold uppercase tracking-wider text-xs"
            >
              <Mic2 className="w-3 h-3" /> Studio Mode
            </Button>
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-transparent"
              >
                <Settings2 className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-border bg-card shadow-2xl">
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2 text-primary uppercase tracking-wider">
                  <Activity className="w-4 h-4" /> Crossfade Engine
                </h4>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-muted-foreground uppercase">
                        Fade In (Intro)
                      </Label>
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
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
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-muted-foreground uppercase">
                        Fade Out (Outro)
                      </Label>
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
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
                    <Label className="text-xs text-muted-foreground uppercase">
                      Curve Model
                    </Label>
                    <Select
                      value={fadeCurve}
                      onValueChange={(v: any) => setFadeCurve(v)}
                    >
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="exponential">Exponential</SelectItem>
                        <SelectItem value="smooth">Smooth (S-Curve)</SelectItem>
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
                className="lg:hidden hover:bg-transparent hover:text-primary"
                size="icon"
              >
                <Share2 className="w-5 h-5" />
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

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center relative z-10 w-full min-h-0">
        {/* Left Side: Deck / Visuals */}
        <div className="flex-1 w-full max-w-3xl flex flex-col justify-center gap-8 lg:gap-10 h-full overflow-y-auto lg:overflow-visible py-4 scrollbar-none">
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <TrackInfo track={currentTrack} isLoading={isLoading} />
          </div>

          <div className="shrink-0 w-full">
            <PlayerControls
              isPlaying={isPlaying}
              isLoading={isLoading}
              isAutoPlay={isAutoPlay}
              onTogglePlay={togglePlay}
              onToggleAutoPlay={toggleAutoPlay}
              onNext={playNext}
              onPrev={playPrev}
              onFadeOut={triggerFadeOut}
              progress={currentTime}
              duration={duration}
              onSeek={seek}
              volume={volume}
              onVolumeChange={setVolume}
            />
          </div>
        </div>

        {/* Right Side: Queue Management (Desktop) */}
        <div className="hidden lg:flex w-[380px] xl:w-[420px] flex-col h-full max-h-[750px] shrink-0">
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
