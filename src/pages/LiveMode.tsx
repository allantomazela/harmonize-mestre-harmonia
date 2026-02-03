import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Maximize2,
  Music,
  Activity,
  MonitorPlay,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AudioEffectsPanel } from '@/components/player/audio-effects-panel'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function LiveMode() {
  const navigate = useNavigate()
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    currentTime,
    duration,
    seek,
    queue,
    currentIndex,
    volume,
    setVolume,
  } = useAudioPlayer()

  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextTrack = queue[currentIndex + 1]

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement) setIsFullscreen(false)
    }
    document.addEventListener('fullscreenchange', handleEsc)
    return () => document.removeEventListener('fullscreenchange', handleEsc)
  }, [])

  const remainingTime = duration - currentTime

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-8 animate-in fade-in duration-500 font-sans relative overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/5 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-4 bg-card/50 backdrop-blur px-6 py-3 rounded-full border border-white/10">
          <div className="h-4 w-4 rounded-full bg-red-600 animate-pulse border border-red-400 shadow-[0_0_10px_red]" />
          <span className="text-xl font-bold uppercase tracking-[0.2em] text-white">
            Live On Air
          </span>
        </div>

        <div className="flex gap-4">
          <Link to="/visualizer">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-primary/50 text-primary hover:bg-primary/20 rounded-full uppercase font-bold tracking-wider"
            >
              <MonitorPlay className="w-5 h-5 mr-2" /> VJ Mode
            </Button>
          </Link>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/20 text-white hover:bg-white/10 rounded-full"
              >
                <Activity className="w-5 h-5 mr-2" /> FX
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] border-border bg-black/90 p-0 mr-4">
              <AudioEffectsPanel />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="lg"
            onClick={toggleFullscreen}
            className="border-2 border-white/20 text-white hover:bg-white hover:text-black font-bold h-14 w-14 rounded-full p-0"
          >
            <Maximize2 className="w-6 h-6" />
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => navigate('/player')}
            className="font-bold border-2 border-destructive h-14 px-8 rounded-full uppercase tracking-wider"
          >
            <X className="w-6 h-6 mr-2" /> EXIT
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center gap-12 max-w-7xl mx-auto w-full relative z-10">
        {/* Track Info - Ultra Large */}
        <div className="text-center space-y-6 max-w-5xl">
          {currentTrack ? (
            <>
              <h1 className="text-6xl md:text-9xl font-black tracking-tight leading-[0.9] text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] line-clamp-2">
                {currentTrack.title}
              </h1>
              <p className="text-3xl md:text-6xl text-primary font-bold font-serif opacity-90 drop-shadow-md">
                {currentTrack.composer}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6 opacity-30">
              <Music className="w-48 h-48" />
              <h1 className="text-6xl font-bold uppercase tracking-widest">
                Standby
              </h1>
            </div>
          )}
        </div>

        {/* Progress - Massive & Interactive */}
        <div className="w-full space-y-4 px-4 md:px-20">
          <div className="relative h-16 w-full bg-white/5 rounded-full overflow-hidden border-2 border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
            <div
              className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_30px_hsl(var(--primary))] transition-all duration-100 ease-linear"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-5xl md:text-6xl font-mono font-bold text-white tracking-tighter">
            <span className="text-glow">{formatTime(currentTime)}</span>
            <span
              className={cn(
                'transition-colors',
                remainingTime < 10
                  ? 'text-destructive animate-pulse'
                  : 'text-white/50',
              )}
            >
              -{formatTime(remainingTime)}
            </span>
          </div>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(v) => seek(v[0])}
            className="opacity-0 absolute inset-x-20 h-24 cursor-pointer"
          />
        </div>

        {/* Huge Controls */}
        <div className="flex items-center gap-12 md:gap-24">
          <Button
            className="h-32 w-32 rounded-full border-4 border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all hover:scale-110"
            onClick={playPrev}
          >
            <SkipBack className="w-16 h-16 fill-current" />
          </Button>

          <Button
            className={cn(
              'h-48 w-48 rounded-full shadow-[0_0_80px_rgba(191,255,0,0.3)] transition-all hover:scale-105 active:scale-95 border-[6px]',
              isPlaying
                ? 'bg-transparent text-primary border-primary hover:bg-primary/20'
                : 'bg-primary text-black border-primary hover:bg-primary/90',
            )}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-24 h-24 fill-current" />
            ) : (
              <Play className="w-24 h-24 fill-current ml-4" />
            )}
          </Button>

          <Button
            className="h-32 w-32 rounded-full border-4 border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all hover:scale-110"
            onClick={playNext}
          >
            <SkipForward className="w-16 h-16 fill-current" />
          </Button>
        </div>
      </div>

      {/* Footer / Queue - Next Song Highlight */}
      <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-6 w-full max-w-4xl">
            <p className="text-xl font-black uppercase tracking-[0.3em] text-white/40">
              UP NEXT
            </p>
            {nextTrack ? (
              <div className="flex items-center gap-8 bg-card/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
                <div className="h-24 w-24 bg-black/50 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                  {nextTrack.cover ? (
                    <img
                      src={nextTrack.cover}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-10 h-10 text-white/30" />
                  )}
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1 line-clamp-1">
                    {nextTrack.title}
                  </p>
                  <p className="text-2xl text-primary font-medium">
                    {nextTrack.composer}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-3xl font-mono text-white/50 font-bold">
                    {nextTrack.duration}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-4xl text-white/20 italic font-bold">
                -- End of Playlist --
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 bg-black/50 p-4 rounded-xl border border-white/10">
            <span className="text-sm font-bold uppercase text-white/60">
              Master Vol
            </span>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={(v) => setVolume(v[0])}
              className="w-48"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
