import { Track } from '@/hooks/use-audio-player-context'
import { Music, Activity, Music2, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TrackInfoProps {
  track: Track | undefined
  isLoading: boolean
}

export function TrackInfo({ track, isLoading }: TrackInfoProps) {
  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-pulse opacity-50">
        <div className="w-64 h-64 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center bg-white/5">
          <Radio className="w-16 h-16 text-muted-foreground/30" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase">
            System Idle
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center space-y-10 animate-fade-in-up w-full max-w-2xl mx-auto z-10">
      {/* Cover Art Area with Reactive Glow */}
      <div className="relative group">
        {/* Animated Glow Behind */}
        <div className="absolute -inset-4 bg-primary/20 blur-[60px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-1000 animate-pulse-glow" />

        <div
          className={cn(
            'relative w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black transition-all duration-700',
            isLoading && 'scale-[0.98] opacity-80 blur-[2px]',
          )}
        >
          {track.cover ? (
            <img
              src={track.cover}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50" />
              <Music className="w-32 h-32 text-muted-foreground/20" />
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20">
              <div className="h-16 w-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Main Metadata */}
      <div className="space-y-4 w-full px-6">
        <h2
          className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white drop-shadow-2xl line-clamp-2 mix-blend-screen"
          title={track.title}
        >
          {track.title}
        </h2>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xl md:text-2xl text-primary font-medium tracking-wide font-serif opacity-90 text-glow">
            {track.composer}
          </p>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-60">
            {track.album || 'Unknown Album'}
          </p>
        </div>
      </div>

      {/* Technical Badges */}
      <div className="flex flex-wrap justify-center gap-3">
        {track.bpm && (
          <Badge
            variant="outline"
            className="h-7 px-3 gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-md uppercase tracking-widest font-mono text-[10px]"
          >
            <Activity className="w-3 h-3" /> {track.bpm} BPM
          </Badge>
        )}
        {track.tone && (
          <Badge
            variant="outline"
            className="h-7 px-3 gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-md uppercase tracking-widest font-mono text-[10px]"
          >
            <Music2 className="w-3 h-3" /> Key: {track.tone}
          </Badge>
        )}
        {track.ritual && (
          <Badge className="h-7 px-3 bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10 uppercase tracking-widest text-[10px]">
            {track.ritual}
          </Badge>
        )}
      </div>
    </div>
  )
}
