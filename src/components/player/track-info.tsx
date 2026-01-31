import { Track } from '@/hooks/use-audio-player-context'
import { Music, Disc, FileAudio, Activity, Music2, Radio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TrackInfoProps {
  track: Track | undefined
  isLoading: boolean
}

export function TrackInfo({ track, isLoading }: TrackInfoProps) {
  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 text-muted-foreground bg-card/30 rounded-3xl border-2 border-dashed border-border/50 h-[350px] w-[350px] mx-auto animate-pulse">
        <div className="p-6 bg-secondary/20 rounded-full">
          <Radio className="w-16 h-16 opacity-30" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-medium tracking-wide">SYSTEM READY</p>
          <p className="text-xs uppercase tracking-widest opacity-60">
            Awaiting Media Selection
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up w-full max-w-xl mx-auto">
      {/* Cover Art Area */}
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700" />

        <div
          className={cn(
            'relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-card transition-all duration-500',
            isLoading && 'scale-[0.98] opacity-80',
          )}
        >
          {track.cover ? (
            <img
              src={track.cover}
              alt={track.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-card flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50" />
              {track.isLocal ? (
                <FileAudio className="w-32 h-32 text-muted-foreground/20" />
              ) : (
                <Music className="w-32 h-32 text-muted-foreground/20" />
              )}
            </div>
          )}

          {/* Local Badge Overlay */}
          {track.isLocal && (
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">
                Local DB
              </span>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-10">
              <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Main Metadata */}
      <div className="space-y-2 w-full px-4">
        <h2
          className="text-3xl md:text-5xl font-black tracking-tight leading-none text-white drop-shadow-lg line-clamp-2"
          title={track.title}
        >
          {track.title}
        </h2>
        <p className="text-xl md:text-2xl text-primary font-medium truncate tracking-wide font-serif opacity-90">
          {track.composer}
        </p>
        <p className="text-sm text-muted-foreground truncate uppercase tracking-widest font-medium opacity-60 pt-1">
          {track.album || 'Unknown Album'}
        </p>
      </div>

      {/* Technical Info Pills */}
      <div className="flex justify-center flex-wrap gap-3 w-full">
        {track.bpm && (
          <Badge
            variant="outline"
            className="px-4 py-1.5 border-white/10 bg-white/5 text-white hover:bg-white/10 uppercase tracking-wider font-mono text-xs backdrop-blur-sm"
          >
            <Activity className="w-3 h-3 mr-2 text-primary" /> {track.bpm} BPM
          </Badge>
        )}
        {track.tone && (
          <Badge
            variant="outline"
            className="px-4 py-1.5 border-white/10 bg-white/5 text-white hover:bg-white/10 uppercase tracking-wider font-mono text-xs backdrop-blur-sm"
          >
            <Music2 className="w-3 h-3 mr-2 text-primary" /> {track.tone}
          </Badge>
        )}
        {track.ritual && (
          <Badge className="px-4 py-1.5 bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 uppercase tracking-wider text-xs">
            {track.ritual}
          </Badge>
        )}
      </div>
    </div>
  )
}
