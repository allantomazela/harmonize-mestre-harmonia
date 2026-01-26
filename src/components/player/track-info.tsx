import { Track } from '@/hooks/use-audio-player'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TrackInfoProps {
  track: Track | undefined
  isLoading?: boolean
}

export function TrackInfo({ track, isLoading }: TrackInfoProps) {
  if (isLoading && !track) {
    return (
      <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
        <Skeleton className="w-full aspect-square rounded-xl" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    )
  }

  if (!track) return null

  return (
    <div className="flex flex-col items-center space-y-6">
      <Card className="w-full max-w-sm aspect-square overflow-hidden rounded-xl border-none shadow-2xl relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title || 'Capa do álbum'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-6xl">🎵</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-left">
          <h2 className="text-2xl font-bold text-white drop-shadow-md line-clamp-1">
            {track.title || 'Sem Título'}
          </h2>
          <p className="text-lg text-gray-200 drop-shadow-sm font-medium">
            {track.composer || 'Desconhecido'}
          </p>
          <div className="flex gap-2 mt-2">
            {track.ritual && (
              <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white border border-white/10">
                {track.ritual}
              </span>
            )}
            {track.degree && (
              <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white border border-white/10">
                {track.degree}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
