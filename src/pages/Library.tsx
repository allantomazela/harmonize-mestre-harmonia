import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { musicLibrary, globalLibrary } from '@/lib/mock-data'
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Download,
  Trash,
  Heart,
  Play,
  Globe,
  Copy,
  Wifi,
  ListMusic,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function Library() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [globalSearch, setGlobalSearch] = useState('')
  const { toast } = useToast()

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleBulkAction = (action: string) => {
    toast({
      title: 'Ação realizada',
      description: `${action} aplicada a ${selectedItems.length} itens.`,
    })
    setSelectedItems([])
  }

  const handleClone = (trackTitle: string) => {
    toast({
      title: 'Música Importada',
      description: `${trackTitle} foi adicionada ao seu acervo local com sucesso.`,
    })
  }

  const filteredGlobalLibrary = globalLibrary.filter(
    (track) =>
      track.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      track.composer.toLowerCase().includes(globalSearch.toLowerCase()) ||
      track.tags.some((tag) =>
        tag.toLowerCase().includes(globalSearch.toLowerCase()),
      ),
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center sticky top-0 z-10 bg-background/95 p-1 backdrop-blur">
        <h1 className="text-3xl font-bold text-primary">Acervo</h1>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar música..."
              className="pl-9 bg-card border-border"
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros Avançados</SheetTitle>
                <SheetDescription>
                  Refine sua busca por grau e ritual.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Grau</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Aprendiz</SelectItem>
                      <SelectItem value="2">Companheiro</SelectItem>
                      <SelectItem value="3">Mestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

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

      <Tabs defaultValue="local" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="local">Meu Acervo</TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="w-3 h-3" /> Acervo Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local">
          {selectedItems.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 p-2 rounded-md flex items-center justify-between mb-4 animate-fade-in-down">
              <span className="text-sm font-medium ml-2 text-primary">
                {selectedItems.length} selecionados
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleBulkAction('Download')}
                >
                  <Download className="w-4 h-4 mr-2" /> Baixar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleBulkAction('Excluir')}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="w-4 h-4 mr-2" /> Excluir
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
                  Compositor
                </div>
                <div className="col-span-3 md:col-span-2">Ritual</div>
                <div className="col-span-2 md:col-span-1">Status</div>
                <div className="col-span-1"></div>
              </div>
              {musicLibrary.map((track) => (
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
                    <Link
                      to={`/library/${track.id}`}
                      className="hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {track.title || 'Sem título'}
                      {track.offlinePriority && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Wifi className="w-3 h-3 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Prioridade Offline</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </Link>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {track.composer || 'Desconhecido'}
                    </span>
                  </div>
                  <div className="col-span-3 md:col-span-3 hidden md:block text-muted-foreground">
                    {track.composer || 'Desconhecido'}
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <Badge variant="outline" className="text-xs">
                      {track.ritual || 'Geral'}
                    </Badge>
                  </div>
                  <div className="col-span-2 md:col-span-1 text-sm text-muted-foreground">
                    {track.isDownloaded ? (
                      <span className="flex items-center text-xs text-green-500">
                        <Download className="w-3 h-3 mr-1" /> Baixado
                      </span>
                    ) : (
                      <span className="text-xs">Nuvem</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          Adicionar à Playlist
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar Detalhes</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {musicLibrary.map((track) => (
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
                    {track.offlinePriority && (
                      <div className="absolute top-2 right-2 z-10 bg-background/80 rounded-full p-1">
                        <Wifi className="w-3 h-3 text-green-500" />
                      </div>
                    )}
                    <Music className="w-16 h-16 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        className="rounded-full bg-primary text-primary-foreground"
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
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {track.degree || 'Todos'}
                      </Badge>
                      {track.isFavorite && (
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <div className="flex gap-4 items-center bg-secondary/10 p-4 rounded-md border border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Pesquisar no Repositório Global..."
              className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 text-lg"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>

          <div className="rounded-md border border-border bg-card animate-fade-in">
            <div className="p-4 border-b border-border bg-secondary/10 flex justify-between items-center">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Repertório Compartilhado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore músicas e playlists compartilhadas por outras Lojas.
                </p>
              </div>
              <div className="hidden md:block">
                <Badge variant="outline" className="gap-1">
                  <ListMusic className="w-3 h-3" />5 Playlists Smart
                </Badge>
              </div>
            </div>

            {/* Simulated Shared Playlist for Demo */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">
                    Sessão Magna de Iniciação (Smart)
                  </h4>
                  <Badge variant="default" className="text-[10px]">
                    Playlist
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Loja União #123 • 12 faixas
                </p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    Solenidade
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    Smart Engine
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="hover:border-primary hover:text-primary"
                onClick={() => handleClone('Sessão Magna de Iniciação')}
              >
                <Copy className="w-4 h-4 mr-2" /> Importar Playlist
              </Button>
            </div>

            {filteredGlobalLibrary.length > 0 ? (
              filteredGlobalLibrary.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{track.title}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {track.degree}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {track.composer} • {track.lodge}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {track.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:border-primary hover:text-primary"
                    onClick={() => handleClone(track.title)}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Importar
                  </Button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nenhum resultado encontrado para "{globalSearch}"</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
