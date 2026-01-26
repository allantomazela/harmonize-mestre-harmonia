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

  useEffect(() => {
    const handleEsc = () => {
      if (!document.fullscreenElement) setIsFullscreen(false)
    }
    document.addEventListener('fullscreenchange', handleEsc)
    return () => document.removeEventListener('fullscreenchange', handleEsc)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-red-600 animate-pulse border border-red-400" />
          <span className="text-xl font-bold uppercase tracking-widest text-red-500">
            Live Performance Mode
          </span>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={toggleFullscreen}
            className="border-2 border-white text-white hover:bg-white hover:text-black font-bold"
          >
            <Maximize2 className="w-6 h-6" />
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={() => navigate('/player')}
            className="font-bold border-2 border-destructive"
          >
            <X className="w-6 h-6 mr-2" /> SAIR
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center gap-12 max-w-6xl mx-auto w-full">
        {/* Track Info - High Contrast */}
        <div className="text-center space-y-6">
          {currentTrack ? (
            <>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-white drop-shadow-lg">
                {currentTrack.title}
              </h1>
              <p className="text-3xl md:text-5xl text-yellow-400 font-bold font-serif">
                {currentTrack.composer}
              </p>
              <div className="flex justify-center gap-4 mt-6">
                {currentTrack.ritual && (
                  <span className="px-6 py-2 bg-blue-600 text-white rounded-full text-xl font-bold border-2 border-blue-400 uppercase">
                    {currentTrack.ritual}
                  </span>
                )}
                {currentTrack.degree && (
                  <span className="px-6 py-2 bg-gray-700 text-white rounded-full text-xl font-bold border-2 border-gray-500 uppercase">
                    {currentTrack.degree}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 opacity-50">
              <Music className="w-32 h-32" />
              <h1 className="text-5xl font-bold">Aguardando Seleção...</h1>
            </div>
          )}
        </div>

        {/* Progress - Large and Visible */}
        <div className="w-full space-y-4 px-12">
          <div className="relative h-6 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-600">
            <div
              className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-100 ease-linear"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-3xl font-mono font-bold text-white">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-400">
              -{formatTime((duration || 0) - currentTime)}
            </span>
          </div>
          {/* Slider hidden but interactive for seeking if needed, or rely on visual bar */}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(v) => seek(v[0])}
            className="opacity-0 absolute inset-x-12 h-12 cursor-pointer"
          />
        </div>

        {/* Huge Controls - High Visibility */}
        <div className="flex items-center gap-16">
          <Button
            className="h-32 w-32 rounded-full border-4 border-white bg-transparent text-white hover:bg-white hover:text-black transition-all"
            onClick={playPrev}
          >
            <SkipBack className="w-16 h-16 fill-current" />
          </Button>

          <Button
            className={cn(
              'h-48 w-48 rounded-full shadow-[0_0_80px_rgba(255,215,0,0.4)] transition-all hover:scale-105 active:scale-95 border-4',
              isPlaying
                ? 'bg-yellow-500 text-black border-yellow-300 hover:bg-yellow-400'
                : 'bg-green-600 text-white border-green-400 hover:bg-green-500',
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
            className="h-32 w-32 rounded-full border-4 border-white bg-transparent text-white hover:bg-white hover:text-black transition-all"
            onClick={playNext}
          >
            <SkipForward className="w-16 h-16 fill-current" />
          </Button>
        </div>
      </div>

      {/* Footer / Queue - Next Song Highlight */}
      <div className="mt-8 pt-8 border-t-2 border-gray-800">
        <div className="flex justify-between items-end">
          <div className="space-y-4 w-full">
            <p className="text-xl font-black uppercase tracking-widest text-gray-500">
              PRÓXIMA FAIXA
            </p>
            {nextTrack ? (
              <div className="flex items-center gap-6 bg-gray-900/50 p-6 rounded-2xl border border-gray-700">
                <div className="h-20 w-20 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-600">
                  <span className="text-4xl">🎵</span>
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-2">
                    {nextTrack.title}
                  </p>
                  <p className="text-2xl text-gray-400">{nextTrack.composer}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-2xl font-mono text-gray-500">
                    {nextTrack.duration}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-3xl text-gray-600 italic font-bold">
                -- Fim da fila --
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
