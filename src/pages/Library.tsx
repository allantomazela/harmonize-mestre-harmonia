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
} from 'lucide-react'
import { useAudioPlayer, Track } from '@/hooks/use-audio-player-context'
import { saveTrack, deleteTrack } from '@/lib/storage'
import { FolderSidebar } from '@/components/library/folder-sidebar'
import { EditTrackDialog } from '@/components/library/edit-track-dialog'
import { CreatePlaylistDialog } from '@/components/library/create-playlist-dialog'
import { TrackRow } from '@/components/track-row'
import { cn } from '@/lib/utils'

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
  } = useAudioPlayer()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [trackToEdit, setTrackToEdit] = useState<Track | null>(null)
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false)
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
          duration: '0:00',
          addedAt: Date.now(),
          degree: 'Geral',
          ritual: 'Livre',
          folderId: currentFolderId || undefined,
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
        description: `${importedCount} arquivos adicionados${
          currentFolderId ? ' à pasta atual' : ''
        }.`,
      })
      refreshLibrary()
    }

    if (failedFiles.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Falha na Importação',
        description: `Não foi possível importar ${failedFiles.length} arquivos.`,
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
      if (id.startsWith('local-')) {
        await deleteTrack(id)
      }
    }
    toast({
      title: 'Exclusão em Massa',
      description: 'Itens locais selecionados foram removidos.',
    })
    setSelectedItems([])
    refreshLibrary()
  }

  const handleMoveToFolder = async (folderId: string | undefined) => {
    for (const id of selectedItems) {
      const track = library.find((t) => t.id === id)
      if (track && track.isLocal) {
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
              variant="outline"
              className="mr-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => setIsPlaylistDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> Criar Playlist
            </Button>

            {currentFolderId && (
              <Button
                onClick={() => handlePlayContext(0)}
                variant="secondary"
                className="mr-2"
              >
                <Play className="w-4 h-4 mr-2" /> Tocar Pasta
              </Button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept=".mp3,audio/mpeg,audio/wav,.wav,audio/ogg,.ogg,audio/flac,.flac,audio/x-m4a,.m4a"
              onChange={handleFileChange}
            />
            <Button onClick={handleImportClick} className="shadow-sm">
              <FolderInput className="w-4 h-4 mr-2" /> Importar
            </Button>

            <div className="relative flex-1 md:w-64 ml-2">
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
            <div className="rounded-md border border-border bg-card">
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
                        if (currentTrack?.id === track.id) {
                          togglePlay()
                        } else {
                          handlePlayContext(idx)
                        }
                      }}
                      onAddToQueue={() => addToQueue([track])}
                      onEdit={
                        track.isLocal ? () => setTrackToEdit(track) : undefined
                      }
                      onDelete={
                        track.isLocal ? () => handleDelete(track.id) : undefined
                      }
                      onMoveToFolder={
                        track.isLocal
                          ? (fid) => updateTrack({ ...track, folderId: fid })
                          : undefined
                      }
                      folders={folders}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center flex flex-col items-center gap-4 text-muted-foreground">
                    <FolderInput className="w-12 h-12 opacity-20" />
                    <p>Nenhum arquivo encontrado.</p>
                    <Button variant="outline" onClick={handleImportClick}>
                      Importar Agora
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
              {libraryTracks.map((track, idx) => (
                <div
                  key={track.id}
                  className="group relative flex flex-col gap-2 p-3 rounded-lg hover:bg-secondary/20 transition-all border border-transparent hover:border-border"
                >
                  <div className="aspect-square rounded-md bg-secondary overflow-hidden relative shadow-sm">
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
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="icon"
                        className="rounded-full h-12 w-12"
                        onClick={() => handlePlayContext(idx)}
                      >
                        <Play className="w-5 h-5 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm truncate">
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
    </div>
  )
}
