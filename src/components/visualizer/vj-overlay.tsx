import { Track } from '@/hooks/use-audio-player-context'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Music2, Activity } from 'lucide-react'

interface VJOverlayProps {
  track: Track
  show: boolean
}

export function VJOverlay({ track, show }: VJOverlayProps) {
  return (
    <div
      className={cn(
        'absolute top-12 right-12 flex flex-col items-end text-right space-y-4 transition-all duration-1000 ease-in-out pointer-events-none z-50',
        show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10',
      )}
    >
      <div className="space-y-1">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#CCFF00] drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] leading-none animate-in slide-in-from-right-10 duration-700">
          {track.title}
        </h1>
        <p className="text-3xl md:text-5xl font-serif italic text-white/90 drop-shadow-md animate-in slide-in-from-right-10 duration-1000 delay-100">
          {track.composer}
        </p>
      </div>

      <div className="flex gap-3 flex-wrap justify-end animate-in fade-in zoom-in duration-700 delay-300">
        {track.ritual && (
          <Badge
            variant="outline"
            className="text-lg py-1 px-4 border-[#CCFF00] text-[#CCFF00] bg-black/50 backdrop-blur-md uppercase tracking-widest shadow-[0_0_10px_rgba(204,255,0,0.3)]"
          >
            {track.ritual}
          </Badge>
        )}

        {track.degree && (
          <Badge
            variant="outline"
            className="text-lg py-1 px-4 border-white/50 text-white bg-black/50 backdrop-blur-md uppercase tracking-widest"
          >
            {track.degree}
          </Badge>
        )}

        {track.bpm && (
          <Badge
            variant="secondary"
            className="text-lg py-1 px-4 bg-white/10 text-white backdrop-blur-md gap-2"
          >
            <Activity className="w-4 h-4 text-[#CCFF00]" /> {track.bpm} BPM
          </Badge>
        )}
      </div>

      <div className="h-1 w-32 bg-[#CCFF00] rounded-full shadow-[0_0_20px_#CCFF00] animate-pulse" />
    </div>
  )
}
