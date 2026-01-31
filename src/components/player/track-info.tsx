import { Track } from '@/hooks/use-audio-player-context'
import { Music, Disc, FileAudio, Activity, Music2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TrackInfoProps {
  track: Track | undefined
  isLoading: boolean
}

export function TrackInfo({ track, isLoading }: TrackInfoProps) {
  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border h-64 w-64 md:h-80 md:w-80 mx-auto">
        <Disc className="w-16 h-16 opacity-50 animate-spin-slow" />
        <p>Aguardando Seleção...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up w-full">
      {/* Cover Art Area */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-lg overflow-hidden shadow-2xl ring-2 ring-border group bg-card transition-all">
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center relative">
            {track.isLocal ? (
              <FileAudio className="w-32 h-32 text-muted-foreground/30" />
            ) : (
              <Music className="w-32 h-32 text-muted-foreground/30" />
            )}
            {track.isLocal && (
              <div className="absolute bottom-4 bg-black/60 px-3 py-1 rounded-full text-xs text-primary backdrop-blur-sm border border-primary/20">
                LOCAL SOURCE
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Main Metadata - High Contrast for Radio Console */}
      <div className="space-y-1 w-full px-4">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight truncate text-primary uppercase drop-shadow-sm">
          {track.title}
        </h2>
        <p className="text-xl md:text-2xl text-white font-medium truncate tracking-wide">
          {track.composer}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {track.album || 'Single Track'}
        </p>
      </div>

      {/* Technical Info Pills */}
      <div className="flex justify-center flex-wrap gap-3 w-full">
        {track.bpm && (
          <Badge
            variant="outline"
            className="px-3 py-1.5 border-primary/30 text-primary bg-primary/5 uppercase tracking-wider font-mono"
          >
            <Activity className="w-3 h-3 mr-1.5" /> {track.bpm} BPM
          </Badge>
        )}
        {track.tone && (
          <Badge
            variant="outline"
            className="px-3 py-1.5 border-primary/30 text-primary bg-primary/5 uppercase tracking-wider font-mono"
          >
            <Music2 className="w-3 h-3 mr-1.5" /> {track.tone}
          </Badge>
        )}
        {track.ritual && (
          <Badge className="px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 uppercase tracking-wider">
            {track.ritual}
          </Badge>
        )}
      </div>
    </div>
  )
}
