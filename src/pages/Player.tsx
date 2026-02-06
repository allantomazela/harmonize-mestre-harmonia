import { useState } from 'react'
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
  ChevronDown,
  LayoutTemplate,
  Waves,
  Mic2,
  Minimize2,
  Maximize2,
  Download,
  Shuffle,
  Repeat,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Waveform } from '@/components/ui/waveform'
import { Badge } from '@/components/ui/badge'
import { ImportMusicDialog } from '@/components/library/import-music-dialog'

export default function Player() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const {
    isPlaying,
    isTransitioning,
    currentTrack,
    queue,
    currentIndex,
    currentTime,
    duration,
    volume,
    isLoading,
    acousticEnvironment,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    reorderQueue,
    removeFromQueue,
    skipToIndex,
    isCorsRestricted,
  } = useAudioPlayer()

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col overflow-hidden font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 relative z-10 flex min-h-0">
        {/* Zone 1: Main Stage */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 ease-fluid">
          {/* Header Overlay */}
          <div className="h-16 flex items-center justify-between px-6 shrink-0">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-primary gap-2"
            >
              <ChevronDown className="w-5 h-5" />
              <span className="hidden sm:inline font-medium tracking-wide">
                Minimize
              </span>
            </Button>

            <div className="flex items-center gap-3">
              {/* Transition Indicator - Requested by User Story */}
              {isTransitioning && (
                <Badge
                  variant="outline"
                  className="bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30 animate-pulse uppercase font-bold tracking-widest text-[10px]"
                >
                  <Shuffle className="w-3 h-3 mr-1" /> Mixing
                </Badge>
              )}

              {acousticEnvironment !== 'none' && !isCorsRestricted && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 animate-pulse"
                >
                  <Waves className="w-3 h-3 mr-1" /> {acousticEnvironment}
                </Badge>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsImportDialogOpen(true)}
                className="h-8 gap-2 border-white/10 bg-white/5 hover:bg-primary/10 hover:text-primary uppercase text-[10px] font-bold tracking-widest hidden md:flex"
              >
                <Download className="w-3 h-3" /> Import
              </Button>

              <Link to="/live-mode">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:text-primary uppercase text-[10px] font-bold tracking-widest"
                >
                  <Mic2 className="w-3 h-3" /> Studio Mode
                </Button>
              </Link>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-muted-foreground hover:text-primary"
                title="Toggle Sidebar"
              >
                {sidebarOpen ? (
                  <Maximize2 className="w-5 h-5" />
                ) : (
                  <LayoutTemplate className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Stage Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative">
            <TrackInfo track={currentTrack} isLoading={isLoading} />

            {/* Centralized Waveform */}
            <div className="w-full max-w-4xl h-24 mt-12 md:mt-20 opacity-80 hover:opacity-100 transition-opacity">
              {currentTrack && (
                <Waveform
                  trackId={currentTrack.id}
                  progress={currentTime}
                  duration={duration}
                  onSeek={seek}
                  height={96}
                  color="hsl(var(--primary))"
                  className="mask-linear-fade"
                />
              )}
            </div>
          </div>
        </div>

        {/* Zone 2: Functional Sidebar */}
        <div
          className={cn(
            'glass border-l border-white/5 transition-all duration-500 ease-fluid flex flex-col overflow-hidden relative z-20',
            sidebarOpen
              ? 'w-[380px] translate-x-0 opacity-100'
              : 'w-0 translate-x-20 opacity-0',
          )}
        >
          <Tabs defaultValue="queue" className="flex flex-col h-full w-full">
            <div className="p-4 pb-0 shrink-0">
              <TabsList className="w-full grid grid-cols-2 bg-white/5 p-1 rounded-lg">
                <TabsTrigger
                  value="queue"
                  className="text-xs uppercase font-bold tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black"
                >
                  Queue
                </TabsTrigger>
                <TabsTrigger
                  value="effects"
                  className="text-xs uppercase font-bold tracking-wider data-[state=active]:bg-primary data-[state=active]:text-black"
                >
                  Effects
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent
                value="queue"
                className="h-full m-0 data-[state=inactive]:hidden"
              >
                <QueueList
                  queue={queue}
                  currentIndex={currentIndex}
                  onReorder={reorderQueue}
                  onRemove={removeFromQueue}
                  onSkipTo={skipToIndex}
                />
              </TabsContent>
              <TabsContent
                value="effects"
                className="h-full m-0 data-[state=inactive]:hidden"
              >
                <AudioEffectsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Zone 3: Control Bar */}
      <div className="h-24 glass border-t border-white/5 relative z-30 shrink-0">
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

      <ImportMusicDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  )
}
