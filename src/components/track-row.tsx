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
  CheckCircle,
  GripVertical,
  Loader2,
  WifiOff,
  Cloud,
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
  const {
    downloadTrackForOffline,
    removeTrackFromOffline,
    downloadProgress,
    isOfflineMode,
  } = useAudioPlayer()

  const downloadPercentage = downloadProgress[track.id]
  const isDownloading = downloadPercentage !== undefined

  // Determine offline status icon
  const getOfflineStatus = () => {
    if (isDownloading) {
      return (
        <div className="flex flex-col items-center justify-center w-8 h-8 relative">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-[8px] absolute top-5 font-bold text-primary">
            {downloadPercentage}%
          </span>
        </div>
      )
    }

    if (track.offlineAvailable) {
      return (
        <div
          title="Disponível Offline"
          className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20"
        >
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
        </div>
      )
    }

    // Only show Cloud icon if online and not downloaded
    if (!isOfflineMode) {
      if (track.file) return null // Should be handled by offlineAvailable, but as safety

      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            downloadTrackForOffline(track)
          }}
          title="Baixar para Offline"
        >
          <Cloud className="w-4 h-4" />
        </Button>
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all border',
        isSelected
          ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(191,255,0,0.05)]'
          : 'border-transparent',
        isCurrent &&
          !isSelected &&
          'bg-gradient-to-r from-primary/10 to-transparent border-primary/20',
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={(e) => {
        // Allow clicking row to toggle selection if in selection mode, or play?
        // Default behavior: Click on Play button to play. Click on checkbox to select.
        // We can allow clicking empty space to select if we want, but let's stick to explicit controls to avoid confusion.
      }}
    >
      {/* Drag Handle */}
      {draggable && (
        <div className="cursor-grab text-muted-foreground/50 hover:text-primary">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Checkbox Column */}
      {showSelect && (
        <div className="flex items-center justify-center w-8 flex-shrink-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect?.()}
            className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:text-black transition-all"
          />
        </div>
      )}

      {/* Index / Play */}
      <div className="flex items-center justify-center w-8 md:w-10 flex-shrink-0 text-center">
        <div className="relative flex items-center justify-center w-full h-8">
          <span
            className={cn(
              'text-sm font-medium text-muted-foreground group-hover:hidden',
              isCurrent && 'text-primary font-bold',
            )}
          >
            {isCurrent && isPlaying ? (
              <BarChart2 className="w-4 h-4 animate-pulse" />
            ) : (
              (index ?? 0) + 1
            )}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute hidden group-hover:flex h-8 w-8 rounded-full hover:bg-primary hover:text-black transition-colors',
              isCurrent && 'flex text-primary hover:text-black',
            )}
            onClick={(e) => {
              e.stopPropagation()
              onPlay?.()
            }}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Cover Art */}
      <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-secondary flex-shrink-0 overflow-hidden relative border border-white/10 shadow-sm group-hover:shadow-md transition-all">
        {track.cover ? (
          <img
            src={track.cover}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
            <Music className="w-5 h-5 text-zinc-700" />
          </div>
        )}
        {/* Progress Overlay */}
        {isDownloading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${downloadPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              'font-semibold text-sm truncate leading-tight',
              isCurrent ? 'text-primary' : 'text-zinc-100',
            )}
          >
            {track.title}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground truncate group-hover:text-zinc-400 transition-colors">
          {track.composer}
        </p>
      </div>

      {/* Album (Desktop) */}
      {showAlbum && (
        <div className="hidden md:flex flex-1 min-w-0 text-sm text-zinc-500 truncate">
          {track.album || track.genre || '-'}
        </div>
      )}

      {/* Offline Status */}
      <div className="flex items-center justify-center w-10">
        {getOfflineStatus()}
      </div>

      {/* Duration */}
      <div className="text-sm font-medium text-zinc-500 w-12 text-right hidden sm:block">
        {track.duration}
      </div>

      {/* Actions */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
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

            <DropdownMenuSeparator />

            {track.offlineAvailable ? (
              <DropdownMenuItem onClick={() => removeTrackFromOffline(track)}>
                <WifiOff className="w-4 h-4 mr-2 text-destructive" /> Remover do
                Offline
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => downloadTrackForOffline(track)}>
                <CloudDownload className="w-4 h-4 mr-2 text-primary" /> Baixar
                para Offline
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
