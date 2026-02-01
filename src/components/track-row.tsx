import { Track } from '@/hooks/use-audio-player-context'
import {
  MoreHorizontal,
  Play,
  Pause,
  ListPlus,
  Trash2,
  Edit,
  Music,
  Folder,
  BarChart2,
  CloudDownload,
  CloudOff,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAudioPlayer } from '@/hooks/use-audio-player-context'

interface TrackRowProps {
  track: Track
  index?: number
  isPlaying?: boolean
  isCurrent?: boolean
  onPlay?: () => void
  onAddToQueue?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onMoveToFolder?: (folderId: string | undefined) => void
  isSelected?: boolean
  onSelect?: () => void
  showSelect?: boolean
  showAlbum?: boolean
  folders?: { id: string; name: string }[]
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
}

export function TrackRow({
  track,
  index,
  isPlaying,
  isCurrent,
  onPlay,
  onAddToQueue,
  onEdit,
  onDelete,
  onMoveToFolder,
  isSelected,
  onSelect,
  showSelect = false,
  showAlbum = true,
  folders = [],
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: TrackRowProps) {
  const { downloadTrackForOffline, removeTrackFromOffline } = useAudioPlayer()

  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-2 rounded-md hover:bg-secondary/30 transition-colors border border-transparent',
        isSelected && 'bg-secondary/40 border-primary/10',
        isCurrent && 'bg-primary/5',
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Drag Handle */}
      {draggable && (
        <div className="cursor-grab text-muted-foreground/50 hover:text-primary">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Select / Index / Play */}
      <div className="flex items-center justify-center w-8 md:w-10 flex-shrink-0">
        {showSelect ? (
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect?.()} />
        ) : (
          <div className="relative flex items-center justify-center w-full h-8">
            <span
              className={cn(
                'text-sm font-medium text-muted-foreground group-hover:hidden',
                isCurrent && 'text-primary animate-pulse',
              )}
            >
              {isCurrent && isPlaying ? (
                <BarChart2 className="w-4 h-4" />
              ) : (
                (index ?? 0) + 1
              )}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute hidden group-hover:flex h-8 w-8',
                isCurrent && 'flex text-primary',
              )}
              onClick={(e) => {
                e.stopPropagation()
                onPlay?.()
              }}
            >
              {isCurrent && isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Cover Art */}
      <div className="h-10 w-10 md:h-12 md:w-12 rounded bg-secondary flex-shrink-0 overflow-hidden relative border border-border">
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-medium text-sm truncate leading-tight',
              isCurrent ? 'text-primary' : 'text-foreground',
            )}
          >
            {track.title}
          </h4>
          {track.offlineAvailable && (
            <span className="text-green-500" title="Disponível Offline">
              <CloudDownload className="w-3 h-3" />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate group-hover:text-foreground/80 transition-colors">
          {track.composer}
        </p>
      </div>

      {/* Album (Desktop) */}
      {showAlbum && (
        <div className="hidden md:flex flex-1 min-w-0 text-sm text-muted-foreground truncate">
          {track.album || track.genre || '-'}
        </div>
      )}

      {/* Metadata Tags */}
      <div className="hidden lg:flex gap-2 items-center">
        {track.bpm && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            {track.bpm} BPM
          </span>
        )}
        {track.tone && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
            {track.tone}
          </span>
        )}
      </div>

      {/* Duration */}
      <div className="text-sm text-muted-foreground w-12 text-right hidden sm:block">
        {track.duration}
      </div>

      {/* Actions */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={onPlay}>
              <Play className="w-4 h-4 mr-2" /> Reproduzir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddToQueue}>
              <ListPlus className="w-4 h-4 mr-2" /> Adicionar à Fila
            </DropdownMenuItem>

            {track.offlineAvailable ? (
              <DropdownMenuItem onClick={() => removeTrackFromOffline(track)}>
                <CloudOff className="w-4 h-4 mr-2 text-destructive" /> Remover
                do Offline
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => downloadTrackForOffline(track)}>
                <CloudDownload className="w-4 h-4 mr-2 text-primary" />{' '}
                Disponibilizar Offline
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> Editar Metadados
              </DropdownMenuItem>
            )}
            {onMoveToFolder && (
              <>
                <DropdownMenuItem
                  onClick={() => onMoveToFolder(undefined)}
                  disabled={!track.folderId}
                >
                  <Folder className="w-4 h-4 mr-2" /> Mover para Raiz
                </DropdownMenuItem>
                {folders.map((f) => (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => onMoveToFolder(f.id)}
                    disabled={track.folderId === f.id}
                  >
                    <Folder className="w-4 h-4 mr-2" /> Mover para {f.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Remover
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
