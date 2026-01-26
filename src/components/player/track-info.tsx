import { Track } from '@/hooks/use-audio-player-context'
import { Music, Disc } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface TrackInfoProps {
  track: Track | undefined
  isLoading: boolean
}

export function TrackInfo({ track, isLoading }: TrackInfoProps) {
  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border">
        <Disc className="w-16 h-16 opacity-50 animate-spin-slow" />
        <p>Nenhuma música selecionada</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
            <Music className="w-24 h-24 text-white/20" />
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="space-y-2 max-w-md w-full">
        <h2 className="text-2xl font-bold tracking-tight leading-none truncate">
          {track.title}
        </h2>
        <p className="text-lg text-muted-foreground font-medium truncate">
          {track.composer}
        </p>
        <div className="flex justify-center gap-2 pt-2">
          {track.ritual && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {track.ritual}
            </span>
          )}
          {track.degree && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
              {track.degree}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
