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
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] gap-4 p-2 md:p-6 max-w-[1800px] mx-auto animate-fade-in relative bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-radial-gradient from-primary/5 to-transparent pointer-events-none" />

      {/* Header / Top Bar */}
      <div className="flex items-center justify-between z-10 w-full mb-2">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-primary gap-2"
        >
          <ChevronDown className="w-5 h-5" /> Minimize
        </Button>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden md:flex gap-2 px-3 py-1 border-primary/50 text-primary bg-primary/5 uppercase tracking-widest font-bold"
          >
            <Radio className="w-3 h-3 animate-pulse" /> Live Broadcast
          </Badge>

          <Link to="/live-mode">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary font-bold uppercase tracking-wider"
            >
              <Mic2 className="w-4 h-4" /> Studio Mode
            </Button>
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
              >
                <Settings2 className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-border bg-card">
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2 text-primary">
                  <Activity className="w-4 h-4" /> Crossfade Settings
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Fade In (Intro)</Label>
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
                      <Label>Fade Out (Outro)</Label>
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
                    <Label>Curve</Label>
                    <Select
                      value={fadeCurve}
                      onValueChange={(v: any) => setFadeCurve(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="exponential">Exponential</SelectItem>
                        <SelectItem value="smooth">Smooth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="lg:hidden" size="icon">
                <Share2 className="w-5 h-5 text-muted-foreground" />
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

      {/* Main Console Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-center relative z-10 w-full">
        {/* Left Side: Deck / Visuals */}
        <div className="flex-1 w-full max-w-2xl flex flex-col justify-center gap-8 lg:gap-12">
          <TrackInfo track={currentTrack} isLoading={isLoading} />

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

        {/* Right Side: Queue Management (Console Sidecar) */}
        <div className="hidden lg:flex w-96 flex-col h-full max-h-[700px]">
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
