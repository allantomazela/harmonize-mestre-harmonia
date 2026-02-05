import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import {
  Trash,
  Play,
  LayoutGrid,
  List,
  FolderInput,
  Folder,
  Plus,
  WifiOff,
  Wifi,
  CloudDownload,
} from 'lucide-react'
import { useAudioPlayer, Track } from '@/hooks/use-audio-player-context'
import { saveTrack, deleteTrack } from '@/lib/storage'
import { FolderSidebar } from '@/components/library/folder-sidebar'
import { EditTrackDialog } from '@/components/library/edit-track-dialog'
import { CreatePlaylistDialog } from '@/components/library/create-playlist-dialog'
import { ImportStreamDialog } from '@/components/library/import-stream-dialog'
import { TrackRow } from '@/components/track-row'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export default function Library() {
  const {
    library,
    folders,
    refreshLibrary,
    replaceQueue,
    addToQueue,
    skipToIndex,
    createFolder,
    removeFolder,
    updateTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    createPlaylist,
    isOfflineMode,
    toggleOfflineMode,
  } = useAudioPlayer()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [trackToEdit, setTrackToEdit] = useState<Track | null>(null)
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [filters, setFilters] = useState<{
    genres: string[]
    composers: string[]
    albums: string[]
  }>({ genres: [], composers: [], albums: [] })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const libraryTracks = library.filter((track) => {
    // 1. Text Search
    const matchesSearch =
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.composer.toLowerCase().includes(search.toLowerCase())

    // 2. Folder
    const matchesFolder = currentFolderId
      ? track.folderId === currentFolderId
      : true

    // 3. Advanced Filters
    const matchesGenre =
      filters.genres.length === 0 ||
      (track.genre && filters.genres.includes(track.genre))
    const matchesComposer =
      filters.composers.length === 0 ||
      (track.composer && filters.composers.includes(track.composer))
    const matchesAlbum =
      filters.albums.length === 0 ||
      (track.album && filters.albums.includes(track.album))

    return (
      matchesSearch &&
      matchesFolder &&
      matchesGenre &&
      matchesComposer &&
      matchesAlbum
    )
  })

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    let importedCount = 0
    const failedFiles = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const id = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        const parts = fileName.split('-')
        const title = parts.length > 1 ? parts[1].trim() : fileName
        const composer =
          parts.length > 1 ? parts[0].trim() : 'Artista Desconhecido'

        await saveTrack({
          id,
          title,
          composer,
          file,
          duration: '0:00', // You might want to get actual duration
          addedAt: Date.now(),
          degree: 'Geral',
          ritual: 'Livre',
          folderId: currentFolderId || undefined,
          offlineAvailable: true,
        })
        importedCount++
      } catch (e) {
        console.error('Error saving file', file.name, e)
        failedFiles.push(file.name)
      }
    }

    if (importedCount > 0) {
      toast({
        title: 'Importação Concluída',
        description: `${importedCount} arquivos adicionados.`,
      })
      refreshLibrary()
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: string) => {
    await deleteTrack(id)
    toast({
      title: 'Faixa Removida',
      description: 'Arquivo excluído do armazenamento local.',
    })
    refreshLibrary()
  }

  const handleBulkDelete = async () => {
    for (const id of selectedItems) {
      // Allow deleting any track ID prefix
      await deleteTrack(id)
    }
    toast({
      title: 'Exclusão em Massa',
      description: 'Itens selecionados foram removidos.',
    })
    setSelectedItems([])
    refreshLibrary()
  }

  const handleMoveToFolder = async (folderId: string | undefined) => {
    for (const id of selectedItems) {
      const track = library.find((t) => t.id === id)
      if (track) {
        await updateTrack({ ...track, folderId })
      }
    }
    toast({
      title: 'Arquivos Movidos',
      description: `${selectedItems.length} arquivos movidos com sucesso.`,
    })
    setSelectedItems([])
  }

  const handlePlayContext = (startIndex: number = 0) => {
    if (libraryTracks.length > 0) {
      replaceQueue(libraryTracks)
      setTimeout(() => skipToIndex(startIndex), 0)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:flex-row gap-6 p-4 max-w-[1600px] mx-auto animate-fade-in overflow-hidden">
      <FolderSidebar
        folders={folders}
        currentFolderId={currentFolderId}
        onSelectFolder={setCurrentFolderId}
        onCreateFolder={createFolder}
        onDeleteFolder={removeFolder}
        tracks={library}
        selectedFilters={filters}
        onFilterChange={setFilters}
      />

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-background/95 p-1 backdrop-blur pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              {currentFolderId
                ? folders.find((f) => f.id === currentFolderId)?.name
                : 'Acervo Geral'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {libraryTracks.length} faixas listadas
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto items-center flex-wrap">
            <Button
              variant={isOfflineMode ? 'default' : 'outline'}
              size="sm"
              onClick={toggleOfflineMode}
              className={cn(
                'gap-2 transition-all',
                isOfflineMode
                  ? 'bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(191,255,0,0.3)]'
                  : 'hover:border-primary/50',
              )}
            >
              {isOfflineMode ? (
                <WifiOff className="w-4 h-4" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              {isOfflineMode ? 'Modo Offline' : 'Online'}
            </Button>

            <Link to="/settings">
              <Button
                variant="outline"
                className="shadow-sm gap-2 border-white/10 hover:border-white/30"
              >
                <img
                  src="https://img.usecurling.com/i?q=google&shape=fill"
                  className="w-4 h-4"
                  alt="Drive"
                />
                <span className="hidden sm:inline">Google Drive</span>
              </Button>
            </Link>

            {currentFolderId && (
              <Button
                onClick={() => handlePlayContext(0)}
                variant="secondary"
                className="mr-2"
              >
                <Play className="w-4 h-4 mr-2" /> Tocar Pasta
              </Button>
            )}

            <div className="flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept=".mp3,audio/*"
                onChange={handleFileChange}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Adicionar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleImportClick}>
                    <FolderInput className="w-4 h-4 mr-2" /> Importar Local
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsPlaylistDialogOpen(true)}
                  >
                    <List className="w-4 h-4 mr-2" /> Criar Playlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative flex-1 md:w-56 ml-2">
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-card border-border"
              />
            </div>

            <div className="border border-border rounded-md flex overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-none',
                  viewMode === 'grid' && 'bg-secondary/50',
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-none',
                  viewMode === 'list' && 'bg-secondary/50',
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 p-2 rounded-md flex items-center justify-between animate-fade-in-down">
            <span className="text-sm font-medium ml-2 text-primary">
              {selectedItems.length} selecionados
            </span>
            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Folder className="w-4 h-4 mr-2" /> Mover para...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleMoveToFolder(undefined)}
                  >
                    Raiz (Sem Pasta)
                  </DropdownMenuItem>
                  {folders.map((f) => (
                    <DropdownMenuItem
                      key={f.id}
                      onClick={() => handleMoveToFolder(f.id)}
                    >
                      {f.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleBulkDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash className="w-4 h-4 mr-2" /> Excluir
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' ? (
            <div className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
              <div className="p-2 space-y-1">
                {libraryTracks.length > 0 ? (
                  libraryTracks.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      isPlaying={isPlaying}
                      isCurrent={currentTrack?.id === track.id}
                      isSelected={selectedItems.includes(track.id)}
                      onSelect={() => toggleSelection(track.id)}
                      showSelect
                      onPlay={() => {
                        if (currentTrack?.id === track.id) togglePlay()
                        else handlePlayContext(idx)
                      }}
                      onAddToQueue={() => addToQueue([track])}
                      onEdit={() => setTrackToEdit(track)}
                      onDelete={() => handleDelete(track.id)}
                      onMoveToFolder={(fid) =>
                        updateTrack({ ...track, folderId: fid })
                      }
                      folders={folders}
                    />
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center gap-6 text-muted-foreground">
                    <FolderInput className="w-16 h-16 opacity-10" />
                    <div>
                      <p className="text-lg font-medium mb-1">
                        Nenhum arquivo encontrado
                      </p>
                      <p className="text-sm opacity-60">
                        Tente importar do Google Drive ou adicionar arquivos
                        locais.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {libraryTracks.map((track, idx) => (
                <div
                  key={track.id}
                  className="group relative flex flex-col gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                >
                  <div className="aspect-square rounded-lg bg-black/40 overflow-hidden relative shadow-lg">
                    {track.cover ? (
                      <img
                        src={track.cover}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <List className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="icon"
                        className="rounded-full h-12 w-12 bg-primary text-black hover:bg-white"
                        onClick={() => handlePlayContext(idx)}
                      >
                        <Play className="w-5 h-5 ml-1" />
                      </Button>
                    </div>
                    {track.offlineAvailable && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-black shadow-lg">
                        <CloudDownload className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm truncate text-white">
                      {track.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.composer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <EditTrackDialog
        track={trackToEdit}
        isOpen={!!trackToEdit}
        onClose={() => setTrackToEdit(null)}
        onSave={updateTrack}
      />
      <CreatePlaylistDialog
        isOpen={isPlaylistDialogOpen}
        onClose={() => setIsPlaylistDialogOpen(false)}
        onCreate={createPlaylist}
      />
      <ImportStreamDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />
    </div>
  )
}
