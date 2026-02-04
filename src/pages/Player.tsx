import {
  useAudioPlayer,
  AcousticEnvironment,
} from '@/hooks/use-audio-player-context'
import { TrackInfo } from '@/components/player/track-info'
import { PlayerControls } from '@/components/player/player-controls'
import { QueueList } from '@/components/player/queue-list'
import { AudioEffectsPanel } from '@/components/player/audio-effects-panel'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Activity,
  ChevronDown,
  Mic2,
  Share2,
  Waves,
  SlidersVertical,
  Volume2,
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
    isLoading,
    isAutoPlay,
    acousticEnvironment,
    trackVolumes,
    togglePlay,
    toggleAutoPlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    setAcousticEnvironment,
    setTrackVolume,
    reorderQueue,
    removeFromQueue,
    skipToIndex,
    triggerFadeOut,
    isCorsRestricted,
  } = useAudioPlayer()

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-4 md:p-6 max-w-[1800px] mx-auto animate-fade-in relative bg-background overflow-hidden">
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

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
          {isCorsRestricted && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <AlertCircle className="w-3 h-3" /> Modo Limitado (CORS)
            </Badge>
          )}

          {acousticEnvironment !== 'none' && !isCorsRestricted && (
            <Badge
              variant="outline"
              className="border-primary/50 text-primary animate-pulse bg-primary/10"
            >
              <Waves className="w-3 h-3 mr-1" /> Simulação Ativa:{' '}
              {acousticEnvironment}
            </Badge>
          )}

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
                disabled={isCorsRestricted}
              >
                <SlidersVertical className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 border-border bg-card shadow-2xl p-4 mr-4">
              <div className="space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2 text-primary uppercase tracking-wider border-b border-border pb-2">
                  <Activity className="w-4 h-4" /> Mixer Controls
                </h4>

                <AudioEffectsPanel />

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase">
                      Ambiente Acústico
                    </Label>
                    <Select
                      value={acousticEnvironment}
                      onValueChange={(v) =>
                        setAcousticEnvironment(v as AcousticEnvironment)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Estúdio (Seco)</SelectItem>
                        <SelectItem value="temple">
                          Interior do Templo
                        </SelectItem>
                        <SelectItem value="cathedral">Catedral</SelectItem>
                        <SelectItem value="small-room">
                          Câmara de Reflexões
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentTrack && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between">
                        <Label className="text-xs text-primary font-bold uppercase">
                          Volume da Faixa
                        </Label>
                        <span className="text-xs font-mono text-muted-foreground">
                          {Math.round(
                            (trackVolumes[currentTrack.id] ?? 1) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-3 h-3 text-muted-foreground" />
                        <Slider
                          value={[(trackVolumes[currentTrack.id] ?? 1) * 100]}
                          max={100}
                          step={1}
                          onValueChange={(v) =>
                            setTrackVolume(currentTrack.id, v[0] / 100)
                          }
                        />
                      </div>
                    </div>
                  )}
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

      {isCorsRestricted && (
        <Alert
          variant="default"
          className="border-yellow-500/50 bg-yellow-500/10 text-yellow-500 mb-2"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo de Compatibilidade</AlertTitle>
          <AlertDescription>
            Este arquivo de áudio possui restrições de origem (CORS).
            Visualizadores e Efeitos de Áudio foram desativados, mas a
            reprodução continua normal.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-center relative z-10 w-full min-h-0">
        <div className="flex-1 w-full max-w-3xl flex flex-col justify-center gap-8 lg:gap-10 h-full overflow-y-auto lg:overflow-visible py-4 scrollbar-none">
          <div className="flex-1 flex items-center justify-center min-h-[300px] relative">
            <TrackInfo track={currentTrack} isLoading={isLoading} />
            {acousticEnvironment === 'temple' && !isCorsRestricted && (
              <div className="absolute inset-0 pointer-events-none rounded-full border-[20px] border-primary/5 blur-3xl animate-pulse-slow" />
            )}
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
              currentTrackId={currentTrack?.id}
            />
          </div>
        </div>

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
