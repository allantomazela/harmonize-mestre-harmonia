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
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border h-80 w-80 mx-auto">
        <Disc className="w-16 h-16 opacity-50 animate-spin-slow" />
        <p>Nenhuma música selecionada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-fade-in-up w-full max-w-lg mx-auto">
      {/* Cover Art Area */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group bg-card transition-all hover:scale-[1.02]">
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black/20" />
            {track.isLocal ? (
              <FileAudio className="w-32 h-32 text-white/20" />
            ) : (
              <Music className="w-32 h-32 text-white/20" />
            )}
            {track.isLocal && (
              <div className="absolute bottom-4 bg-black/50 px-3 py-1 rounded-full text-xs text-white/70 backdrop-blur-sm">
                Arquivo Local
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Main Metadata */}
      <div className="space-y-2 w-full px-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight truncate">
          {track.title}
        </h2>
        <p className="text-xl text-muted-foreground font-medium truncate">
          {track.composer}
        </p>

        {/* Detailed Technical Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 w-full">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">
                BPM
              </span>
            </div>
            <span className="text-2xl font-bold font-mono text-foreground">
              {track.bpm || '--'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <Music2 className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">
                Tom
              </span>
            </div>
            <span className="text-2xl font-bold font-mono text-foreground">
              {track.tone || '--'}
            </span>
          </div>
        </div>

        {/* Additional Tags */}
        <div className="flex justify-center flex-wrap gap-2 pt-4">
          {track.ritual && (
            <Badge
              variant="outline"
              className="px-3 py-1 border-primary/20 text-primary bg-primary/5"
            >
              {track.ritual}
            </Badge>
          )}
          {track.degree && (
            <Badge variant="outline" className="px-3 py-1">
              {track.degree}
            </Badge>
          )}
          {track.occasion && (
            <Badge variant="secondary" className="px-3 py-1">
              {track.occasion}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
