import { useState, useEffect } from 'react'
import {
  VisualizerCanvas,
  VisualizationMode,
} from '@/components/visualizer/visualizer-canvas'
import { VJOverlay } from '@/components/visualizer/vj-overlay'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  BarChart2,
  Circle,
  Sparkles,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'

export default function Visualizer() {
  const [mode, setMode] = useState<VisualizationMode>('bars')
  const [fullScreen, setFullScreen] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const { isCorsRestricted, currentTrack } = useAudioPlayer()

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setFullScreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setFullScreen(false)
      }
    }
  }

  // Handle escape key for fullscreen state sync
  useEffect(() => {
    const handleChange = () => {
      setFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  return (
    <div
      className={cn(
        'relative bg-black min-h-screen flex flex-col items-center justify-center overflow-hidden font-sans',
        fullScreen ? 'p-0 cursor-none' : 'p-4',
        // Show cursor on hover/interaction even in fullscreen
        fullScreen && 'hover:cursor-default',
      )}
    >
      {/* Controls Overlay - Hidden in full screen unless hovered */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 transition-all duration-300',
          fullScreen
            ? 'opacity-0 hover:opacity-100 -translate-y-full hover:translate-y-0'
            : 'opacity-100 translate-y-0',
        )}
      >
        <Link to="/live-mode">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Live Mode
          </Button>
        </Link>

        <div className="flex gap-2 bg-black/50 backdrop-blur rounded-full p-1 border border-white/10">
          <Button
            variant={mode === 'bars' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('bars')}
            className={cn(
              'rounded-full h-8',
              mode === 'bars' && 'bg-[#CCFF00] text-black hover:bg-[#b3e600]',
            )}
            disabled={isCorsRestricted}
          >
            <BarChart2 className="w-4 h-4 mr-2" /> Bars
          </Button>
          <Button
            variant={mode === 'circular' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('circular')}
            className={cn(
              'rounded-full h-8',
              mode === 'circular' &&
                'bg-[#CCFF00] text-black hover:bg-[#b3e600]',
            )}
            disabled={isCorsRestricted}
          >
            <Circle className="w-4 h-4 mr-2" /> Radar
          </Button>
          <Button
            variant={mode === 'particles' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('particles')}
            className={cn(
              'rounded-full h-8',
              mode === 'particles' &&
                'bg-[#CCFF00] text-black hover:bg-[#b3e600]',
            )}
            disabled={isCorsRestricted}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Nebula
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowOverlay(!showOverlay)}
            className="text-white hover:bg-white/10"
            title="Toggle Overlay"
          >
            {showOverlay ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullScreen}
            className="text-white border-white/20 hover:bg-white/10"
          >
            {fullScreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="w-full h-full absolute inset-0">
        <VisualizerCanvas mode={mode} />
      </div>

      {/* VJ Dynamic Overlay */}
      {currentTrack && <VJOverlay track={currentTrack} show={showOverlay} />}

      {/* Restricted Overlay */}
      {isCorsRestricted && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Visualização Indisponível</h2>
          <p className="text-white/60 max-w-md">
            O arquivo de áudio atual é proveniente de uma fonte externa que não
            permite acesso aos dados de frequência (CORS). A reprodução continua
            ativa, mas os efeitos visuais foram suspensos.
          </p>
          <Button
            variant="outline"
            className="mt-8 border-white/20 text-white hover:bg-white/10"
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
        </div>
      )}

      {/* Overlay Info */}
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-50 text-white font-mono text-xs">
        VJ MODE: {isCorsRestricted ? 'OFFLINE' : mode.toUpperCase()}{' '}
        <span className="text-[#CCFF00]">●</span>{' '}
        {fullScreen ? 'FULLSCREEN' : 'WINDOWED'}
      </div>
    </div>
  )
}
