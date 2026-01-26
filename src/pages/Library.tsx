import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  MoreVertical,
  Trash,
  Play,
  LayoutGrid,
  List,
  Music,
  FolderInput,
  HardDrive,
  FileAudio,
} from 'lucide-react'
import { useAudioPlayer, Track } from '@/hooks/use-audio-player-context'
import { saveTrack, deleteTrack } from '@/lib/storage'

export default function Library() {
  const { queue, refreshLibrary, skipToIndex, addToQueue } = useAudioPlayer()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Filter queue for local library view
  const libraryTracks = queue.filter(
    (track) =>
      track.title.toLowerCase().includes(search.toLowerCase()) ||
      track.composer.toLowerCase().includes(search.toLowerCase()),
  )

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
        // Basic metadata extraction from filename
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
          duration: '0:00', // Needs audio element to parse duration properly, skipped for speed
          addedAt: Date.now(),
          degree: 'Geral',
          ritual: 'Livre',
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
        description: `${importedCount} arquivos adicionados ao acervo local.`,
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

    // Reset input
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

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center sticky top-0 z-10 bg-background/95 p-1 backdrop-blur border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <HardDrive className="w-8 h-8" /> Acervo Local
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus arquivos de áudio locais e offline.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto items-center">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="audio/*"
            onChange={handleFileChange}
          />
          <Button onClick={handleImportClick} className="shadow-sm">
            <FolderInput className="w-4 h-4 mr-2" /> Importar Arquivos
          </Button>

          <div className="relative flex-1 md:w-64 ml-2">
            <Input
              placeholder="Filtrar arquivos..."
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
            <Button
              size="sm"
              variant="ghost"
              onClick={handleBulkDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="w-4 h-4 mr-2" /> Excluir Selecionados
            </Button>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="rounded-md border border-border bg-card">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-1"></div>
            <div className="col-span-5 md:col-span-4">Título</div>
            <div className="col-span-3 md:col-span-3 hidden md:block">
              Compositor / Artista
            </div>
            <div className="col-span-3 md:col-span-2">Tipo</div>
            <div className="col-span-2 md:col-span-1">Duração</div>
            <div className="col-span-1"></div>
          </div>
          {libraryTracks.length > 0 ? (
            libraryTracks.map((track, index) => (
              <div
                key={track.id}
                className={cn(
                  'grid grid-cols-12 gap-4 p-4 items-center border-b border-border last:border-0 hover:bg-secondary/10 transition-colors',
                  selectedItems.includes(track.id) && 'bg-primary/5',
                )}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <Checkbox
                    checked={selectedItems.includes(track.id)}
                    onCheckedChange={() => toggleSelection(track.id)}
                  />
                </div>
                <div className="col-span-5 md:col-span-4 font-medium flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/20 rounded-md">
                      <FileAudio className="w-4 h-4 text-primary" />
                    </div>
                    <Link
                      to={`/library/${track.id}`}
                      className="hover:text-primary transition-colors truncate"
                    >
                      {track.title || 'Sem título'}
                    </Link>
                  </div>
                </div>
                <div className="col-span-3 md:col-span-3 hidden md:block text-muted-foreground truncate">
                  {track.composer || 'Desconhecido'}
                </div>
                <div className="col-span-3 md:col-span-2">
                  <Badge variant="outline" className="text-xs">
                    {track.isLocal ? 'Arquivo Local' : 'Demo Sistema'}
                  </Badge>
                </div>
                <div className="col-span-2 md:col-span-1 text-sm text-muted-foreground">
                  {track.duration || '--:--'}
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          // Find the index in the full queue
                          const idx = queue.findIndex((t) => t.id === track.id)
                          if (idx !== -1) skipToIndex(idx)
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" /> Reproduzir
                      </DropdownMenuItem>
                      {track.isLocal && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(track.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" /> Excluir Arquivo
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center flex flex-col items-center gap-4 text-muted-foreground">
              <FolderInput className="w-12 h-12 opacity-20" />
              <p>
                Nenhum arquivo encontrado. Importe arquivos do seu computador.
              </p>
              <Button variant="outline" onClick={handleImportClick}>
                Importar Agora
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {libraryTracks.map((track) => (
            <Card
              key={track.id}
              className={cn(
                'group overflow-hidden border-border transition-all hover:border-primary',
                selectedItems.includes(track.id) && 'ring-2 ring-primary',
              )}
            >
              <div className="relative aspect-square bg-secondary/30 flex items-center justify-center">
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedItems.includes(track.id)}
                    onCheckedChange={() => toggleSelection(track.id)}
                  />
                </div>
                {track.cover ? (
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    className="rounded-full bg-primary text-primary-foreground"
                    onClick={() => {
                      const idx = queue.findIndex((t) => t.id === track.id)
                      if (idx !== -1) skipToIndex(idx)
                    }}
                  >
                    <Play className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <Link to={`/library/${track.id}`} className="block">
                  <h3 className="font-semibold truncate hover:text-primary transition-colors">
                    {track.title || 'Sem título'}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground truncate">
                  {track.composer || 'Desconhecido'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
