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
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

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

  // Handle escape to exit fullscreen
  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement) setIsFullscreen(false)
    }
    document.addEventListener('fullscreenchange', handleEsc)
    return () => document.removeEventListener('fullscreenchange', handleEsc)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 opacity-70">
          <div className="h-3 w-3 rounded-full bg-red-600 animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Live Presentation Mode
          </span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/10"
          >
            <Maximize2 className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/player')}
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center gap-12 max-w-5xl mx-auto w-full">
        {/* Track Info */}
        <div className="text-center space-y-4">
          {currentTrack ? (
            <>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                {currentTrack.title}
              </h1>
              <p className="text-2xl md:text-3xl text-white/60 font-serif">
                {currentTrack.composer}
              </p>
              <div className="flex justify-center gap-3 mt-4">
                {currentTrack.ritual && (
                  <span className="px-4 py-1 bg-white/10 rounded-full text-sm border border-white/20">
                    {currentTrack.ritual}
                  </span>
                )}
                {currentTrack.degree && (
                  <span className="px-4 py-1 bg-white/10 rounded-full text-sm border border-white/20">
                    {currentTrack.degree}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-50">
              <Music className="w-24 h-24" />
              <h1 className="text-4xl">Aguardando Seleção...</h1>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="w-full space-y-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(v) => seek(v[0])}
            className="h-4 cursor-pointer [&>span:first-child]:h-4 [&>span:first-child]:bg-white/20 [&>span:first-child>span]:bg-primary [&>span:last-child]:h-8 [&>span:last-child]:w-8 [&>span:last-child]:border-4"
          />
          <div className="flex justify-between text-xl font-mono text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime((duration || 0) - currentTime)}</span>
          </div>
        </div>

        {/* Huge Controls */}
        <div className="flex items-center gap-12">
          <Button
            variant="ghost"
            className="h-24 w-24 rounded-full hover:bg-white/10 text-white"
            onClick={playPrev}
          >
            <SkipBack className="w-12 h-12 fill-current" />
          </Button>

          <Button
            className={cn(
              'h-32 w-32 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95',
              isPlaying ? 'bg-primary text-black' : 'bg-white text-black',
            )}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-16 h-16 fill-current" />
            ) : (
              <Play className="w-16 h-16 fill-current ml-2" />
            )}
          </Button>

          <Button
            variant="ghost"
            className="h-24 w-24 rounded-full hover:bg-white/10 text-white"
            onClick={playNext}
          >
            <SkipForward className="w-12 h-12 fill-current" />
          </Button>
        </div>
      </div>

      {/* Footer / Queue */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-white/40">
              A Seguir
            </p>
            {nextTrack ? (
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/10 rounded flex items-center justify-center">
                  <span className="text-xl">🎵</span>
                </div>
                <div>
                  <p className="text-xl font-semibold">{nextTrack.title}</p>
                  <p className="text-white/60">{nextTrack.composer}</p>
                </div>
              </div>
            ) : (
              <p className="text-xl text-white/40 italic">Fim da fila</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
