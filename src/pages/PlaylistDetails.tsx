import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChevronLeft,
  Play,
  Sparkles,
  Clock,
  Share2,
  Wand2,
  RefreshCcw,
  Book,
} from 'lucide-react'
import { TrackRow } from '@/components/track-row'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'
import { Badge } from '@/components/ui/badge'
import { SharePlaylistDialog } from '@/components/library/share-playlist-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ritualTemplates } from '@/lib/ritual-templates'

export default function PlaylistDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentTrack,
    isPlaying,
    addToQueue,
    replaceQueue,
    skipToIndex,
    playlists,
    getPlaylistTracks,
    updatePlaylist,
  } = useAudioPlayer()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const playlist = playlists.find((p) => p.id === id)

  const tracks = useMemo(
    () => (playlist ? getPlaylistTracks(playlist) : []),
    [playlist, getPlaylistTracks],
  )

  const durationStr = useMemo(() => {
    return `${tracks.length * 3} min (aprox.)`
  }, [tracks])

  if (!playlist) return <div className="p-6">Playlist não encontrada</div>

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      replaceQueue(tracks)
      setTimeout(() => skipToIndex(0), 0)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (playlist.isSmart) return
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (
      draggedIndex === null ||
      draggedIndex === targetIndex ||
      !playlist.items
    )
      return

    const newItems = [...playlist.items]
    const [moved] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, moved)

    await updatePlaylist({ ...playlist, items: newItems })
    setDraggedIndex(null)
  }

  const handleRitualAssociation = async (ritualId: string) => {
    await updatePlaylist({ ...playlist, ritualTemplateId: ritualId })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Button
        variant="ghost"
        className="pl-0 text-muted-foreground"
        onClick={() => navigate('/playlists')}
      >
        <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-48 h-48 rounded-lg bg-secondary overflow-hidden shadow-2xl shrink-0 border border-white/10">
          {playlist.cover ? (
            <img
              src={playlist.cover}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Wand2 className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-end pb-2 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Playlist
            </span>
            {playlist.isSmart && (
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary border-primary/30 gap-1"
              >
                <Sparkles className="w-3 h-3" /> Smart
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {playlist.title}
          </h1>

          <div className="flex items-center gap-4 mb-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {durationStr}
            </span>
            <span>•</span>
            <span>{tracks.length} faixas</span>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Book className="w-3 h-3" />
              <Select
                value={playlist.ritualTemplateId || ''}
                onValueChange={handleRitualAssociation}
              >
                <SelectTrigger className="h-6 w-[180px] text-xs">
                  <SelectValue placeholder="Associar Ritual..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {ritualTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <Button
              className="bg-primary text-primary-foreground rounded-full px-8 hover:bg-primary/90"
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
            >
              <Play className="w-4 h-4 mr-2 fill-current" /> Reproduzir
            </Button>

            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setIsShareOpen(true)}
            >
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar
            </Button>
          </div>
        </div>
      </div>

      {playlist.isSmart && playlist.rules && (
        <div className="bg-secondary/10 border border-border p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
            <Wand2 className="w-4 h-4" /> Regras Ativas
          </h3>
          <div className="flex flex-wrap gap-2">
            {playlist.rules.map((rule, idx) => (
              <Badge key={idx} variant="outline" className="bg-background">
                {rule.field === 'composer' ? 'Artista' : rule.field}{' '}
                {rule.operator === 'equals' ? 'é' : 'contém'} "{rule.value}"
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-6">
          <CardTitle>Faixas</CardTitle>
          <CardDescription>
            {playlist.isSmart
              ? 'Lista atualizada automaticamente. Arraste indisponível.'
              : 'Arraste para reordenar.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-1">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <TrackRow
                key={`${track.id}-${index}`}
                track={track}
                index={index}
                isPlaying={isPlaying}
                isCurrent={currentTrack?.id === track.id}
                onPlay={() => {
                  replaceQueue(tracks)
                  setTimeout(() => skipToIndex(index), 0)
                }}
                onAddToQueue={() => addToQueue([track])}
                draggable={!playlist.isSmart}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              <p>Nenhuma música encontrada para esta playlist.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SharePlaylistDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        playlistTitle={playlist.title}
      />
    </div>
  )
}
