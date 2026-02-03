import { useState } from 'react'
import {
  VisualizerCanvas,
  VisualizationMode,
} from '@/components/visualizer/visualizer-canvas'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  BarChart2,
  Circle,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Visualizer() {
  const [mode, setMode] = useState<VisualizationMode>('bars')
  const [fullScreen, setFullScreen] = useState(false)

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

  return (
    <div
      className={cn(
        'relative bg-black min-h-screen flex flex-col items-center justify-center overflow-hidden',
        fullScreen ? 'p-0' : 'p-4',
      )}
    >
      {/* Controls Overlay - Hidden in full screen unless hovered */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 transition-opacity hover:opacity-100',
          fullScreen ? 'opacity-0' : 'opacity-100',
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
            className="rounded-full h-8"
          >
            <BarChart2 className="w-4 h-4 mr-2" /> Bars
          </Button>
          <Button
            variant={mode === 'circular' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('circular')}
            className="rounded-full h-8"
          >
            <Circle className="w-4 h-4 mr-2" /> Radar
          </Button>
          <Button
            variant={mode === 'particles' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('particles')}
            className="rounded-full h-8"
          >
            <Sparkles className="w-4 h-4 mr-2" /> Nebula
          </Button>
        </div>

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

      {/* Canvas */}
      <div className="w-full h-full absolute inset-0">
        <VisualizerCanvas mode={mode} />
      </div>

      {/* Overlay Info */}
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-50 text-white font-mono text-xs">
        VJ MODE: {mode.toUpperCase()}
      </div>
    </div>
  )
}
