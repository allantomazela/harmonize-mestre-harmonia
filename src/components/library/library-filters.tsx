import { useState, useMemo } from 'react'
import { Track } from '@/hooks/use-audio-player-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LibraryFiltersProps {
  tracks: Track[]
  selectedFilters: {
    genres: string[]
    composers: string[]
    albums: string[]
  }
  onFilterChange: (filters: {
    genres: string[]
    composers: string[]
    albums: string[]
  }) => void
}

export function LibraryFilters({
  tracks,
  selectedFilters,
  onFilterChange,
}: LibraryFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const genres = useMemo(
    () => Array.from(new Set(tracks.map((t) => t.genre).filter(Boolean))),
    [tracks],
  ) as string[]
  const composers = useMemo(
    () => Array.from(new Set(tracks.map((t) => t.composer).filter(Boolean))),
    [tracks],
  ) as string[]
  const albums = useMemo(
    () => Array.from(new Set(tracks.map((t) => t.album).filter(Boolean))),
    [tracks],
  ) as string[]

  const filteredGenres = genres.filter((g) =>
    g.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const filteredComposers = composers.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const filteredAlbums = albums.filter((a) =>
    a.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleFilter = (
    type: 'genres' | 'composers' | 'albums',
    value: string,
  ) => {
    const current = selectedFilters[type]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onFilterChange({ ...selectedFilters, [type]: next })
  }

  const clearFilters = () => {
    onFilterChange({ genres: [], composers: [], albums: [] })
    setSearchTerm('')
  }

  const hasActiveFilters =
    selectedFilters.genres.length > 0 ||
    selectedFilters.composers.length > 0 ||
    selectedFilters.albums.length > 0

  return (
    <div className="w-full flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            Limpar
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar filtros..."
          className="pl-8 h-9 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1 -mr-2 pr-2">
        <div className="space-y-6">
          {filteredGenres.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gêneros
              </h4>
              <div className="flex flex-wrap gap-2">
                {filteredGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedFilters.genres.includes(genre)
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                        : 'hover:bg-secondary hover:text-secondary-foreground',
                    )}
                    onClick={() => toggleFilter('genres', genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {filteredComposers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Artistas
              </h4>
              <div className="flex flex-col gap-1">
                {filteredComposers.map((composer) => (
                  <div
                    key={composer}
                    className={cn(
                      'flex items-center justify-between text-sm px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                      selectedFilters.composers.includes(composer)
                        ? 'bg-primary/20 text-primary font-medium'
                        : 'hover:bg-secondary/50 text-muted-foreground',
                    )}
                    onClick={() => toggleFilter('composers', composer)}
                  >
                    <span className="truncate">{composer}</span>
                    {selectedFilters.composers.includes(composer) && (
                      <X className="w-3 h-3 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredAlbums.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Álbuns
              </h4>
              <div className="flex flex-col gap-1">
                {filteredAlbums.map((album) => (
                  <div
                    key={album}
                    className={cn(
                      'flex items-center justify-between text-sm px-2 py-1.5 rounded-md cursor-pointer transition-colors',
                      selectedFilters.albums.includes(album)
                        ? 'bg-primary/20 text-primary font-medium'
                        : 'hover:bg-secondary/50 text-muted-foreground',
                    )}
                    onClick={() => toggleFilter('albums', album)}
                  >
                    <span className="truncate">{album}</span>
                    {selectedFilters.albums.includes(album) && (
                      <X className="w-3 h-3 ml-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
