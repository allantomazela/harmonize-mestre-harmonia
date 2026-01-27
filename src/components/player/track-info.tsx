import { Track } from '@/hooks/use-audio-player-context'
import { Music, Disc, FileAudio } from 'lucide-react'

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
    <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up">
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

      <div className="space-y-2 max-w-lg w-full px-4">
        <h2 className="text-3xl font-bold tracking-tight leading-tight truncate">
          {track.title}
        </h2>
        <p className="text-xl text-muted-foreground font-medium truncate">
          {track.composer}
        </p>

        <div className="flex justify-center flex-wrap gap-2 pt-2">
          {track.bpm && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-mono font-medium border border-border">
              {track.bpm} BPM
            </span>
          )}
          {track.tone && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-secondary text-foreground font-mono font-medium border border-border">
              {track.tone}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
