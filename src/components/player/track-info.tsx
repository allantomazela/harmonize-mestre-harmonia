import { Track } from '@/hooks/use-audio-player'
import { Card } from '@/components/ui/card'

interface TrackInfoProps {
  track: Track
}

export function TrackInfo({ track }: TrackInfoProps) {
  if (!track) return null

  return (
    <div className="flex flex-col items-center space-y-6">
      <Card className="w-full max-w-sm aspect-square overflow-hidden rounded-xl border-none shadow-2xl relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-6xl">🎵</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-left">
          <h2 className="text-2xl font-bold text-white drop-shadow-md line-clamp-1">
            {track.title}
          </h2>
          <p className="text-lg text-gray-200 drop-shadow-sm font-medium">
            {track.composer}
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white border border-white/10">
              {track.ritual}
            </span>
            <span className="text-xs bg-white/20 backdrop-blur-md px-2 py-1 rounded-full text-white border border-white/10">
              {track.degree}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
